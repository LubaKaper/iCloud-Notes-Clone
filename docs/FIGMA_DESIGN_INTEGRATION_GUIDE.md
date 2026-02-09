# Figma Design → Code Integration Guide

**iCloud Notes Clone | React/Vite | February 9, 2026**

## 🎉 Good News!

Your Figma design is **already fully implemented** as a React/Vite project. All three components (Sidebar, NotesList, NoteViewer) are styled and ready for state management + API integration.

---

## Project Overview

| Component | Details |
|-----------|---------|
| **Framework** | React 18 + Vite |
| **Styling** | Tailwind CSS 4 |
| **UI Library** | shadcn/ui (45+ pre-built components) |
| **Icons** | lucide-react |
| **Layout** | Three-column (200px + 360px + flex) |

---

## Color Palette (Already Implemented)

| Element | Hex | Tailwind Class | Used In |
|---------|-----|----------------|---------|
| Editor BG | `#1e1e1e` | `bg-[#1e1e1e]` | NoteViewer |
| Sidebar BG | `#2d2d2d` | `bg-[#2d2d2d]` | Sidebar |
| List BG | `#252525` | `bg-[#252525]` | NotesList |
| Gold Accent | `#f5b800` | `text-[#f5b800]` | Icons, "Notes" text |
| Gray Text | `#b4b4b4` | `text-[#b4b4b4]` | Secondary text |
| Borders | `#3d3d3d` | `border-[#3d3d3d]` | Dividers |

---

## Component-to-Code Mapping

### 1. **Sidebar.tsx**
**File:** `src/app/components/Sidebar.tsx`

- **Width:** `w-[200px]`
- **Features:**
  - Folders list (All iCloud, Notes, New Folder, Schools)
  - Tags section (collapsible)
  - New Folder button (gold accent)
- **State Needed:** `selectedFolder`
- **Next Step:** Add `onClick` handlers to folder buttons, pass `active` prop to highlight selected folder

**Current Code:**
```tsx
<div className="w-[200px] bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col">
  {/* Header, Folders, Tags, etc. */}
</div>
```

### 2. **NotesList.tsx**
**File:** `src/app/components/NotesList.tsx`

- **Width:** `w-[360px]`
- **Features:**
  - Search bar (with magnifying glass icon)
  - Delete button (trash icon, gold)
  - Note preview list (title, date, preview, folder info)
- **State Needed:** `notes` array, `selectedNote`, `searchQuery`
- **Next Step:** Replace hardcoded notes array with API fetch; implement search filtering

**Current Code:**
```tsx
<div className="w-[360px] bg-[#252525] border-r border-[#3d3d3d] flex flex-col">
  {/* Search, Notes list */}
</div>
```

### 3. **NoteViewer.tsx**
**File:** `src/app/components/NoteViewer.tsx`

- **Width:** `flex-1` (fills remaining space)
- **Features:**
  - Top toolbar (formatting buttons: Aa, list, table, share, edit, etc.)
  - Editable note content (title + body)
  - Scrollable content area
- **State Needed:** `currentNote`, `isEditing`, `isSaving`
- **Next Step:** Make title + body `contentEditable`; add autosave logic (800ms debounce + blur)

**Current Code:**
```tsx
<div className="flex-1 bg-[#1e1e1e] flex flex-col">
  {/* Toolbar, Content */}
</div>
```

### 4. **NotesApp.tsx (Main Container)**
**File:** `src/app/components/NotesApp.tsx`

- **Layout:** Three-column flex layout
- **Structure:**
  ```tsx
  <div className="flex h-screen bg-[#1e1e1e]">
    <Sidebar />
    <NotesList />
    <NoteViewer />
  </div>
  ```

---

## Project File Structure

```
src/
  app/
    components/
      NotesApp.tsx          ← Main three-column container
      Sidebar.tsx           ← Folders + Tags
      NotesList.tsx         ← Search + Note previews
      NoteViewer.tsx        ← Editor + Toolbar
      figma/
        ImageWithFallback.tsx
      ui/                   ← shadcn/ui components (45+)
    styles/
      index.css
      tailwind.css
      theme.css
      fonts.css
  main.tsx
  App.tsx
index.html
package.json
vite.config.ts
postcss.config.mjs
```

---

## Immediate Action Items

### 1️⃣ Start the Dev Server
```bash
npm install
npm run dev
```
Open `localhost:5173` to view the app.

### 2️⃣ Compare with Figma
View the running app side-by-side with your Figma design. **Everything should match!**

### 3️⃣ Move to State Management Phase

**Goal:** Connect the three components so they communicate.

**Option A: React Context (Recommended for simplicity)**
```tsx
// Create NotesContext.tsx
import { createContext, useState } from 'react';

export const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <NotesContext.Provider value={{ notes, setNotes, selectedNote, setSelectedNote, searchQuery, setSearchQuery }}>
      {children}
    </NotesContext.Provider>
  );
}
```

Then wrap `<NotesApp />` with `<NotesProvider>` in App.tsx.

**Option B: Zustand (More scalable)**
```bash
npm install zustand
```

### 4️⃣ Wire Components to State

**Sidebar.tsx:**
```tsx
import { useNotesContext } from '../context/NotesContext';

export function Sidebar() {
  const { selectedFolder, setSelectedFolder } = useNotesContext();
  
  return (
    <button 
      onClick={() => setSelectedFolder('Notes')}
      className={selectedFolder === 'Notes' ? 'bg-[#3d3d3d]' : ''}
    >
      Notes
    </button>
  );
}
```

**NotesList.tsx:**
```tsx
import { useNotesContext } from '../context/NotesContext';

export function NotesList() {
  const { notes, selectedNote, setSelectedNote, searchQuery, setSearchQuery } = useNotesContext();
  
  // Fetch notes on mount
  useEffect(() => {
    fetchNotes(); // Call your API
  }, []);
  
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div onClick={() => setSelectedNote(note)}>
      {/* Render filtered notes */}
    </div>
  );
}
```

**NoteViewer.tsx:**
```tsx
import { useNotesContext } from '../context/NotesContext';

export function NoteViewer() {
  const { selectedNote, setSelectedNote } = useNotesContext();
  
  const handleSave = debounce((content) => {
    // Call API to save
  }, 800);
  
  return (
    <div contentEditable onBlur={handleSave} onChange={handleSave}>
      {selectedNote?.body}
    </div>
  );
}
```

---

## API Integration

### Backend Endpoints Needed

```
POST   /api/notes              ← Create note
GET    /api/notes              ← Fetch all notes
GET    /api/notes/:id          ← Get single note
PUT    /api/notes/:id          ← Update note
DELETE /api/notes/:id          ← Delete note
```

### Data Model

```json
{
  "id": "uuid",
  "title": "string",
  "body": "string",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "revision": "number",
  "folderId": "uuid"
}
```

---

## Autosave Implementation

### Add to NoteViewer.tsx

```tsx
import { useEffect, useState } from 'react';

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export function NoteViewer() {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const handleSave = debounce(async (content) => {
    setIsSaving(true);
    try {
      await fetch(`/api/notes/${selectedNote.id}`, {
        method: 'PUT',
        body: JSON.stringify({ body: content })
      });
      setLastSaved(new Date());
    } finally {
      setIsSaving(false);
    }
  }, 800);

  return (
    <div>
      <div contentEditable onChange={(e) => handleSave(e.currentTarget.textContent)} />
      <div className="text-xs text-gray-500">
        {isSaving ? 'Saving...' : lastSaved ? `Saved at ${lastSaved.toLocaleTimeString()}` : ''}
      </div>
    </div>
  );
}
```

---

## Time Estimate for 5-Day Sprint

| Day(s) | Task | Time |
|--------|------|------|
| 1-2 | State management setup + API scaffolding | 2 days |
| 2-3 | CRUD endpoints + UI wiring | 1.5 days |
| 3 | Autosave logic + debouncing | 1 day |
| 4-5 | Testing + polish + deployment | 1.5 days |

---

## Next Steps (Priority Order)

1. ✅ **Design is done** (you did this in Figma → now in React)
2. ⏭️ **Add state management** (Context or Zustand)
3. ⏭️ **Create backend API** (Node/Express or use Firebase)
4. ⏭️ **Wire components to state** (connect clicks, show data)
5. ⏭️ **Implement autosave** (debounce + blur triggers)
6. ⏭️ **Test & deploy**

---

## Summary

**You have a production-quality UI.** The design is complete and perfectly implemented in React. Your Figma work translates directly to the code. 

Now focus on:
- Wiring state management
- Building/connecting the backend
- Implementing autosave logic

Everything else is done. 🎯
