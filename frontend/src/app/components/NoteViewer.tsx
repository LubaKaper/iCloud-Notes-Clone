import { useState, useEffect, useRef, useCallback } from 'react';
import { HelpCircle, Grid3x3, Share2, Edit3, AlignLeft, ListOrdered, Grid, Trash2, Settings, User, ExternalLink, LogOut } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { syncUpdateNote, syncDeleteNote, syncFetchNotes, syncCreateNote } from '../../utils/offlineSync';

function deriveTitle(body: string): string {
  const firstLine = body.split('\n')[0].trim();
  return firstLine.slice(0, 255) || 'New Note';
}

export function NoteViewer() {
  const { notes, setNotes, selectedNote, setSelectedNote, selectedFolder } = useNotes();
  const { addToast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [restBody, setRestBody] = useState('');
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSavingRef = useRef(false);
  const noteRef = useRef<{ id: string; revision: number } | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  // Close profile dropdown on click outside
  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Split body into title (first line) and rest on note selection
  useEffect(() => {
    const fullBody = selectedNote?.body ?? '';
    const newlineIdx = fullBody.indexOf('\n');
    if (newlineIdx === -1) {
      setTitle(fullBody);
      setRestBody('');
    } else {
      setTitle(fullBody.slice(0, newlineIdx));
      setRestBody(fullBody.slice(newlineIdx + 1));
    }
    if (selectedNote) {
      noteRef.current = { id: selectedNote.id, revision: selectedNote.revision };
    } else {
      noteRef.current = null;
    }
  }, [selectedNote?.id]);

  // Combine title + rest into full body
  const getFullBody = useCallback((t: string, r: string) => {
    return r ? `${t}\n${r}` : t;
  }, []);

  // Core save function
  const saveNote = useCallback(async (noteId: string, noteBody: string, revision: number) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const updated = await syncUpdateNote(noteId, noteBody, revision);
      noteRef.current = { id: updated.id, revision: updated.revision };
      const folderId = selectedFolder === 'All iCloud' ? undefined : selectedFolder;
      const refreshedNotes = await syncFetchNotes(folderId);
      setNotes(refreshedNotes);
      setSelectedNote(updated);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { currentNote?: typeof selectedNote } } };
      if (axiosErr.response?.status === 409 && axiosErr.response?.data?.currentNote) {
        const current = axiosErr.response.data.currentNote;
        noteRef.current = { id: current.id, revision: current.revision };
        setNotes(notes.map((n) => (n.id === current.id ? current : n)));
        setSelectedNote(current);
        addToast('Note was changed elsewhere. Refreshed with latest version.', 'warning');
      } else {
        addToast('Failed to save note', 'error');
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [selectedFolder, notes, setNotes, setSelectedNote, addToast]);

  // Debounced autosave (800ms)
  const scheduleSave = useCallback((fullBody: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (noteRef.current) {
        saveNote(noteRef.current.id, fullBody, noteRef.current.revision);
      }
    }, 800);
  }, [saveNote]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updateNote = (newTitle: string, newRestBody: string) => {
    const fullBody = getFullBody(newTitle, newRestBody);
    const derivedTitle = deriveTitle(fullBody);
    if (selectedNote) {
      setSelectedNote({ ...selectedNote, body: fullBody, title: derivedTitle });
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedNote.id ? { ...n, body: fullBody, title: derivedTitle } : n
        )
      );
      scheduleSave(fullBody);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    // Don't allow newlines in title field — pressing Enter moves to body
    if (newTitle.includes('\n')) return;
    setTitle(newTitle);
    updateNote(newTitle, restBody);
  };

  const handleRestBodyChange = (newRestBody: string) => {
    setRestBody(newRestBody);
    updateNote(title, newRestBody);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      bodyRef.current?.focus();
    }
  };

  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (noteRef.current && selectedNote) {
      const fullBody = getFullBody(title, restBody);
      saveNote(noteRef.current.id, fullBody, noteRef.current.revision);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (!window.confirm('Delete this note?')) return;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    setError(null);
    try {
      await syncDeleteNote(selectedNote.id);
      setNotes(notes.filter((n) => n.id !== selectedNote.id));
      setSelectedNote(null);
    } catch {
      addToast('Failed to delete note', 'error');
    }
  };

  const handleCreateNote = async () => {
    try {
      const folderId = selectedFolder === 'All iCloud' ? null : selectedFolder;
      const newNote = await syncCreateNote('', folderId);
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
      localStorage.setItem('selectedNoteId', newNote.id);
    } catch {
      addToast('Failed to create note', 'error');
    }
  };

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = 'auto';
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [title]);

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col">
      {/* Toolbar */}
      <div className="relative z-10 px-6 py-3 border-b border-[#2d2d2d] flex items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          <button
            type="button"
            onClick={handleDeleteNote}
            className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-[#f5b800]" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button type="button" className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer">
            <AlignLeft className="w-4 h-4 text-[#f5b800]" />
          </button>
          <button type="button" className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer">
            <ListOrdered className="w-4 h-4 text-[#b4b4b4]" />
          </button>
          <button type="button" className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer">
            <Grid className="w-4 h-4 text-[#b4b4b4]" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-end gap-3">
          <button type="button" className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer">
            <HelpCircle className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button type="button" className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer">
            <Grid3x3 className="w-5 h-5 text-[#b4b4b4]" />
          </button>

          {/* Profile avatar + dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="p-0.5 hover:bg-[#2d2d2d] rounded-full cursor-pointer focus:outline-none"
              title="Account"
            >
              {user?.pictureUrl ? (
                <img
                  src={user.pictureUrl}
                  alt={user.name ?? 'Profile'}
                  className="w-7 h-7 rounded-full object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#7e57c2] flex items-center justify-center text-white text-xs font-semibold select-none">
                  {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 w-[270px] bg-[#2d2d2d] border border-[#444] rounded-xl shadow-2xl z-50 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3">
                  <p className="text-white text-sm font-semibold leading-snug">{user?.name ?? 'Unknown User'}</p>
                  <p className="text-[#888] text-xs mt-0.5">{user?.email ?? ''}</p>
                </div>

                <div className="border-t border-[#444]" />

                {/* iCloud Settings (mock) */}
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#3a3a3a] cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm">iCloud Settings</span>
                </button>

                {/* Manage Apple Account (mock) */}
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#3a3a3a] cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white text-sm flex-1 text-left">Manage Apple Account</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#777] flex-shrink-0" />
                </button>

                <div className="border-t border-[#444]" />

                {/* Sign Out (functional) */}
                <button
                  type="button"
                  onClick={() => { setProfileOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#3a3a3a] cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-red-400 text-sm">Sign Out</span>
                </button>
              </div>
            )}
          </div>

          <button type="button" className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer">
            <Share2 className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button
            type="button"
            onClick={handleCreateNote}
            className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer"
            title="New Note"
          >
            <Edit3 className="w-5 h-5 text-[#f5b800]" />
          </button>
        </div>
      </div>

      {error && (
        <div className="px-6 py-2 text-red-500 text-sm">{error}</div>
      )}
      {/* Note Content */}
      <div className="flex-1 overflow-y-auto px-24 py-8">
        <div className="max-w-3xl">
          {selectedNote ? (
            <>
              <textarea
                ref={titleRef}
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleBlur}
                placeholder="Title"
                rows={1}
                className="w-full bg-transparent text-white text-4xl font-bold leading-tight resize-none outline-none placeholder:text-[#555] mb-4 overflow-hidden"
                spellCheck={false}
              />
              <textarea
                ref={bodyRef}
                value={restBody}
                onChange={(e) => handleRestBodyChange(e.target.value)}
                onBlur={handleBlur}
                placeholder="Start typing..."
                className="w-full min-h-[400px] bg-transparent text-white text-sm leading-relaxed resize-none outline-none placeholder:text-[#8e8e8e]"
                spellCheck={false}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-[#8e8e8e] text-sm">
              Select a note or create a new one
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
