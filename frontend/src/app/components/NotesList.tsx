import { Search, Plus, Trash2 } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { createNote, deleteNote } from '../../utils/api';

export function NotesList() {
  const { notes, setNotes, selectedNote, setSelectedNote, searchQuery, setSearchQuery } = useNotes();

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = async () => {
    try {
      const note = await createNote('New Note');
      setNotes([note, ...notes]);
      setSelectedNote(note);
    } catch (err) {
      console.error('Failed to create note', err);
    }
  };

  const handleDeleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPreview = (body: string) => {
    const lines = body.split('\n');
    const preview = lines.slice(1).join(' ').trim();
    return preview.slice(0, 80) || 'No additional text';
  };

  return (
    <div className="w-[360px] bg-[#252525] border-r border-[#3d3d3d] flex flex-col">
      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-[#3d3d3d] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1e1e1e] rounded-md px-3 py-1.5">
          <Search className="w-4 h-4 text-[#8e8e8e]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all notes"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#8e8e8e] outline-none"
          />
        </div>
        <button
          onClick={handleCreateNote}
          className="p-1.5 hover:bg-[#353535] rounded"
          title="New Note"
        >
          <Plus className="w-5 h-5 text-[#f5b800]" />
        </button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 && (
          <div className="px-4 py-8 text-center text-[#8e8e8e] text-sm">
            {searchQuery ? 'No matching notes' : 'No notes yet'}
          </div>
        )}
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => setSelectedNote(note)}
            className={`group px-4 py-3 border-b border-[#2d2d2d] cursor-pointer ${
              selectedNote?.id === note.id ? 'bg-[#2d2d2d]' : 'hover:bg-[#2a2a2a]'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium mb-0.5 truncate">
                  {note.title || 'New Note'}
                </div>
                <div className="text-[#8e8e8e] text-xs truncate">
                  {formatDate(note.updatedAt)}  {getPreview(note.body)}
                </div>
              </div>
              <button
                onClick={(e) => handleDeleteNote(e, note.id)}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-[#3d3d3d] rounded transition-opacity"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#8e8e8e]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
