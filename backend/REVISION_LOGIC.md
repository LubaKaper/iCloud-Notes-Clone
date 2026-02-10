# Revision Logic — Optimistic Concurrency Control

## Why the Revision Field Exists

Without revision tracking, two users editing the same note simultaneously would silently overwrite each other's changes. The last save wins, and the first user's edits are lost forever.

The `revision` field prevents this by acting as a version number. Every update must provide the exact current revision to succeed. If another update happened in between, the revision won't match, and the server rejects the request with a 409 Conflict.

## How It Works

1. **Create**: Note starts with `revision: 0`
2. **Update**: Client sends `{ body, revision }`. Server atomically checks `WHERE revision = $incoming` and sets `revision = revision + 1`
3. **Conflict**: If the revision doesn't match (stale, too old, or too high), the server returns 409 with the current note so the client can resolve

### Accepted vs Rejected

| Incoming Revision | Stored Revision | Result |
|-------------------|-----------------|--------|
| 2 (exact match)   | 2               | 200 OK, revision becomes 3 |
| 1 (stale)         | 2               | 409 Conflict |
| 0 (way too old)   | 2               | 409 Conflict |
| 99 (too high)     | 2               | 409 Conflict |

Only an **exact match** succeeds. This is intentional — the client must prove it has seen the latest version before writing.

## Race Condition Prevention

The update uses a single atomic SQL statement:

```sql
UPDATE notes
SET title = $1, body = $2, revision = revision + 1, "updatedAt" = $3
WHERE id = $4 AND revision = $5
RETURNING ...
```

This is critical. A naive approach (SELECT then UPDATE) has a TOCTOU race condition:

```
User A: SELECT → sees revision 2
User B: SELECT → sees revision 2
User A: UPDATE SET revision = 3 → succeeds
User B: UPDATE SET revision = 3 → also succeeds (data loss!)
```

The atomic `WHERE revision = $5` clause ensures only one concurrent update can succeed. PostgreSQL row-level locking guarantees that if two UPDATEs hit the same row simultaneously, one waits for the other to commit, then re-evaluates the WHERE clause.

## Two Users Editing Simultaneously — Example

```
Time    User A                          User B                          Server (revision)
─────   ──────                          ──────                          ─────────────────
t0      Opens note                      Opens note                      revision: 5
t1      Types "Hello"                   Types "World"                   revision: 5
t2      PUT {body:"Hello", rev:5}       —                               revision: 5 → 6
t3      200 OK (revision: 6)            —                               revision: 6
t4      —                               PUT {body:"World", rev:5}       revision: 6
t5      —                               409 Conflict                    revision: 6
        —                               (gets currentNote with rev:6)
t6      —                               Shows conflict to user          revision: 6
t7      —                               User resolves, PUT {rev:6}      revision: 6 → 7
```

User B sees the conflict, gets the latest version, and can merge or retry. No data is silently lost.

## Server Logging

The PUT endpoint logs every revision decision:

```
PUT /api/notes/<id> — incoming revision: 5
PUT /api/notes/<id> — 200 updated (new revision: 6)

PUT /api/notes/<id> — incoming revision: 5
PUT /api/notes/<id> — 409 conflict (stored revision: 6)
```
