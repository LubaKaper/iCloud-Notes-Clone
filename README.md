# iCloud Notes Clone

A full-stack iCloud Notes clone built with React, Express, and PostgreSQL. Features a dark-themed three-column layout, folder organization, CRUD operations, autosave with debounce, and offline persistence via IndexedDB.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, TypeScript |
| Icons | lucide-react |
| Backend | Express 4, TypeScript |
| Database | PostgreSQL 17 |
| Offline Storage | IndexedDB |

## Project Structure

```
icloud-notes-clone/
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── app/components/ # UI components (NotesApp, Sidebar, NotesList, NoteViewer)
│   │   ├── context/        # NotesContext (notes, folders, selectedNote, selectedFolder)
│   │   ├── utils/          # api.ts (axios), offlineSync.ts, indexedDb.ts, debounce.ts
│   │   └── styles/         # Tailwind CSS entry
│   ├── vite.config.ts      # Proxies /api -> localhost:3000
│   └── package.json
├── backend/                # Express + PostgreSQL
│   ├── src/
│   │   ├── server.ts       # Express app, port 3000
│   │   ├── db.ts           # PostgreSQL pool + table/column init
│   │   ├── routes/
│   │   │   ├── notes.ts    # 5 REST endpoints for notes
│   │   │   └── folders.ts  # 4 REST endpoints for folders
│   │   ├── models/
│   │   │   ├── Note.ts     # Note interface + CRUD helpers
│   │   │   └── Folder.ts   # Folder interface + CRUD helpers
│   │   └── middleware/     # Error handler
│   └── package.json
└── docs/                   # PRD, design spec, setup guides
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 17 running locally (`brew services start postgresql@17`)

### 1. Backend
```bash
cd backend
cp .env.example .env        # Edit DATABASE_URL if needed
npm install
npm run dev                  # Starts on http://localhost:3000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev                  # Starts on http://localhost:5173
```

The Vite dev server proxies all `/api` requests to the backend, so no CORS issues in development.

## API Endpoints

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notes` | Create a note `{ body: string, folderId?: string }` |
| GET | `/api/notes` | List notes. Optional `?folderId=` to filter by folder |
| GET | `/api/notes/:id` | Get a single note |
| PUT | `/api/notes/:id` | Update a note `{ body: string, revision: number }` |
| DELETE | `/api/notes/:id` | Delete a note |

### Folders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/folders` | Create a folder `{ name: string }` |
| GET | `/api/folders` | List all folders (alphabetical) |
| PUT | `/api/folders/:id` | Rename a folder `{ name: string }` |
| DELETE | `/api/folders/:id` | Delete a folder (notes become uncategorized) |

**Revision handling:** PUT only succeeds if `incoming revision` matches stored revision exactly, then increments by 1. Returns 409 on conflict. Title is auto-derived from the first line of the body.

## Database Schema

```sql
CREATE TABLE folders (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notes (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  revision INTEGER NOT NULL DEFAULT 0,
  "folderId" UUID REFERENCES folders(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Both tables are auto-created (or migrated) when the backend starts.

---

## Features

### Notes
- Create, view, edit, delete notes
- Title auto-derived from the first line of the body (large heading in editor)
- Autosave: 800ms debounce after typing stops, plus immediate save on blur
- Notes list shows bold title, date, body preview, and folder name
- Search filters notes by title or body

### Folders
- Create folders via the "New Folder" button (prompted for a name)
- Select a folder to view only its notes
- "All iCloud" always shows all notes regardless of folder
- Delete a folder — its notes stay, they just become uncategorized
- Folder icon shown on each note in the list

### Persistence
- IndexedDB caches notes for offline access
- Pending creates/updates/deletes sync to server when back online
- Selected folder and note restored from `localStorage` on page reload

---

## Success Criteria

- Users can create, view, edit, and delete notes
- Autosave triggers after 800ms inactivity and on blur
- Notes are organized into folders; "All iCloud" shows everything
- Zero data loss (IndexedDB fallback + server sync)
- Three-column dark-themed layout matching iCloud design
- Selected folder and note persist across page reloads
