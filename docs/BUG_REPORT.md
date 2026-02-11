# Bug Report — iCloud Notes Clone

**Generated:** February 2026  
**Scope:** Frontend (React/Vite) + Backend (Express/PostgreSQL)

---

## Executive Summary

Analysis of the iCloud Notes Clone codebase identified **8 potential bugs**, **3 UX issues**, and **several missing or incomplete features** across state management, event handling, API integration, and UI feedback. The most critical issues are Header action handlers not being available on initial load and autosave potentially using stale state when handling conflict responses.

---

## Functionality Inventory

Complete list of intended and implemented features, with status.

| # | Feature | Location | Status | Notes |
|---|---------|----------|--------|-------|
| 1 | Create note (Header + New Note) | Header, NotesList | ⚠️ Works, race possible | BUG-5 |
| 2 | Create note (empty state button) | NoteViewer | ✅ Works | |
| 3 | Create note (Cmd+N) | NotesContext | ✅ Works | |
| 4 | Delete note (Header Trash) | Header → NoteViewer | ⚠️ Works after load | BUG-1 |
| 5 | Search notes | Header, NotesList filter | ✅ Works | |
| 6 | Select note | NotesList | ✅ Works | |
| 7 | Edit note (textarea) | NoteViewer | ✅ Works | |
| 8 | Autosave (debounced) | NoteViewer | ⚠️ Works, BUG-2 on conflict | |
| 9 | Share note (Header) | Header → NoteViewer | ⚠️ Works after load | BUG-1 |
| 10 | Help modal (Header) | Header → NoteViewer | ⚠️ Works after load | BUG-1 |
| 11 | Account modal (Header) | Header → NoteViewer | ⚠️ Works after load | BUG-1 |
| 12 | Apps modal (Header) | Header → NoteViewer | ⚠️ Works after load | BUG-1 |
| 13 | Focus editor (Header pencil) | Header → NoteViewer | ⚠️ Works after load | BUG-1 |
| 14 | List format (insert bullet) | Header onListFormat | ⚠️ No feedback when no note | BUG-4 |
| 15 | Grid format (insert numbered) | Header onGridFormat | ⚠️ No feedback when no note | BUG-4 |
| 16 | Text align (cycle L/C/R) | onAlign | ❌ No UI | Handler wired but no Align button in Header |
| 17 | New folder (Sidebar) | Sidebar | ✅ Works | Opens modal |
| 18 | New folder (Cmd+Shift+N) | NotesContext | ✅ Works | |
| 19 | Select folder | Sidebar | ✅ Works | |
| 20 | Filter notes by folder | NotesList | ✅ Works | |
| 21 | Folders in localStorage | NotesContext | ✅ Works | Custom folders persist |
| 22 | API: Create note | api.ts, backend | ✅ Works | |
| 23 | API: List notes | api.ts, backend | ✅ Works | |
| 24 | API: Get note | api.ts, backend | ✅ Works | |
| 25 | API: Update note (revision) | api.ts, backend | ✅ Works | 409 on conflict |
| 26 | API: Delete note | api.ts, backend | ✅ Works | |
| 27 | Error boundary | ErrorBoundary.tsx | ✅ Works | Catches React errors |
| 28 | Inline toast (NoteViewer) | NoteViewer | ✅ Works | Share, align feedback |
| 29 | ToastContainer | ToastContainer.tsx | ❌ Not wired | ToastProvider not in App |
| 30 | ToastContext / showToast | ToastContext.tsx | ❌ Not wired | Used by offlineSync only |
| 31 | Offline sync | offlineSync.ts | ❌ Not wired | IndexedDB + sync logic exists |
| 32 | IndexedDB cache | indexedDb.ts | ❌ Not used | Used by offlineSync |
| 33 | debounce utility | debounce.ts | ❌ Not used | Autosave uses manual setTimeout |
| 34 | Tags section (Figma) | — | ❌ Not implemented | Design mentions collapsible Tags |
| 35 | Move note to folder | — | ❌ Not implemented | |
| 36 | Rename folder | — | ❌ Not implemented | |
| 37 | Delete folder | — | ❌ Not implemented | |
| 38 | List view vs Grid view (layout) | — | ❌ Misleading | Header icons insert formatting, not change layout |
| 39 | Sign in with Apple | Account modal | ⚠️ Placeholder | Button present, no auth |
| 40 | Error display | NoteViewer, NotesList | ✅ Works | Red text for API errors |
| 41 | Loading state | NotesList | ✅ Works | "Loading notes..." |
| 42 | Empty states | NotesList, NoteViewer | ✅ Works | |
| 43 | New Folder modal (Enter/Escape) | NotesApp | ✅ Works | |
| 44 | Modals backdrop close | NoteViewer, NotesApp | ✅ Works | Click outside to close |

---

## Critical / High Severity

### BUG-1: Header action handlers null on initial load

**Location:** `Header.tsx`, `NoteViewer.tsx`, `HeaderActionsContext.tsx`  
**Severity:** High

**Description:**  
The Header receives `handlers` from `HeaderActionsContext`. NoteViewer registers these handlers in a `useEffect` that runs after mount. On the first render, `headerHandlers` is `null`, so the Header renders with `onClick={handlers?.onDelete}` (etc.) — all `undefined`.

**Impact:**  
Trash, Share, Help, Account, Apps, List/Grid format, and Edit buttons do nothing until NoteViewer has mounted and triggered a re-render. Users who click immediately may think the app is broken.

**Root cause:**  
Handlers are registered asynchronously; the Header renders before they exist.

**Suggested fix:**  
- Eagerly register handlers (e.g. via refs) before the first paint, or  
- Show a loading/disabled state until handlers are available, or  
- Use a layout/initialization effect to ensure handlers exist before rendering interactive UI.

---

### BUG-2: Autosave conflict handler may use stale `notes` state

**Location:** `NoteViewer.tsx` lines 79–106, 149–158  
**Severity:** High

**Description:**  
The debounced autosave effect calls `handleSaveNote` from a closure. On 409 conflict, `handleSaveNote` does:

```ts
setNotes(notes.map((n) => (n.id === current.id ? current : n)));
```

`notes` comes from the closure at the time the effect ran, not from the latest render. If the user has created/deleted notes or changed the list while typing, `notes` can be stale.

**Impact:**  
On 409, the conflict resolution can overwrite the current notes list with an outdated snapshot (e.g. removing notes created in the meantime).

**Root cause:**  
Using `notes` from closure instead of the latest state.

**Suggested fix:**  
Use the functional form of `setNotes`:

```ts
setNotes((prev) => prev.map((n) => (n.id === current.id ? current : n)));
```

---

### BUG-3: Duplicate fetch on app mount

**Location:** `NotesApp.tsx` line 16–18, `NotesList.tsx` lines 40–51  
**Severity:** Medium

**Description:**  
Both NotesApp and NotesList fetch notes on mount:

- NotesApp: `fetchNotes().then(setNotes).catch(console.error)`
- NotesList: `getNotes().then(data => setNotes(data))`

**Impact:**  
Two parallel GET requests; the last to complete wins. Can cause a brief flicker and redundant network load.

**Suggested fix:**  
Centralize fetching (e.g. only in NotesApp) and pass notes down, or use a single shared fetch + cache.

---

## Medium Severity

### BUG-4: List/Grid format buttons do nothing when no note is selected

**Location:** `NoteViewer.tsx` `insertAtCursor`, Header `onListFormat` / `onGridFormat`  
**Severity:** Medium

**Description:**  
`insertAtCursor` returns early if `!selectedNote`. Header buttons call it unconditionally. When no note is selected, nothing happens and the user gets no feedback.

**Impact:**  
Users may click List or Grid with no note selected and wonder why nothing changes.

**Suggested fix:**  
Either focus the first note, open an empty note, or show a toast like “Select a note first”.

---

### BUG-5: `triggerCreateNote` depends on NotesList mount order

**Location:** `NotesContext.tsx`, `NotesList.tsx`, `Header.tsx`  
**Severity:** Medium

**Description:**  
`triggerCreateNote` calls `createNoteRef.current?.()`. NotesList registers the handler in `useEffect`. If the user clicks “+ New Note” before NotesList has mounted and run its effect, `createNoteRef.current` is null and nothing happens.

**Impact:**  
Rare race: fast click on New Note right after load may create no note.

**Suggested fix:**  
Register the create handler as early as possible (e.g. in NotesApp or a higher component) or ensure the Header is disabled until the handler is registered.

---

### BUG-6: 409 response shape mismatch risk

**Location:** `NoteViewer.tsx` line 95–97, `backend/routes/notes.ts` line 90–93  
**Severity:** Low (currently aligned)

**Description:**  
Frontend expects `err.response.data.currentNote`. Backend sends `{ error, currentNote }`. This matches today, but there is no shared type or validation.

**Impact:**  
If the backend response shape changes, conflict handling can break silently.

**Suggested fix:**  
Define a shared API contract (types, OpenAPI, etc.) and validate responses.

---

## Low Severity / Cleanup

### BUG-7: `offlineSync` and `ToastContext` not wired into app

**Location:** `offlineSync.ts`, `ToastContext.tsx`, `App.tsx`  
**Severity:** Low

**Description:**  
`offlineSync` and `ToastProvider` are not used in the main app. `showToast` in `ToastContext` is used by `offlineSync`, but the provider is never mounted.

**Impact:**  
If offline sync is later enabled, `showToast` may fail or have no effect.

**Suggested fix:**  
Add `ToastProvider` to the app tree if using toasts, and integrate offline sync if desired.

---

### BUG-8: `syncCreateNote` omits `folder` parameter

**Location:** `offlineSync.ts` line 53  
**Severity:** Low (offline sync not used)

**Description:**  
`syncCreateNote(body)` calls `createNote(body)` without a folder. The API supports `folder`.

**Impact:**  
If offline sync is used, new notes would always go to `'All iCloud'`.

**Suggested fix:**  
Add `folder` to `syncCreateNote` and pass it through to `createNote`.

---

## UX Issues (Non-blocking)

### UX-1: No feedback when Header actions fail

Header actions (Delete, Share, etc.) call handlers that can fail (e.g. network), but errors are not surfaced in the UI. Consider toasts or inline error messages.

### UX-2: Empty state “Create new note” uses anchor tag

The empty-state “Create new note” uses `<a href="#create">`. This can cause navigation quirks (e.g. scrolling). Prefer a `<button>` for consistency and accessibility.

### UX-3: No loading indicator for New Note

When creating a note, there is no loading state. On a slow connection, users may click again and create duplicates.

### UX-4: List/Grid icons mislabeled

Header "List view" and "Grid view" icons actually insert bullet (`- `) and numbered (`1. `) formatting at the cursor. They do not switch between list/grid layout. Users may expect layout changes.

### UX-5: No explicit Save button

Autosave replaced the Save button. Users have no way to force-save or confirm that content was saved. No "Saved" or "Saving..." indicator in the UI.

---

## Missing / Incomplete Features

### FEAT-1: Tags section (per Figma design)

Figma design specifies a collapsible Tags section in the Sidebar. Not implemented.

### FEAT-2: Move note to folder

No UI to move an existing note from one folder to another. Backend would need a folder update on PUT (or a PATCH endpoint).

### FEAT-3: Folder management

Cannot rename or delete folders. Custom folders are stored in localStorage only.

### FEAT-4: Offline support

`offlineSync.ts`, `indexedDb.ts`, `ToastProvider`, and `ToastContainer` exist but are not integrated. No offline creation, editing, or sync when back online.

### FEAT-5: `debounce` utility unused

`frontend/src/utils/debounce.ts` exists but is never imported. Autosave in NoteViewer uses a manual `setTimeout` instead.

### FEAT-6: Sign in with Apple

Account modal has a "Sign in with Apple" button but no authentication logic. Placeholder only.

### FEAT-7: Text alignment (Align) button

`onAlign` and `cycleAlign` are implemented and passed to Header, but there is no Align button in the Header UI. Users cannot trigger left/center/right alignment.

---

## Dead / Orphaned Code

| File / Export | Status |
|---------------|--------|
| `debounce.ts` | Exported but never imported |
| `ToastProvider`, `ToastContainer` | Defined but not in App tree |
| `showToast` (ToastContext) | Called by offlineSync; ToastProvider never mounted |
| `offlineSync.ts` (all exports) | Never imported or called |
| `indexedDb.ts` | Only used by offlineSync |
| `startOnlineListener` | Never called |

---

## Environment / Integration Notes

- **API base URL:** `VITE_API_URL=http://localhost:3000` — direct backend URL; CORS required.
- **Proxy:** Vite proxy `/api` → `http://localhost:3000`; only used when `VITE_API_URL` is unset.
- **Backend CORS:** Allows `localhost` and `127.0.0.1` on any port.
- **Database:** `folder` column added via `ALTER TABLE`; existing DBs may need migration.

---

## Recommended Fix Order

### High priority (bugs)
1. **BUG-2** — Fix autosave conflict handling (quick, high impact)
2. **BUG-1** — Fix Header handlers availability on load
3. **BUG-3** — Remove duplicate fetch
4. **BUG-4** — Add feedback for List/Grid with no note selected
5. **BUG-5** — Tighten create-note registration / ordering

### Medium priority (UX)
6. **UX-2** — Change empty-state "Create new note" from anchor to button
7. **UX-3** — Add loading indicator for New Note
8. **UX-4** — Clarify or fix List/Grid icon behavior
9. **UX-5** — Add save indicator or explicit Save option

### Lower priority (features / cleanup)
10. **FEAT-7** — Add Align button to Header (handler already exists)
11. **BUG-7** — Wire ToastProvider if offline sync is desired
12. **BUG-8** — Add folder param to syncCreateNote
13. **FEAT-1 through FEAT-6** — Per product roadmap

---

## Test Checklist

- [ ] Create note via Header “+ New Note”
- [ ] Create note via empty state “Create new note”
- [ ] Create note via Cmd+N
- [ ] Delete note via Header Trash
- [ ] Edit note, wait for autosave, verify save
- [ ] Simulate 409 (e.g. edit same note in two tabs), verify conflict handling
- [ ] Search notes
- [ ] Create folder via Cmd+Shift+N
- [ ] Filter by folder
- [ ] Share note
- [ ] Open Help, Account, Apps modals
