# iCloud Notes Clone - Project Setup Guide

**Created:** February 9, 2026  
**Sprint Duration:** 5 Days  
**Status:** Ready for Development

---

## 🚀 Quick Start

### 1. Clone Your Repo & Create Branch
```bash
git clone <your-repo-url>
cd icloud-notes-clone
git checkout -b feature/icloud-notes-autosave-backend
```

### 2. Set Up Project Structure
```bash
# Your repo should have this structure:
icloud-notes-clone/
├── docs/
│   ├── PRD.md (from icloud_notes_prd_refined.docx)
│   ├── DESIGN_SPEC.md (from icloud_notes_ui_spec.docx)
│   ├── FIGMA_INTEGRATION.md (from FIGMA_DESIGN_INTEGRATION_GUIDE.md)
│   └── claude-code-prompts.md (below)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── NotesApp.tsx (already provided)
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── NotesList.tsx
│   │   │   │   ├── NoteViewer.tsx
│   │   │   │   └── ui/ (shadcn components)
│   │   │   └── styles/
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
├── backend/
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   └── notes.ts
│   │   ├── models/
│   │   │   └── Note.ts
│   │   └── middleware/
│   ├── package.json
│   └── README.md
└── README.md (root)
```

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install

# Backend (create after)
cd ../backend
npm install
```

### 4. Start Dev Servers
```bash
# Terminal 1: Frontend (localhost:5173)
cd frontend
npm run dev

# Terminal 2: Backend (localhost:3000)
cd backend
npm run dev
```

---

## 📋 5-Day Sprint Breakdown

### Day 1: Architecture & Setup
**Goal:** Project structure, database schema, API routes defined

**Claude Code Prompts:**
1. Generate Express/Node backend boilerplate
2. Create database schema (PostgreSQL or MongoDB)
3. Scaffold CRUD API routes (POST/GET/PUT/DELETE /notes)

**Manual Tasks:**
- Create backend folder structure
- Set up environment variables (.env)
- Configure database connection

**Deliverable:** Backend API running, can create/read/update/delete notes

---

### Day 2: State Management & Frontend Wiring
**Goal:** React components talk to each other via Context

**Claude Code Prompts:**
1. Generate React Context for notes state
2. Create custom hooks (useNotes, useSelectedNote)
3. Add API client functions (fetchNotes, saveNote, deleteNote)

**Manual Tasks:**
- Copy Context into src/context/
- Update components to use Context
- Test sidebar → list → viewer communication

**Deliverable:** Components wired, clicking folders/notes shows data

---

### Day 3: Autosave & Persistence
**Goal:** 800ms debounce + blur autosave + IndexedDB fallback

**Claude Code Prompts:**
1. Create debounce utility function
2. Generate IndexedDB service (save/load notes locally)
3. Implement autosave in NoteViewer with revision handling

**Manual Tasks:**
- Add saving status indicator UI
- Test autosave triggers (keyboard input, blur)
- Verify data persists across refresh

**Deliverable:** Type in editor → auto-saves after 800ms & on blur

---

### Day 4: Polish & Features
**Goal:** Search, delete confirmation, error handling

**Claude Code Prompts:**
1. Implement search filtering in NotesList
2. Add delete confirmation dialog
3. Generate error boundaries & error handling

**Manual Tasks:**
- Test search functionality
- Refine UI/UX based on testing
- Adjust colors/spacing if needed

**Deliverable:** Search works, delete has confirmation, errors handled

---

### Day 5: Testing & Deployment
**Goal:** Manual testing, bug fixes, deploy

**Claude Code Tasks:**
1. Generate test utilities (optional, for quick tests)
2. Create deployment configs (Vercel for frontend, Railway/Heroku for backend)

**Manual Tasks:**
- End-to-end testing (create, edit, delete, search, autosave)
- Test offline behavior (IndexedDB fallback)
- Deploy frontend & backend
- Verify production links work

**Deliverable:** Live MVP with zero data loss guarantee

---

## 🤖 Using Claude Code with This Project

### Installation
```bash
npm install -g @anthropic-ai/claude-code
```

### Running Claude Code
```bash
cd /path/to/icloud-notes-clone
claude-code

# In Claude Code terminal, tell it:
# "I'm building an iCloud Notes clone with React + Node. 
#  Read the docs/ folder for PRD and design spec.
#  Day 1 task: Create Express backend with CRUD endpoints."
```

### Claude Code Best Practices
1. **Start with a clear spec:** Point Claude Code to docs/PRD.md
2. **One task per session:** Focus on one day's deliverable
3. **Review generated code:** Always check what Claude Code writes
4. **Commit frequently:** `git commit -am "Day 1: API scaffolding"`
5. **Test before merging:** Verify functionality works locally

---

## 📝 Daily Claude Code Prompts

### Day 1: Backend Setup
```
I'm building an iCloud Notes clone with React frontend + Node backend.

Read the files in docs/ for context (PRD, design spec, Figma integration).

Task: Create a backend API with:
1. Express.js server (port 3000)
2. PostgreSQL database (or MongoDB)
3. Note model: { id, title, body, revision, createdAt, updatedAt }
4. REST API endpoints:
   - POST /api/notes (create)
   - GET /api/notes (list all)
   - GET /api/notes/:id (get one)
   - PUT /api/notes/:id (update with revision check)
   - DELETE /api/notes/:id (delete)

Use TypeScript. Follow the PRD for autosave + race condition prevention.
Generate all files in backend/src/
```

### Day 2: State Management
```
I have a React frontend with three components (Sidebar, NotesList, NoteViewer).

Task: Create state management:
1. React Context (src/context/NotesContext.tsx) with:
   - notes array
   - selectedNote
   - searchQuery
   - selectedFolder
2. Custom hooks:
   - useNotes() → access global notes state
   - useSelectedNote() → access/update selected note
3. API client (src/utils/api.ts):
   - fetchNotes()
   - createNote()
   - updateNote(id, body)
   - deleteNote(id)

Make sure components can access state easily.
```

### Day 3: Autosave
```
I need autosave in the editor (NoteViewer component).

Task: Create autosave logic:
1. Debounce utility (src/utils/debounce.ts)
   - Trigger after 800ms inactivity
2. IndexedDB service (src/utils/indexeddb.ts)
   - Save note locally on every autosave
   - Restore if page refreshes
3. Autosave in NoteViewer:
   - Debounce on every keystroke
   - Save on blur (focus leaves editor)
   - Implement revision field for race condition prevention
   - Show "Saving..." → "Saved" status

Reference the PRD for revision numbering strategy.
```

### Day 4: Features
```
Task: Add search + delete + error handling:

1. Search filtering in NotesList
   - Filter notes by title/body
   - Highlight matching text (optional)

2. Delete confirmation dialog
   - Show "Are you sure?" before deleting
   - Use shadcn/ui Dialog component

3. Error handling
   - Error boundary component
   - Toast notifications for save errors
   - Retry logic for failed API calls
```

### Day 5: Deployment
```
Task: Prepare for deployment:

1. Build configs:
   - Frontend: Vercel deployment config
   - Backend: Railway or Heroku deployment config

2. Environment variables:
   - Create .env.example
   - Document required variables

3. Production checklist:
   - API CORS configured for production URL
   - Database migrations run
   - Error logging enabled
```

---

## 🔧 Tech Stack Reference

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React 18 | 18.3.1 |
| Frontend Build | Vite | 6.3.5 |
| Styling | Tailwind CSS | 4.1.12 |
| UI Components | shadcn/ui | Latest |
| Icons | lucide-react | 0.487.0 |
| Backend | Node.js | 18+ |
| Backend Framework | Express | 4.x |
| Language | TypeScript | Latest |
| Database | PostgreSQL or MongoDB | Latest |
| Persistence | IndexedDB | Browser native |

---

## 📦 Deliverables Checklist

### Day 1
- [ ] Backend folder created
- [ ] Express server running on port 3000
- [ ] Database connected
- [ ] CRUD endpoints tested with Postman/curl

### Day 2
- [ ] NotesContext created
- [ ] Components can read/write state
- [ ] API client functions work
- [ ] Sidebar/List/Viewer talk to each other

### Day 3
- [ ] Debounce utility created
- [ ] IndexedDB persistence works
- [ ] Autosave triggers on keystroke & blur
- [ ] Revision field prevents race conditions

### Day 4
- [ ] Search filters notes
- [ ] Delete shows confirmation
- [ ] Errors handled gracefully
- [ ] UI polished

### Day 5
- [ ] All features tested end-to-end
- [ ] Frontend deployed (Vercel)
- [ ] Backend deployed (Railway/Heroku)
- [ ] Production URLs verified

---

## 🐛 Troubleshooting

**Frontend won't start:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Backend won't connect to DB:**
- Check .env DATABASE_URL is correct
- Verify database is running
- Check firewall/network access

**Autosave not working:**
- Check browser console for errors
- Verify API endpoint is correct
- Test fetch in browser DevTools

**Git conflicts:**
```bash
# Always pull before pushing
git pull origin feature/icloud-notes-autosave-backend
git push origin feature/icloud-notes-autosave-backend
```

---

## 📞 Next Steps

1. **Share your repo URL** with me
2. **I'll create a comprehensive README** for your repo
3. **You clone locally** and create your feature branch
4. **You open Claude Code** and start Day 1 tasks
5. **I'm here** for debugging, clarification, refinement

---

## 🎯 Success Criteria

✅ Users can create notes (stored in DB)
✅ Users can edit notes (autosaved 800ms + blur)
✅ Users can search notes
✅ Users can delete notes
✅ Zero data loss (IndexedDB + server sync)
✅ Responsive three-column layout
✅ Deployed to production

Let's build! 🚀
