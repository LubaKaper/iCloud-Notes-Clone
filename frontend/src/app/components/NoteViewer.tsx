import { useState, useCallback, useRef, useEffect } from 'react';
import { HelpCircle, Grid3x3, UserCircle, Share2, Edit3, AlignLeft, ListOrdered, Grid, Trash2 } from 'lucide-react';
import { debounce } from '../../utils/debounce';
import { useNotes } from '../../context/NotesContext';
import { updateNote, deleteNote } from '../../utils/api';

export function NoteViewer() {
  const { selectedNote, setSelectedNote, notes, setNotes } = useNotes();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  // Track latest note data for the debounced save
  const noteRef = useRef(selectedNote);

  useEffect(() => {
    noteRef.current = selectedNote;
  }, [selectedNote]);

  // Reset save status when switching notes
  useEffect(() => {
    setLastSaved(null);
    setIsSaving(false);
  }, [selectedNote?.id]);

  const saveNote = async (noteId: string, body: string, revision: number) => {
    setIsSaving(true);
    try {
      const saved = await updateNote(noteId, body, revision);
      // Only update if we're still on the same note
      if (noteRef.current?.id === noteId) {
        setSelectedNote(saved);
      }
      setNotes(notes.map(n => n.id === noteId ? saved : n));
      setLastSaved(new Date());
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.error('Autosave conflict — note was edited elsewhere');
      } else {
        console.error('Autosave failed', err);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (noteId: string, body: string, revision: number) => {
      await saveNote(noteId, body, revision);
    }, 800),
    [notes]
  );

  const handleBodyChange = (newBody: string) => {
    if (!selectedNote) return;
    const updated = { ...selectedNote, body: newBody };
    setSelectedNote(updated);
    debouncedSave(selectedNote.id, newBody, selectedNote.revision);
  };

  const handleBlur = async () => {
    if (!selectedNote) return;
    await saveNote(selectedNote.id, selectedNote.body, selectedNote.revision);
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(selectedNote.id);
      setNotes(notes.filter(n => n.id !== selectedNote.id));
      setSelectedNote(null);
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  if (!selectedNote) {
    return (
      <div className="flex-1 bg-[#1e1e1e] flex flex-col">
        <div className="px-6 py-3 border-b border-[#2d2d2d]" />
        <div className="flex-1 flex items-center justify-center text-[#8e8e8e] text-sm">
          Select a note or create a new one
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-[#2d2d2d] flex items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          <button onClick={handleDelete} className="p-1 hover:bg-[#2d2d2d] rounded">
            <Trash2 className="w-5 h-5 text-[#f5b800]" />
          </button>
          <span className="text-xs text-[#888]">
            {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <AlignLeft className="w-4 h-4 text-[#f5b800]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <ListOrdered className="w-4 h-4 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Grid className="w-4 h-4 text-[#b4b4b4]" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-end gap-3">
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <HelpCircle className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Grid3x3 className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <UserCircle className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Share2 className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Edit3 className="w-5 h-5 text-[#f5b800]" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-24 py-8">
        <textarea
          value={selectedNote.body}
          onChange={(e) => handleBodyChange(e.target.value)}
          onBlur={handleBlur}
          className="w-full h-full text-[#e0e0e0] bg-transparent outline-none leading-relaxed text-base resize-none"
          placeholder="Start typing..."
        />
      </div>
    </div>
  );
}
