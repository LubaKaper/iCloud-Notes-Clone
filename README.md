# iCloud Notes Clone

A full-stack iCloud Notes clone built with React, Express, and PostgreSQL. Features a dark-themed three-column layout, CRUD operations, autosave with debounce, and offline persistence via IndexedDB.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, TypeScript |
| Icons | lucide-react |
| Backend | Express 4, TypeScript |
| Database | PostgreSQL 17 |
| Offline Storage | IndexedDB (Day 3) |

## Project Structure

```
icloud-notes-clone/
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── app/components/ # UI components (NotesApp, Sidebar, NotesList, NoteViewer)
│   │   ├── context/        # React Context for state management
│   │   ├── utils/          # API client (axios)
│   │   └── styles/         # Tailwind CSS entry
│   ├── index.html
│   ├── vite.config.ts      # Proxies /api -> localhost:3000
│   └── package.json
├── backend/                # Express + PostgreSQL
│   ├── src/
│   │   ├── server.ts       # Express app, port 3000
│   │   ├── db.ts           # PostgreSQL pool + table init
│   │   ├── routes/notes.ts # 5 REST endpoints
│   │   ├── models/Note.ts  # Note interface + CRUD helpers
│   │   └── middleware/      # Error handler
│   └── package.json
└── docs/                   # PRD, design spec, setup guides
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notes` | Create a note `{ body: string }` |
| GET | `/api/notes` | List all notes (sorted by updatedAt DESC) |
| GET | `/api/notes/:id` | Get a single note |
| PUT | `/api/notes/:id` | Update a note `{ body: string, revision: number }` |
| DELETE | `/api/notes/:id` | Delete a note |

**Revision handling:** PUT only succeeds if `incoming revision >= stored revision`, then increments. Returns 409 on conflict. Title is auto-derived from the first line of the body.

## Database Schema

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

The table is auto-created when the backend starts.

---

## 5-Day Sprint Checklist

### Day 1: Architecture & Setup
- [x] Express server running on port 3000
- [x] PostgreSQL database connected, table auto-created
- [x] All 5 CRUD endpoints built and tested
- [x] CORS configured for localhost:5173
- [x] Error handling middleware
- [x] Vite + React frontend running on port 5173
- [x] Tailwind CSS dark theme rendering
- [x] Figma components cleaned (placeholder data removed)
- [x] Vite proxy forwarding `/api` to backend
- [x] API client scaffolded (`frontend/src/utils/api.ts`)
- [x] NotesContext scaffolded (`frontend/src/context/NotesContext.tsx`)
- [x] Environment config files (`.env.example` for both)

### Day 2: State Management & Frontend Wiring
- [ ] NotesProvider wraps the app
- [ ] Components consume NotesContext (useNotes hook)
- [ ] Fetch notes from API on load, display in NotesList
- [ ] Click note in list -> show in NoteViewer
- [ ] Create new note -> calls POST, appears in list
- [ ] Edit note in NoteViewer -> calls PUT
- [ ] Delete note via trash icon -> calls DELETE
- [ ] Search bar filters notes by title/body

### Day 3: Autosave & Persistence
- [ ] Debounce utility (800ms inactivity trigger)
- [ ] Autosave on keystroke (debounced)
- [ ] Autosave on blur (immediate)
- [ ] Revision field sent with every update
- [ ] "Saving..." / "Saved" status indicator in UI
- [ ] IndexedDB service for offline storage
- [ ] Notes persist after page refresh via IndexedDB
- [ ] Sync IndexedDB with server on reconnect

### Day 4: Polish & Features
- [ ] Search filtering works in NotesList
- [ ] Delete confirmation dialog before removing notes
- [ ] Error boundary component
- [ ] Toast notifications for save errors
- [ ] Retry logic for failed API calls
- [ ] UI matches iCloud design (colors, spacing, typography)
- [ ] No console errors

### Day 5: Testing & Deployment
- [ ] End-to-end testing: create, edit, delete, search, autosave
- [ ] Offline behavior tested (IndexedDB fallback)
- [ ] Frontend deployed to Vercel
- [ ] Backend + PostgreSQL deployed to Railway/Render
- [ ] CORS updated for production URL
- [ ] Production URLs verified and working

---

## Success Criteria

- Users can create, view, edit, and delete notes
- Autosave triggers after 800ms inactivity and on blur
- Zero data loss (IndexedDB fallback + server sync)
- Three-column dark-themed layout matching iCloud design
- Deployed and accessible in production
