import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Menu, List, LayoutGrid, Grid3x3, HelpCircle, UserCircle, Share2, Edit3 } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { useHeaderActions } from '../../context/HeaderActionsContext';
import { updateNote, deleteNote, getNotes, createNote, isConflictResponse } from '../../utils/api';

export function NoteViewer() {
  const { notes, setNotes, selectedNote, setSelectedNote, selectedFolder, registerDeleteNote } = useNotes();
  const { handlers, setHandlers } = useHeaderActions();
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showApps, setShowApps] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const insertAtCursor = (before: string, after = '') => {
    if (!selectedNote) {
      showToast('Select a note first');
      return;
    }
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const newBody = body.slice(0, start) + before + body.slice(start, end) + after + body.slice(end);
    handleBodyChange(newBody);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, start + before.length + (end - start));
    }, 0);
  };

  const handleShare = async () => {
    if (!selectedNote) {
      showToast('Select a note to share');
      return;
    }
    const text = `${selectedNote.title || 'Untitled'}\n\n${body}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedNote.title || 'Note',
          text,
        });
        showToast('Shared!');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(text);
        }
      }
    } else {
      copyToClipboard(text);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
  };

  const cycleAlign = () => {
    const next: typeof textAlign = textAlign === 'left' ? 'center' : textAlign === 'center' ? 'right' : 'left';
    setTextAlign(next);
    showToast(`Align ${next}`);
  };
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
    setError(null);
    setIsSaving(true);
    try {
      const updated = await updateNote(
        selectedNote.id,
        body,
        selectedNote.revision
      );
      const allNotes = await getNotes();
      setNotes(allNotes);
      setSelectedNote(updated);
      setLastSaved(new Date());
    } catch (err: unknown) {
      console.error('Failed to save note:', err);
      const axiosErr = err as { response?: { status?: number; data?: unknown } };
      if (axiosErr.response?.status === 409 && isConflictResponse(axiosErr.response?.data)) {
        const { currentNote } = axiosErr.response.data;
        setNotes((prev) => prev.map((n) => (n.id === currentNote.id ? currentNote : n)));
        setSelectedNote(currentNote);
        setError('Note was changed elsewhere. Refreshed with latest version.');
      } else {
        setError('Failed to save note.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote('', selectedFolder);
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (err) {
      console.error('Failed to create note:', err);
      setError('Failed to create note');
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

  const handlersRef = useRef({ handleDeleteNote, handleShare, setShowHelp, setShowAccount, setShowApps, cycleAlign, insertAtCursor });
  handlersRef.current = { handleDeleteNote, handleShare, setShowHelp, setShowAccount, setShowApps, cycleAlign, insertAtCursor };

  useEffect(() => {
    registerDeleteNote(() => handlersRef.current.handleDeleteNote());
    return () => registerDeleteNote(() => {});
  }, [registerDeleteNote]);

  useLayoutEffect(() => {
    setHandlers({
      onDelete: () => handlersRef.current.handleDeleteNote(),
      onShare: () => handlersRef.current.handleShare(),
      onHelp: () => handlersRef.current.setShowHelp(true),
      onAccount: () => handlersRef.current.setShowAccount(true),
      onApps: () => handlersRef.current.setShowApps(true),
      onFocusEditor: () => textareaRef.current?.focus(),
      onAlign: () => handlersRef.current.cycleAlign(),
      onListFormat: () => handlersRef.current.insertAtCursor('- ', ''),
      onGridFormat: () => handlersRef.current.insertAtCursor('1. ', ''),
    });
    return () => setHandlers(null);
  }, [setHandlers]);

  // Debounced autosave
  useEffect(() => {
    if (!selectedNote || body === (selectedNote.body ?? '')) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSaveNote();
    }, 800);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [body, selectedNote?.id]);

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col min-w-0">
      {/* Toolbar - top of right column */}
      <div className="flex-shrink-0 px-4 py-2 flex items-center justify-end gap-1 border-b border-[#2d2d2d]">
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handlers?.onAlign?.(); }} className="p-2 hover:bg-[#2d2d2d] rounded" title="Alignment"><Menu className="w-5 h-5 text-[#b4b4b4]" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handlers?.onListFormat?.(); }} className="p-2 hover:bg-[#2d2d2d] rounded" title="Bullet list"><List className="w-5 h-5 text-[#b4b4b4]" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handlers?.onGridFormat?.(); }} className="p-2 hover:bg-[#2d2d2d] rounded" title="Numbered list"><LayoutGrid className="w-5 h-5 text-[#b4b4b4]" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handlers?.onHelp?.(); }} className="p-2 hover:bg-[#2d2d2d] rounded" title="Help"><HelpCircle className="w-5 h-5 text-[#b4b4b4]" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handlers?.onApps?.(); }} className="p-2 hover:bg-[#2d2d2d] rounded" title="Apps"><Grid3x3 className="w-5 h-5 text-[#b4b4b4]" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handlers?.onAccount?.(); }} className="p-2 hover:bg-[#2d2d2d] rounded" title="Account"><UserCircle className="w-5 h-5 text-[#b4b4b4]" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handlers?.onShare?.(); }} className="p-2 hover:bg-[#2d2d2d] rounded" title="Share"><Share2 className="w-5 h-5 text-[#b4b4b4]" /></button>
        <button type="button" onMouseDown={(e) => { e.preventDefault(); handlers?.onFocusEditor?.(); }} className="p-2 hover:bg-[#2d2d2d] rounded" title="Edit"><Edit3 className="w-5 h-5 text-[#f5b800]" /></button>
      </div>
      {selectedNote && (
        <div className="px-6 py-1 text-right text-[#8e8e8e] text-xs">
          {isSaving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
        </div>
      )}
      {error && (
        <div className="px-6 py-2 text-red-500 text-sm">{error}</div>
      )}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded bg-[#2d2d2d] text-white text-sm shadow-lg z-[10000]">
          {toast}
        </div>
      )}

      {showHelp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10001]" onMouseDown={() => setShowHelp(false)} onClick={() => setShowHelp(false)}>
          <div className="bg-[#2d2d2d] rounded-lg p-6 max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">How to use</h2>
            <ul className="text-[#b4b4b4] text-sm space-y-2">
              <li>• <strong className="text-white">+ New Note</strong> – Create a note</li>
              <li>• <strong className="text-white">Click a note</strong> – Select and edit</li>
              <li>• <strong className="text-white">Save</strong> – Save changes</li>
              <li>• <strong className="text-white">Trash</strong> – Delete the note</li>
              <li>• <strong className="text-white">Share</strong> – Copy or share note</li>
              <li>• <strong className="text-white">Cmd+N</strong> – Create note</li>
              <li>• <strong className="text-white">Cmd+Shift+N</strong> – New folder</li>
            </ul>
            <button type="button" onClick={() => setShowHelp(false)} className="mt-4 px-4 py-2 bg-[#f5b800] text-[#1e1e1e] rounded font-medium">Got it</button>
          </div>
        </div>
      )}

      {showAccount && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10001]" onMouseDown={() => setShowAccount(false)} onClick={() => setShowAccount(false)}>
          <div className="bg-[#2d2d2d] rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
            <p className="text-[#b4b4b4] text-sm mb-4">Sign in with your Apple ID to sync notes across devices.</p>
            <button type="button" className="w-full py-2 rounded bg-[#f5b800] text-[#1e1e1e] font-medium mb-2">Sign in with Apple</button>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowAccount(false); }} className="w-full py-2 text-[#8e8e8e] text-sm">Cancel</button>
          </div>
        </div>
      )}

      {showApps && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10001]" onMouseDown={() => setShowApps(false)} onClick={() => setShowApps(false)}>
          <div className="bg-[#2d2d2d] rounded-lg p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Apps</h2>
            <p className="text-[#b4b4b4] text-sm">Notes · Reminders · Other iCloud apps</p>
            <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowApps(false); }} className="mt-4 px-4 py-2 text-[#f5b800] text-sm">Close</button>
          </div>
        </div>
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
              style={{ textAlign }}
              className="w-full min-h-[400px] bg-transparent text-white text-sm leading-relaxed resize-none outline-none placeholder:text-[#8e8e8e]"
              spellCheck={false}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-[#8e8e8e] text-sm">
              <p>Select a note or create a new one</p>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); handleCreateNote(); }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCreateNote(); } }}
                className="px-6 py-3 rounded bg-[#f5b800] text-[#1e1e1e] font-medium hover:opacity-90 cursor-pointer select-none border-0"
              >
                Create new note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
