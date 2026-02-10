# iCloud Notes API

Base URL: `http://localhost:3000/api/notes`

## Endpoints

### POST /api/notes

Create a new note. Title is auto-derived from the first line of the body.

**Request:**

```json
{
  "body": "Shopping List\n- Milk\n- Eggs"
}
```

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "title": "Shopping List",
  "body": "Shopping List\n- Milk\n- Eggs",
  "revision": 0,
  "createdAt": "2026-02-10T01:50:09.320Z",
  "updatedAt": "2026-02-10T01:50:09.320Z"
}
```

**Errors:**
- `400` — `body` is missing or not a string

---

### GET /api/notes

List all notes, sorted by `updatedAt` descending (most recent first).

**Response:** `200 OK`

```json
[
  {
    "id": "uuid",
    "title": "Shopping List",
    "body": "Shopping List\n- Milk\n- Eggs",
    "revision": 0,
    "createdAt": "2026-02-10T01:50:09.320Z",
    "updatedAt": "2026-02-10T01:50:09.320Z"
  }
]
```

---

### GET /api/notes/:id

Get a single note by ID.

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "title": "Shopping List",
  "body": "Shopping List\n- Milk\n- Eggs",
  "revision": 0,
  "createdAt": "2026-02-10T01:50:09.320Z",
  "updatedAt": "2026-02-10T01:50:09.320Z"
}
```

**Errors:**
- `400` — Invalid UUID format
- `404` — Note not found

---

### PUT /api/notes/:id

Update a note. Requires `body` and `revision` fields. The revision must be >= the stored revision, otherwise the update is rejected with a 409. On success, revision is incremented by 1 and title is re-derived from the new body.

**Request:**

```json
{
  "body": "Updated Shopping List\n- Milk\n- Butter",
  "revision": 0
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "title": "Updated Shopping List",
  "body": "Updated Shopping List\n- Milk\n- Butter",
  "revision": 1,
  "createdAt": "2026-02-10T01:50:09.320Z",
  "updatedAt": "2026-02-10T01:50:45.927Z"
}
```

**Errors:**
- `400` — `body` missing/not a string, `revision` missing/not a number, or invalid UUID
- `404` — Note not found
- `409` — Revision conflict (response includes `currentNote` with the server's version)

---

### DELETE /api/notes/:id

Delete a note by ID.

**Response:** `200 OK`

```json
{
  "success": true
}
```

**Errors:**
- `400` — Invalid UUID format
- `404` — Note not found

---

## Error Response Format

All errors return a JSON object with an `error` field:

```json
{
  "error": "Description of the error"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad Request — missing/invalid fields or invalid UUID |
| 404 | Not Found — note does not exist |
| 409 | Conflict — revision mismatch (optimistic concurrency) |
| 500 | Internal Server Error |

## Note Schema

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key, auto-generated |
| title | string | Auto-derived from first line of body (max 255 chars) |
| body | string | Full note content |
| revision | integer | Starts at 0, increments on each update |
| createdAt | ISO 8601 | Creation timestamp |
| updatedAt | ISO 8601 | Last update timestamp |
