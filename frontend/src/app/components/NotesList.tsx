import { useEffect, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { getNotes, createNote } from '../../utils/api';

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
  const { notes, setNotes, selectedNote, setSelectedNote, searchQuery, setSearchQuery } = useNotes();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getNotes()
      .then((data) => {
        setNotes(data);
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch notes:', err);
        setError('Failed to load notes. Is the backend running on port 3000?');
      })
      .finally(() => setIsLoading(false));
  }, [setNotes]);

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote('');
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
      setError(null);
    } catch (err) {
      console.error('Failed to create note:', err);
      setError('Failed to create note');
    }
  };

  const q = (searchQuery || '').toLowerCase();
  const filteredNotes = notes.filter(
    (n) =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.body || '').toLowerCase().includes(q)
  );

  return (
    <div className="w-[360px] flex-shrink-0 bg-[#252525] border-r border-[#3d3d3d] flex flex-col">
      {/* Search Bar + New Note */}
      <div className="px-3 py-2 border-b border-[#3d3d3d] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1e1e1e] rounded-md px-3 py-1.5">
          <Search className="w-4 h-4 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search all notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#8e8e8e] outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleCreateNote}
          className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-[#353535] rounded text-[#f5b800] text-sm font-medium cursor-pointer"
          title="New Note"
        >
          <Plus className="w-5 h-5" />
          <span>New Note</span>
        </button>
      </div>
      {error && (
        <div className="px-3 py-2 text-red-500 text-sm">{error}</div>
      )}
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="px-4 py-8 text-center text-[#8e8e8e] text-sm">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#8e8e8e] text-sm">
            No notes yet. Click &quot;New Note&quot; to create one.
          </div>
        ) : (
        filteredNotes.map((note) => {
          const isActive = selectedNote?.id === note.id;
          const preview = (note.body || '').slice(0, 60).replace(/\n/g, ' ');
          return (
            <div
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className={`px-4 py-3 border-b border-[#2d2d2d] cursor-pointer ${
                isActive ? 'bg-[#2d2d2d]' : 'hover:bg-[#2a2a2a]'
              }`}
            >
              <div className="text-white text-sm font-medium mb-0.5">
                {note.title || 'Untitled'}
              </div>
              <div className="text-[#8e8e8e] text-xs mb-1">
                {formatDate(note.updatedAt)} {preview}
              </div>
              <div className="flex items-center gap-1 text-[#8e8e8e] text-xs">
                <span>📄</span>
                <span>All iCloud</span>
              </div>
            </div>
          );
        })
        )}
      </div>
    </div>
  );
}
