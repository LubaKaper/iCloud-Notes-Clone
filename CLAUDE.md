# CLAUDE.md - Project Instructions for Claude Code

## Project Overview
iCloud Notes clone with React frontend + Express backend + PostgreSQL. Full folder support, autosave, offline IndexedDB persistence, and localStorage-based selection state.

## Directory Structure
- `frontend/` — React 18 + Vite + Tailwind v3 + TypeScript
- `backend/` — Express 4 + TypeScript + PostgreSQL
- `docs/` — PRD, design spec, setup guide

## Commands

### Backend (run from `backend/`)
- `npm run dev` — Start dev server with ts-node (port 3000)
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run compiled JS from `dist/`
- `npx tsc --noEmit` — Type-check without emitting

### Frontend (run from `frontend/`)
- `npm run dev` — Start Vite dev server (port 5173)
- `npm run build` — Type-check + production build
- `npm run preview` — Preview production build

### Database
- PostgreSQL 17 via Homebrew: `brew services start postgresql@17`
- Database: `icloud_notes` on localhost:5432
- Connection string: `postgres://luba@localhost:5432/icloud_notes`
- Tables auto-created/migrated on backend startup

## Architecture

### Backend API
- Notes base path: `/api/notes` — POST `/`, GET `/`, GET `/:id`, PUT `/:id`, DELETE `/:id`
- Folders base path: `/api/folders` — POST `/`, GET `/`, PUT `/:id`, DELETE `/:id`
- GET `/api/notes` accepts optional `?folderId=` query param to filter by folder
- POST `/api/notes` accepts optional `folderId` in request body
- PUT uses revision field for optimistic concurrency (exact match only, else 409)
- Revision increments by 1 on each successful update
- Title auto-derived from first line of note body (max 255 chars, fallback "New Note")
- UUID validation on all `:id` routes (returns 400 for invalid format)
- Error responses: 400 (bad input), 404 (not found), 409 (revision conflict), 500 (server error)
- `@types/express@5` requires `Request<{ id: string }>` for typed route params

### Frontend
- Components in `frontend/src/app/components/`: NotesApp, Sidebar, NotesList, NoteViewer
- Vite proxies `/api` requests to `http://localhost:3000`
- API client: `frontend/src/utils/api.ts` (axios) — includes Note + Folder interfaces and all CRUD functions
- State management: `frontend/src/context/NotesContext.tsx` — holds notes, folders, selectedNote, selectedFolder
- Autosave: 800ms debounce on keystroke + immediate save on blur (NoteViewer.tsx)
- Title shown as large `text-4xl font-bold` heading; body in separate textarea below
- New Note button is the compose icon (Edit3) in the top-right of NoteViewer toolbar
- `localStorage` persists `selectedFolderId` and `selectedNoteId` across reloads
- `NotesApp.tsx` does NOT fetch notes on mount — NotesList handles initial fetch with correct folder filter
- Dark theme with hex colors (e.g. `bg-[#1e1e1e]`)

### DB Schema
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

## Key Gotchas
- `folderId = NULL` means note is uncategorized — still shows in "All iCloud"
- `ON DELETE SET NULL` means deleting a folder keeps its notes (they become uncategorized)
- `selectedFolder` is either the string `'All iCloud'` or a folder UUID
- Do NOT add a top-level fetch in NotesApp — it overwrites folder-filtered results from NotesList
- NoteViewer splits `body` into a `title` textarea (first line) and `restBody` textarea (remaining lines); they are joined back as `title\nrestBody` for saves

## Conventions
- Use TypeScript strict mode in both frontend and backend
- Backend uses CommonJS modules; frontend uses ES modules
- Tailwind v3 with config file (not v4 CSS-based config)
- Semicolons consistently used
- Icons from `lucide-react`
