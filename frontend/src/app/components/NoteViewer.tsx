import { useState, useEffect, useRef } from 'react';
import { HelpCircle, Grid3x3, UserCircle, Share2, Edit3, AlignLeft, ListOrdered, Grid, Trash2, Save } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { updateNote, deleteNote, getNotes } from '../../utils/api';

export function NoteViewer() {
  const { notes, setNotes, selectedNote, setSelectedNote } = useNotes();
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [body, setBody] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setBody(selectedNote?.body ?? '');
  }, [selectedNote?.id, selectedNote?.body]);

  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    if (selectedNote) {
      setSelectedNote({ ...selectedNote, body: newBody });
    }
  };

  const handleSaveNote = async () => {
    if (!selectedNote) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateNote(
        selectedNote.id,
        body,
        selectedNote.revision
      );
      const allNotes = await getNotes();
      setNotes(allNotes);
      setSelectedNote(updated);
    } catch (err: unknown) {
      console.error('Failed to save note:', err);
      const axiosErr = err as { response?: { status?: number; data?: { currentNote?: typeof selectedNote } } };
      if (axiosErr.response?.status === 409 && axiosErr.response?.data?.currentNote) {
        const current = axiosErr.response.data.currentNote;
        setNotes(notes.map((n) => (n.id === current.id ? current : n)));
        setSelectedNote(current);
        setError('Note was changed elsewhere. Refreshed with latest version.');
      } else {
        setError('Failed to save note.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (!window.confirm('Delete this note?')) return;
    setError(null);
    try {
      await deleteNote(selectedNote.id);
      setNotes(notes.filter((n) => n.id !== selectedNote.id));
      setSelectedNote(null);
    } catch (err) {
      console.error('Failed to delete note:', err);
      setError('Failed to delete note');
    }
  };

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
          {selectedNote && (
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-2 py-1 text-sm text-[#f5b800] hover:bg-[#2d2d2d] rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
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
          <button type="button" className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer">
            <UserCircle className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button type="button" className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer">
            <Share2 className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button
            type="button"
            onClick={() => textareaRef.current?.focus()}
            className="p-1 hover:bg-[#2d2d2d] rounded cursor-pointer"
            title="Focus editor"
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
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => handleBodyChange(e.target.value)}
              placeholder="Start typing..."
              className="w-full min-h-[400px] bg-transparent text-white text-sm leading-relaxed resize-none outline-none placeholder:text-[#8e8e8e]"
              spellCheck={false}
            />
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
