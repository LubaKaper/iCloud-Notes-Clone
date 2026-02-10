# Days 2-5 Split Plan: Backend (You) vs Frontend (Partner)

**Repo:** https://github.com/LubaKaper/iCloud-Notes-Clone.git  
**Your Branch:** `feature/backend-api`  
**Partner's Branch:** `feature/frontend-state-management`  
**Merge Strategy:** Each day, pull latest `main` before starting work

---

## 🎯 API Contract (Share This With Your Partner FIRST!)

Your partner needs to know what API endpoints exist and what data they return.

### **Backend API Endpoints** (You're building these)

```
POST /api/notes
├─ Body: { body: string }
├─ Response: { id: UUID, title: string, body: string, revision: 0, createdAt: timestamp, updatedAt: timestamp }
└─ Errors: 400 (missing body), 500 (server error)

GET /api/notes
├─ Response: [ { id, title, body, revision, createdAt, updatedAt }, ... ]
├─ Sorted by: updatedAt DESC
└─ Errors: 500

GET /api/notes/:id
├─ Response: { id, title, body, revision, createdAt, updatedAt }
└─ Errors: 404 (not found), 500

PUT /api/notes/:id
├─ Body: { body: string, revision: number }
├─ Logic: Only update if incoming revision >= stored revision
├─ Response: { id, title, body, revision, createdAt, updatedAt }
└─ Errors: 400 (missing fields), 404 (not found), 409 (revision conflict), 500

DELETE /api/notes/:id
├─ Response: { success: true }
└─ Errors: 404 (not found), 500
```

**Share this with your partner so they can mock API calls while you build!**

---

# BACKEND PLAN (YOU)

## DAY 2: Finalize Backend API & Test Thoroughly

**Goal:** All 5 endpoints fully working with proper error handling

### Tasks:

1. **Review Day 1 Backend Code**
   - [ ] Check if Claude Code generated all files
   - [ ] Verify `backend/src/server.ts` exists
   - [ ] Verify `backend/src/routes/notes.ts` exists
   - [ ] Verify `backend/src/models/Note.ts` exists
   - [ ] Verify `backend/.env.example` exists

2. **Set Up PostgreSQL Database**
   ```bash
   # Create database
   psql -U postgres
   CREATE DATABASE icloud_notes;
   \q
   
   # Create .env from template
   cp backend/.env.example backend/.env
   # Edit .env with your PostgreSQL password
   ```

3. **Install & Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   # Should see: "Server running on port 3000"
   ```

4. **Test All 5 Endpoints (Use Postman or curl)**
   ```bash
   # 1. Create note
   curl -X POST http://localhost:3000/api/notes \
     -H "Content-Type: application/json" \
     -d '{"body": "Test note\nMultiple lines"}'
   # Response should have: id, title: "Test note", body, revision: 0
   
   # 2. Get all notes
   curl http://localhost:3000/api/notes
   # Response should be array of notes
   
   # 3. Get one note (replace ID)
   curl http://localhost:3000/api/notes/{id-from-create}
   
   # 4. Update note (test revision checking)
   curl -X PUT http://localhost:3000/api/notes/{id} \
     -H "Content-Type: application/json" \
     -d '{"body": "Updated content", "revision": 0}'
   
   # 5. Delete note
   curl -X DELETE http://localhost:3000/api/notes/{id}
   
   # 6. Verify it's deleted
   curl http://localhost:3000/api/notes/{id}
   # Should return 404
   ```

5. **Fix Any Issues**
   - If endpoints don't work, ask Claude Code to fix them
   - Make sure CORS is enabled for `localhost:5173`
   - Make sure error responses are proper HTTP codes (400, 404, 409, 500)

6. **Create API Documentation File**
   ```bash
   cat > backend/API.md << 'EOF'
   # iCloud Notes API Documentation
   
   Base URL: http://localhost:3000
   
   ## Endpoints
   
   ### POST /api/notes
   Create a new note
   
   **Request:**
   ```json
   { "body": "string" }
   ```
   
   **Response (201):**
   ```json
   {
     "id": "uuid",
     "title": "string (derived from first line)",
     "body": "string",
     "revision": 0,
     "createdAt": "ISO timestamp",
     "updatedAt": "ISO timestamp"
   }
   ```
   
   ### GET /api/notes
   Get all notes (sorted by updatedAt DESC)
   
   **Response (200):**
   ```json
   [
     { "id": "uuid", "title": "...", "body": "...", "revision": 0, "createdAt": "...", "updatedAt": "..." }
   ]
   ```
   
   ### GET /api/notes/:id
   Get single note
   
   **Response (200):** Same as POST response
   **Errors:** 404 Not Found
   
   ### PUT /api/notes/:id
   Update note (checks revision to prevent race conditions)
   
   **Request:**
   ```json
   { "body": "string", "revision": number }
   ```
   
   **Response (200):** Updated note object
   **Errors:** 404 Not Found, 409 Conflict (if revision mismatch)
   
   ### DELETE /api/notes/:id
   Delete note
   
   **Response (200):**
   ```json
   { "success": true }
   ```
   
   **Errors:** 404 Not Found
   EOF
   ```

7. **Commit & Push**
   ```bash
   git add -A
   git commit -m "feat: Day 2 - Finalize backend API with all endpoints tested"
   git push origin feature/backend-api
   ```

### Day 2 Success Criteria:
- [ ] Backend running on localhost:3000
- [ ] All 5 endpoints tested and working
- [ ] Proper error handling (400, 404, 409, 500)
- [ ] CORS enabled for localhost:5173
- [ ] API.md documentation file created
- [ ] Code committed & pushed

---

## DAY 3: Autosave Logic & Race Condition Prevention

**Goal:** Backend ready for autosave from frontend (revision field working perfectly)

### Tasks:

1. **Verify Revision Field Works**
   - Test updating a note with correct revision ✅
   - Test updating with wrong revision → should get 409 Conflict ✅
   - Verify each update increments revision number

2. **Test Race Conditions**
   ```bash
   # Simulate two simultaneous updates
   
   # Get current note
   curl http://localhost:3000/api/notes/{id}
   # Note: "revision": 2
   
   # User 1 tries to update (revision 2 → 3)
   curl -X PUT http://localhost:3000/api/notes/{id} \
     -d '{"body": "Update from user 1", "revision": 2}'
   # Should succeed, returns revision: 3
   
   # User 2 tries to update with old revision (revision 2 → 3)
   curl -X PUT http://localhost:3000/api/notes/{id} \
     -d '{"body": "Update from user 2", "revision": 2}'
   # Should FAIL with 409 Conflict, returns current note (revision: 3)
   ```

3. **Make Sure Backend Handles Concurrent Requests**
   - Backend should NOT let two updates with same revision both succeed
   - Backend should return 409 with current note state so frontend can retry

4. **Document Revision Logic**
   ```bash
   cat > backend/REVISION_LOGIC.md << 'EOF'
   # Revision Field & Race Condition Prevention
   
   ## How It Works
   
   Each note has a `revision` field (integer, starts at 0).
   
   When frontend sends a PUT request:
   1. Frontend sends: { body: "...", revision: 2 }
   2. Backend checks: Is incoming revision >= stored revision?
   3. If YES → Update note, increment revision (2 → 3), return 200
   4. If NO → Don't update, return 409 Conflict with current note
   
   ## Why This Matters
   
   Prevents data loss when two users edit simultaneously:
   
   User A and B both open note with revision: 2
   
   User A edits, saves → revision becomes 3
   User B edits with revision 2, tries to save
   → Backend rejects (revision 2 < stored 3)
   → Frontend gets 409 with revision: 3
   → Frontend can show error: "Note was updated elsewhere, refresh?"
   
   ## Example Flow
   
   1. GET /api/notes/abc → { revision: 0, body: "Hello" }
   2. User edits to "Hello world"
   3. PUT /api/notes/abc { body: "Hello world", revision: 0 }
   4. Backend updates, returns { revision: 1, body: "Hello world" }
   5. User edits to "Hello world!"
   6. PUT /api/notes/abc { body: "Hello world!", revision: 1 }
   7. Backend updates, returns { revision: 2, body: "Hello world!" }
   EOF
   ```

5. **Add Logging for Debugging**
   - Add console.log for each PUT request showing revision check
   - This helps frontend developer debug if something goes wrong

6. **Commit & Push**
   ```bash
   git add -A
   git commit -m "feat: Day 3 - Verify revision field + race condition prevention"
   git push origin feature/backend-api
   ```

### Day 3 Success Criteria:
- [ ] Revision field increments on each update
- [ ] 409 Conflict returned when revision mismatch
- [ ] Concurrent request test passes
- [ ] Documentation files created
- [ ] Code committed & pushed

---

## DAY 4: Polish, Error Messages, & Edge Cases

**Goal:** Backend bulletproof - handles all edge cases gracefully

### Tasks:

1. **Improve Error Messages**
   - Make error responses helpful for frontend
   - Example: `{ error: "Note not found", code: "NOTE_NOT_FOUND", statusCode: 404 }`

2. **Test Edge Cases**
   ```bash
   # 1. Empty body
   curl -X POST http://localhost:3000/api/notes \
     -d '{"body": ""}'
   # Should return 400 with helpful error
   
   # 2. Very long body (test performance)
   curl -X POST http://localhost:3000/api/notes \
     -d '{"body": "' + (lots of text) + '"}'
   # Should handle it fine
   
   # 3. Missing content-type header
   curl -X POST http://localhost:3000/api/notes \
     -d '{"body": "test"}'
   # Should still work or give clear error
   
   # 4. Invalid JSON
   curl -X POST http://localhost:3000/api/notes \
     -d 'not json'
   # Should return 400
   
   # 5. Database down - restart PostgreSQL mid-request
   # Should return 500 with helpful message
   ```

3. **Add Request Logging Middleware**
   - Log all requests: method, path, status code, response time
   - Helps debug issues

4. **Test with Frontend Running**
   - Once partner has frontend running, test full flow
   - Backend → Frontend → Backend

5. **Commit & Push**
   ```bash
   git add -A
   git commit -m "feat: Day 4 - Error handling + edge cases tested"
   git push origin feature/backend-api
   ```

### Day 4 Success Criteria:
- [ ] All error messages helpful
- [ ] Edge cases handled
- [ ] Request logging working
- [ ] Tested with frontend
- [ ] Code committed & pushed

---

## DAY 5: Testing & Deployment

**Goal:** Backend deployed to production, tested end-to-end with frontend

### Tasks:

1. **Write Simple Backend Tests** (optional, but helpful)
   ```bash
   # Create test file
   cat > backend/test.sh << 'EOF'
   #!/bin/bash
   
   BASE_URL="http://localhost:3000"
   
   echo "Testing POST /api/notes..."
   RESPONSE=$(curl -s -X POST $BASE_URL/api/notes \
     -H "Content-Type: application/json" \
     -d '{"body": "Test note"}')
   
   NOTE_ID=$(echo $RESPONSE | jq -r '.id')
   echo "Created note: $NOTE_ID"
   
   echo "Testing GET /api/notes/$NOTE_ID..."
   curl -s $BASE_URL/api/notes/$NOTE_ID | jq .
   
   echo "Testing DELETE /api/notes/$NOTE_ID..."
   curl -s -X DELETE $BASE_URL/api/notes/$NOTE_ID | jq .
   EOF
   
   chmod +x backend/test.sh
   ./backend/test.sh
   ```

2. **Deploy Backend to Production**
   
   **Option A: Railway (Easiest)**
   ```bash
   # 1. Sign up at railway.app
   # 2. Create new project
   # 3. Connect your GitHub repo
   # 4. Railway auto-deploys
   # 5. Set environment variables in Railway dashboard
   ```
   
   **Option B: Heroku**
   ```bash
   # 1. Sign up at heroku.com
   # 2. Install Heroku CLI
   heroku login
   heroku create your-app-name
   git push heroku feature/backend-api:main
   heroku config:set DATABASE_URL=your-production-db-url
   ```

3. **Set Production Database**
   - Don't use localhost PostgreSQL in production!
   - Use managed database service:
     - Railway provides PostgreSQL
     - Heroku provides PostgreSQL
     - Or AWS RDS, DigitalOcean, etc.

4. **Test Production Backend**
   ```bash
   # Get your production URL from Railway/Heroku
   curl https://your-app.railway.app/api/notes
   # Should work!
   ```

5. **Share Production URL with Partner**
   - Partner's frontend will call this URL in production
   - Update frontend `.env` with production API URL

6. **Final Testing with Partner**
   - Both backend and frontend running in production
   - Test full user flow end-to-end
   - Create note → See in list → Edit → See autosave → Delete

7. **Commit & Push Final Code**
   ```bash
   git add -A
   git commit -m "feat: Day 5 - Backend production deployment"
   git push origin feature/backend-api
   
   # Create Pull Request on GitHub
   # Let partner review & merge
   ```

### Day 5 Success Criteria:
- [ ] Backend deployed to production
- [ ] Production API URL working
- [ ] Environment variables set
- [ ] End-to-end testing with frontend passed
- [ ] Code committed & pushed
- [ ] PR created for partner to review

---

# FRONTEND PLAN (PARTNER)

## DAY 2: State Management & Component Wiring

**Goal:** Components connected to each other via React Context, ready to receive API data

### Tasks:

1. **Create React Context for Notes State**
   ```bash
   # Partner creates: frontend/src/context/NotesContext.tsx
   
   mkdir -p frontend/src/context
   ```

   **File: frontend/src/context/NotesContext.tsx**
   ```tsx
   import { createContext, useState, useContext } from 'react';

   interface Note {
     id: string;
     title: string;
     body: string;
     revision: number;
     createdAt: string;
     updatedAt: string;
   }

   interface NotesContextType {
     notes: Note[];
     setNotes: (notes: Note[]) => void;
     selectedNote: Note | null;
     setSelectedNote: (note: Note | null) => void;
     searchQuery: string;
     setSearchQuery: (query: string) => void;
   }

   const NotesContext = createContext<NotesContextType | undefined>(undefined);

   export function NotesProvider({ children }) {
     const [notes, setNotes] = useState<Note[]>([]);
     const [selectedNote, setSelectedNote] = useState<Note | null>(null);
     const [searchQuery, setSearchQuery] = useState('');

     return (
       <NotesContext.Provider
         value={{ notes, setNotes, selectedNote, setSelectedNote, searchQuery, setSearchQuery }}
       >
         {children}
       </NotesContext.Provider>
     );
   }

   export function useNotes() {
     const context = useContext(NotesContext);
     if (!context) throw new Error('useNotes must be used within NotesProvider');
     return context;
   }
   ```

2. **Create API Client**
   ```bash
   mkdir -p frontend/src/utils
   ```

   **File: frontend/src/utils/api.ts**
   ```tsx
   import axios from 'axios';

   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

   const api = axios.create({
     baseURL: `${API_URL}/api`,
     headers: { 'Content-Type': 'application/json' },
   });

   export const notesAPI = {
     createNote: (body: string) => api.post('/notes', { body }),
     getNotes: () => api.get('/notes'),
     getNote: (id: string) => api.get(`/notes/${id}`),
     updateNote: (id: string, body: string, revision: number) =>
       api.put(`/notes/${id}`, { body, revision }),
     deleteNote: (id: string) => api.delete(`/notes/${id}`),
   };
   ```

3. **Create .env File**
   ```bash
   cat > frontend/.env << 'EOF'
   VITE_API_URL=http://localhost:3000
   EOF
   ```

4. **Wire Sidebar to Context**
   **Update: frontend/src/app/components/Sidebar.tsx**
   - Add click handlers to folders
   - Dispatch actions to context (will implement filtering in Day 4)

5. **Wire NotesList to Context**
   **Update: frontend/src/app/components/NotesList.tsx**
   - Fetch notes on mount using notesAPI.getNotes()
   - Display notes from context.notes
   - Handle click to select note
   - Update search query in context when user types

6. **Wire NoteViewer to Context**
   **Update: frontend/src/app/components/NoteViewer.tsx**
   - Display context.selectedNote (or empty state if none selected)
   - Handle create new note button
   - Show note title + body

7. **Update App.tsx to Wrap Provider**
   **File: frontend/src/App.tsx**
   ```tsx
   import { NotesProvider } from './context/NotesContext';
   import { NotesApp } from './app/components/NotesApp';

   export default function App() {
     return (
       <NotesProvider>
         <NotesApp />
       </NotesProvider>
     );
   }
   ```

8. **Test in Browser**
   ```bash
   cd frontend
   npm run dev
   # Should see components, but no data yet (backend not connected for real)
   ```

9. **Commit & Push**
   ```bash
   git add -A
   git commit -m "feat: Day 2 - State management + component wiring"
   git push origin feature/frontend-state-management
   ```

### Day 2 Success Criteria:
- [ ] React Context created
- [ ] API client functions created
- [ ] .env file with API URL
- [ ] Components wired to context
- [ ] App.tsx wraps provider
- [ ] Browser shows no console errors
- [ ] Code committed & pushed

---

## DAY 3: API Integration & Data Flow

**Goal:** Frontend fetches real data from backend, displays notes, creates/edits/deletes work

### Tasks:

1. **Fetch Notes on Mount**
   **Update: frontend/src/app/components/NotesList.tsx**
   ```tsx
   import { useEffect } from 'react';
   import { useNotes } from '../context/NotesContext';
   import { notesAPI } from '../utils/api';

   export function NotesList() {
     const { notes, setNotes } = useNotes();

     useEffect(() => {
       // Fetch notes when component mounts
       notesAPI.getNotes()
         .then(res => setNotes(res.data))
         .catch(err => console.error('Failed to fetch notes', err));
     }, []);

     return (
       // ... render notes from context.notes
     );
   }
   ```

2. **Create New Note**
   **Add to: frontend/src/app/components/NotesList.tsx or NotesApp.tsx**
   ```tsx
   const handleCreateNote = async () => {
     const newNote = await notesAPI.createNote('');
     setNotes([...notes, newNote.data]);
     setSelectedNote(newNote.data);
   };
   ```

3. **Select & Display Note**
   **Update: frontend/src/app/components/NotesList.tsx**
   - Click on note → calls setSelectedNote(note)
   
   **Update: frontend/src/app/components/NoteViewer.tsx**
   - Display selectedNote.title and selectedNote.body

4. **Edit Note (No Autosave Yet)**
   **Update: frontend/src/app/components/NoteViewer.tsx**
   ```tsx
   const handleBodyChange = (newBody: string) => {
     setSelectedNote({ ...selectedNote, body: newBody });
   };

   const handleSaveNote = async () => {
     await notesAPI.updateNote(
       selectedNote.id,
       selectedNote.body,
       selectedNote.revision
     );
     // Refresh notes list
     const updated = await notesAPI.getNotes();
     setNotes(updated.data);
   };
   ```

5. **Delete Note**
   **Add to: frontend/src/app/components/NotesList.tsx**
   ```tsx
   const handleDeleteNote = async (id: string) => {
     if (window.confirm('Delete this note?')) {
       await notesAPI.deleteNote(id);
       setNotes(notes.filter(n => n.id !== id));
       setSelectedNote(null);
     }
   };
   ```

6. **Test Full CRUD Flow**
   - [ ] Create note → appears in list
   - [ ] Select note → shows in editor
   - [ ] Edit note → save button works
   - [ ] Delete note → removed from list
   - [ ] Refresh page → notes persist (from backend)

7. **Handle Errors**
   ```tsx
   const [error, setError] = useState(null);

   const handleCreateNote = async () => {
     try {
       const newNote = await notesAPI.createNote('');
       setNotes([...notes, newNote.data]);
     } catch (err) {
       setError('Failed to create note');
     }
   };

   // Display error message in UI
   return (
     <>
       {error && <div className="text-red-500">{error}</div>}
       {/* ... rest of UI */}
     </>
   );
   ```

8. **Commit & Push**
   ```bash
   git add -A
   git commit -m "feat: Day 3 - API integration + CRUD operations"
   git push origin feature/frontend-state-management
   ```

### Day 3 Success Criteria:
- [ ] Notes fetch on load
- [ ] Can create new note
- [ ] Can select & edit note
- [ ] Can delete note
- [ ] All errors handled gracefully
- [ ] No console errors
- [ ] Code committed & pushed

---

## DAY 4: Autosave & Polish

**Goal:** Autosave works (800ms debounce + blur), search filters notes, UI polished

### Tasks:

1. **Create Debounce Utility**
   **File: frontend/src/utils/debounce.ts**
   ```tsx
   export function debounce(fn: (...args: any[]) => Promise<void>, delay: number) {
     let timeoutId: ReturnType<typeof setTimeout>;

     return async (...args: any[]) => {
       clearTimeout(timeoutId);
       timeoutId = setTimeout(() => fn(...args), delay);
     };
   }
   ```

2. **Add Autosave to NoteViewer**
   **Update: frontend/src/app/components/NoteViewer.tsx**
   ```tsx
   import { useState, useCallback } from 'react';
   import { debounce } from '../utils/debounce';
   import { useNotes } from '../context/NotesContext';
   import { notesAPI } from '../utils/api';

   export function NoteViewer() {
     const { selectedNote, setSelectedNote, notes, setNotes } = useNotes();
     const [isSaving, setIsSaving] = useState(false);
     const [lastSaved, setLastSaved] = useState<Date | null>(null);

     // Handle autosave
     const handleAutoSave = useCallback(
       debounce(async (noteId: string, body: string, revision: number) => {
         setIsSaving(true);
         try {
           const response = await notesAPI.updateNote(noteId, body, revision);
           setSelectedNote(response.data);
           setLastSaved(new Date());
           // Update notes list
           setNotes(notes.map(n => n.id === noteId ? response.data : n));
         } catch (err) {
           console.error('Autosave failed', err);
           // Show error to user
         } finally {
           setIsSaving(false);
         }
       }, 800),
       []
     );

     const handleBodyChange = (newBody: string) => {
       setSelectedNote({ ...selectedNote, body: newBody });
       if (selectedNote) {
         handleAutoSave(selectedNote.id, newBody, selectedNote.revision);
       }
     };

     const handleBlur = async () => {
       // Save immediately on blur
       if (selectedNote) {
         setIsSaving(true);
         try {
           const response = await notesAPI.updateNote(
             selectedNote.id,
             selectedNote.body,
             selectedNote.revision
           );
           setSelectedNote(response.data);
           setLastSaved(new Date());
         } catch (err) {
           console.error('Save failed', err);
         } finally {
           setIsSaving(false);
         }
       }
     };

     if (!selectedNote) return <div>Select a note</div>;

     return (
       <div className="flex-1 bg-[#1e1e1e] flex flex-col">
         {/* Toolbar */}
         <div className="px-6 py-3 border-b border-[#2d2d2d] flex justify-between">
           <div className="text-xs text-[#888]">
             {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
           </div>
         </div>

         {/* Editor */}
         <div className="flex-1 overflow-y-auto px-24 py-8">
           <input
             value={selectedNote.title}
             onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
             onBlur={handleBlur}
             className="text-4xl text-white bg-transparent outline-none mb-8 w-full"
             placeholder="Title"
           />
           <textarea
             value={selectedNote.body}
             onChange={(e) => handleBodyChange(e.target.value)}
             onBlur={handleBlur}
             className="w-full h-full text-[#e0e0e0] bg-transparent outline-none leading-relaxed"
             placeholder="Start typing..."
           />
         </div>
       </div>
     );
   }
   ```

3. **Implement Search Filter**
   **Update: frontend/src/app/components/NotesList.tsx**
   ```tsx
   const { notes, searchQuery, setSearchQuery } = useNotes();

   const filteredNotes = notes.filter(note =>
     note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     note.body.toLowerCase().includes(searchQuery.toLowerCase())
   );

   return (
     <div className="w-[360px] bg-[#252525] border-r border-[#3d3d3d] flex flex-col">
       <div className="px-3 py-2 border-b border-[#3d3d3d]">
         <input
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           placeholder="Search notes"
           className="w-full px-3 py-2 bg-[#1e1e1e] text-white outline-none"
         />
       </div>
       <div className="flex-1 overflow-y-auto">
         {filteredNotes.map(note => (
           <div key={note.id} onClick={() => setSelectedNote(note)} className="...">
             {note.title}
           </div>
         ))}
       </div>
     </div>
   );
   ```

4. **Add Delete Confirmation**
   **Update: frontend/src/app/components/NotesList.tsx**
   ```tsx
   const handleDeleteNote = async (id: string) => {
     if (window.confirm('Delete this note?')) {
       await notesAPI.deleteNote(id);
       setNotes(notes.filter(n => n.id !== id));
       setSelectedNote(null);
     }
   };
   ```

5. **Polish UI**
   - [ ] Dark theme looks good
   - [ ] Saving indicator visible
   - [ ] Search works smoothly
   - [ ] No layout shifts
   - [ ] Mobile responsive (if time)

6. **Test Autosave**
   - [ ] Edit note → wait 800ms → backend updates
   - [ ] Edit note → blur field → saves immediately
   - [ ] Edit note → other browser tab edits same note → should get 409 conflict
   - [ ] Refresh page → all notes still there with latest content

7. **Commit & Push**
   ```bash
   git add -A
   git commit -m "feat: Day 4 - Autosave + search + delete confirmation"
   git push origin feature/frontend-state-management
   ```

### Day 4 Success Criteria:
- [ ] Autosave works (800ms debounce)
- [ ] Autosave on blur works
- [ ] "Saving..." status visible
- [ ] Search filters notes
- [ ] Delete has confirmation
- [ ] No console errors
- [ ] Code committed & pushed

---

## DAY 5: Testing & Deployment

**Goal:** Frontend deployed to production, full end-to-end testing with backend

### Tasks:

1. **Update .env for Production**
   **File: frontend/.env.production** (or update frontend/.env)
   ```bash
   VITE_API_URL=https://your-backend-url.railway.app
   ```

2. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   # Should create dist/ folder
   ```

3. **Deploy Frontend to Vercel (Easiest)**
   ```bash
   # 1. Sign up at vercel.com
   # 2. Connect your GitHub repo
   # 3. Vercel auto-deploys when you push
   # 4. Set VITE_API_URL environment variable in Vercel dashboard
   ```

4. **End-to-End Testing**
   - [ ] Frontend loads from production URL
   - [ ] Can see notes list
   - [ ] Can create note
   - [ ] Can edit note
   - [ ] Autosave works
   - [ ] Can delete note
   - [ ] Search works
   - [ ] Refresh page → data persists
   - [ ] No console errors
   - [ ] No network errors

5. **Test with Partner's Backend**
   - Both of you access production URLs
   - Test simultaneously editing (revision conflict handling)
   - Verify error messages are helpful

6. **Performance Check**
   - [ ] Page loads in <2 seconds
   - [ ] API calls complete quickly (<500ms)
   - [ ] No memory leaks
   - [ ] Smooth typing in editor

7. **Commit & Push Final Code**
   ```bash
   git add -A
   git commit -m "feat: Day 5 - Frontend production deployment"
   git push origin feature/frontend-state-management
   
   # Create Pull Request on GitHub
   # Let backend partner review & merge
   ```

### Day 5 Success Criteria:
- [ ] Frontend deployed to production
- [ ] Production URL working
- [ ] Environment variables set
- [ ] End-to-end testing with backend passed
- [ ] No console/network errors
- [ ] Performance acceptable
- [ ] Code committed & pushed
- [ ] PR created for backend partner to review

---

# 🤝 Synchronization Points

**End of Each Day:**

```bash
# Both of you pull latest main
git checkout main
git pull origin main

# Then go back to your branch
git checkout feature/backend-api  # or feature/frontend-state-management
git merge main  # Get latest from other person
```

**Daily Standup (Optional but Helpful)**
- 5 mins sync: What did you do? Any blockers? What's next?
- Share production URLs once deployed
- Test together at end of each day

---

# 🚨 If Something Breaks

**Merge Conflicts?**
```bash
# Pull latest
git pull origin main

# If merge conflict:
# 1. Open conflicting files
# 2. Resolve conflicts (keep changes from both sides if possible)
# 3. Save files
git add -A
git commit -m "fix: Resolve merge conflicts"
```

**API Not Working?**
- Backend partner: Check console logs
- Frontend partner: Check Network tab in DevTools
- Share error messages in chat

**Can't Deploy?**
- Railway/Vercel won't let you push → Check build logs
- Database won't connect → Check .env variables
- API calls 404 → Wrong URL in .env?

---

# 📋 Final Checklist

**Backend (You)**
- [ ] Day 2: All 5 API endpoints working
- [ ] Day 3: Revision field tested + docs created
- [ ] Day 4: Error handling + edge cases
- [ ] Day 5: Deployed to production

**Frontend (Partner)**
- [ ] Day 2: Context + API client + wired components
- [ ] Day 3: Full CRUD working (create/read/update/delete)
- [ ] Day 4: Autosave + search + polish
- [ ] Day 5: Deployed to production

**Together**
- [ ] Both deployed to production
- [ ] End-to-end testing passed
- [ ] Can create/edit/delete notes
- [ ] Autosave working
- [ ] No errors in production

---

**Good luck! You've got this! 🚀**
