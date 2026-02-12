import { useEffect, useState } from 'react';
import { Search, Folder } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { useToast } from '../../context/ToastContext';
import { syncFetchNotes } from '../../utils/offlineSync';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays < 7) {
    return d.toLocaleDateString([], { weekday: 'short' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function NotesList() {
  const { notes, setNotes, selectedNote, setSelectedNote, searchQuery, setSearchQuery, selectedFolder, folders } = useNotes();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const folderId = selectedFolder === 'All iCloud' ? undefined : selectedFolder;
    syncFetchNotes(folderId)
      .then((data) => {
        setNotes(data);
        // Restore selected note from localStorage
        const savedNoteId = localStorage.getItem('selectedNoteId');
        if (savedNoteId) {
          const found = data.find((n) => n.id === savedNoteId);
          if (found) {
            setSelectedNote(found);
          } else {
            setSelectedNote(null);
          }
        } else {
          setSelectedNote(null);
        }
      })
      .catch(() => {
        addToast('Failed to load notes. Is the backend running?', 'error');
      })
      .finally(() => setIsLoading(false));
  }, [setNotes, addToast, selectedFolder, setSelectedNote]);

  const handleSelectNote = (note: typeof selectedNote) => {
    setSelectedNote(note);
    if (note) {
      localStorage.setItem('selectedNoteId', note.id);
    } else {
      localStorage.removeItem('selectedNoteId');
    }
  };

  const q = (searchQuery || '').toLowerCase();
  const filteredNotes = notes.filter(
    (n) =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.body || '').toLowerCase().includes(q)
  );

  // Get preview text: second line onward, skip first line (title)
  const getPreview = (body: string) => {
    const lines = (body || '').split('\n');
    const rest = lines.slice(1).join(' ').trim();
    return rest.slice(0, 80);
  };

  return (
    <div className="w-[360px] flex-shrink-0 bg-[#252525] border-r border-[#3d3d3d] flex flex-col">
      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-[#3d3d3d]">
        <div className="flex items-center gap-2 bg-[#1e1e1e] rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search all notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#8e8e8e] outline-none"
          />
        </div>
      </div>
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-[#8e8e8e] text-sm">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#8e8e8e] text-sm">
            No notes yet. Click the compose icon to create one.
          </div>
        ) : (
        filteredNotes.map((note) => {
          const isActive = selectedNote?.id === note.id;
          const preview = getPreview(note.body);
          const folderName = note.folderId
            ? (folders.find((f) => f.id === note.folderId)?.name ?? 'Folder')
            : 'Notes';
          return (
            <div
              key={note.id}
              onClick={() => handleSelectNote(note)}
              className={`px-4 py-3 mb-0.5 rounded-lg cursor-pointer ${
                isActive ? 'bg-[#3a3a3a]' : 'hover:bg-[#2e2e2e]'
              }`}
            >
              <div className="text-white text-base font-bold mb-0.5 truncate">
                {note.title || 'New Note'}
              </div>
              <div className="text-[#999] text-xs mb-1 truncate">
                <span className="text-[#999]">{formatDate(note.updatedAt)}</span>
                {preview && <span className="ml-2 text-[#777]">{preview}</span>}
              </div>
              <div className="flex items-center gap-1.5 text-[#777] text-xs">
                <Folder className="w-3 h-3" />
                <span>{folderName}</span>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
