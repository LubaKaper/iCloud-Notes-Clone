# API Contract - Share This With Your Frontend Partner

**Backend Base URL:** `http://localhost:3000` (dev) | `https://your-production-url.railway.app` (prod)

---

## POST /api/notes
**Create a new note**

**Request:**
```json
{
  "body": "string (required, can be multiline)"
}
```

**Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "First line of body",
  "body": "Full body text\ncan be multiline",
  "revision": 0,
  "createdAt": "2026-02-09T18:00:00Z",
  "updatedAt": "2026-02-09T18:00:00Z"
}
```

**Errors:**
- `400 Bad Request` - Missing or invalid body
- `500 Server Error` - Database error

---

## GET /api/notes
**Get all notes (sorted by updatedAt DESC)**

**Response (200 OK):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "First note",
    "body": "Content here",
    "revision": 2,
    "createdAt": "2026-02-09T17:00:00Z",
    "updatedAt": "2026-02-09T18:30:00Z"
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "Second note",
    "body": "More content",
    "revision": 0,
    "createdAt": "2026-02-09T16:00:00Z",
    "updatedAt": "2026-02-09T16:00:00Z"
  }
]
```

**Errors:**
- `500 Server Error` - Database error

---

## GET /api/notes/:id
**Get a single note by ID**

**URL Parameters:**
- `id` (UUID) - Note ID

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Note title",
  "body": "Note body",
  "revision": 2,
  "createdAt": "2026-02-09T17:00:00Z",
  "updatedAt": "2026-02-09T18:30:00Z"
}
```

**Errors:**
- `404 Not Found` - Note doesn't exist
- `500 Server Error` - Database error

---

## PUT /api/notes/:id
**Update a note (with revision checking for race condition prevention)**

**URL Parameters:**
- `id` (UUID) - Note ID

**Request:**
```json
{
  "body": "Updated content",
  "revision": 2
}
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Updated title",
  "body": "Updated content",
  "revision": 3,
  "createdAt": "2026-02-09T17:00:00Z",
  "updatedAt": "2026-02-09T18:45:00Z"
}
```

**Important:** `revision` increments on every successful update. Use the latest revision when updating, or you'll get a 409 Conflict.

**Errors:**
- `400 Bad Request` - Missing fields
- `404 Not Found` - Note doesn't exist
- `409 Conflict` - Revision mismatch (another user updated it)
  ```json
  {
    "error": "Revision conflict",
    "currentNote": { /* current state of note */ }
  }
  ```
- `500 Server Error` - Database error

---

## DELETE /api/notes/:id
**Delete a note**

**URL Parameters:**
- `id` (UUID) - Note ID

**Response (200 OK):**
```json
{
  "success": true
}
```

**Errors:**
- `404 Not Found` - Note doesn't exist
- `500 Server Error` - Database error

---

## How Revision Field Works (IMPORTANT!)

The `revision` field prevents data loss when two people edit the same note simultaneously.

**Example:**

1. User A and User B both open note with `revision: 2`

2. User A edits and saves:
   ```bash
   PUT /api/notes/abc { body: "A's update", revision: 2 }
   ```
   ✅ Success! Response has `revision: 3`

3. User B tries to save with old revision:
   ```bash
   PUT /api/notes/abc { body: "B's update", revision: 2 }
   ```
   ❌ Gets 409 Conflict, response includes current note with `revision: 3`

4. User B's frontend shows error: "Note was updated elsewhere. Refresh?"

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

---

## CORS

- Origin: `http://localhost:5173` (dev) | Your production domain (prod)
- Methods: GET, POST, PUT, DELETE
- Headers: Content-Type: application/json

---

## API Testing with curl

```bash
# Create note
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"body": "Hello\nWorld"}'

# Get all notes
curl http://localhost:3000/api/notes

# Get one note
curl http://localhost:3000/api/notes/{id}

# Update note
curl -X PUT http://localhost:3000/api/notes/{id} \
  -H "Content-Type: application/json" \
  -d '{"body": "Updated", "revision": 0}'

# Delete note
curl -X DELETE http://localhost:3000/api/notes/{id}
```

---

## Notes for Frontend Developer

1. **Always send the latest `revision`** when updating a note
2. **Handle 409 Conflict** by fetching the latest note and showing error
3. **Mock these endpoints** while waiting for backend (use mock data)
4. **API client functions** should be in `frontend/src/utils/api.ts`
5. **Environment variable** `VITE_API_URL` should point to backend URL
6. **Autosave** should:
   - Send requests after 800ms of inactivity
   - Also send on blur (field loses focus)
   - Include current revision to prevent conflicts
7. **All data** returned is read-only from your perspective—don't mutate response objects

---

**Questions? Ask your backend partner!**
