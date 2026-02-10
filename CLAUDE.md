# CLAUDE.md - Project Instructions for Claude Code

## Project Overview
iCloud Notes clone with React frontend + Express backend + PostgreSQL.

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
- Table auto-created on backend startup

## Architecture

### Backend API
- Base path: `/api/notes`
- Endpoints: POST `/`, GET `/`, GET `/:id`, PUT `/:id`, DELETE `/:id`
- Full endpoint docs: `backend/API.md`
- PUT uses revision field for optimistic concurrency (exact match only, else 409)
- Atomic `UPDATE ... WHERE revision = $incoming` prevents race conditions (see `backend/REVISION_LOGIC.md`)
- Revision increments by 1 on each successful update
- Title auto-derived from first line of note body (max 255 chars, fallback "New Note")
- UUID validation on all `:id` routes (returns 400 for invalid format)
- Error responses: 400 (bad input), 404 (not found), 409 (revision conflict), 500 (server error)
- `@types/express@5` requires `Request<{ id: string }>` for typed route params

### Frontend
- Figma components in `frontend/src/app/components/` (NotesApp, Sidebar, NotesList, NoteViewer)
- Vite proxies `/api` requests to `http://localhost:3000`
- API client: `frontend/src/utils/api.ts` (axios)
- State management: `frontend/src/context/NotesContext.tsx` (React Context, wired in Day 2)
- Dark theme with hex colors (e.g. `bg-[#1e1e1e]`)

### DB Schema
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  revision INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Conventions
- Use TypeScript strict mode in both frontend and backend
- Backend uses CommonJS modules; frontend uses ES modules
- Tailwind v3 with config file (not v4 CSS-based config)
- No semicolons omission — use semicolons consistently
- Icons from `lucide-react`
