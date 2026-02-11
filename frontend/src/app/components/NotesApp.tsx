import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Sidebar } from './Sidebar';
import { NotesList } from './NotesList';
import { NoteViewer } from './NoteViewer';
import { useNotes } from '../../context/NotesContext';
import { createNote } from '../../utils/api';

export function NotesApp() {
  const { setNotes, setSelectedNote, selectedFolder, showNewFolderModal, setShowNewFolderModal, createFolder, registerCreateNote, triggerCreateNote, triggerDeleteNote } = useNotes();
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateNote = useCallback(async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      const newNote = await createNote('', selectedFolder);
      setNotes((prev) => [newNote, ...prev]);
      setSelectedNote(newNote);
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setIsCreating(false);
    }
  }, [setNotes, setSelectedNote, selectedFolder, isCreating]);

  useEffect(() => {
    registerCreateNote(handleCreateNote);
  }, [registerCreateNote, handleCreateNote]);

  const submitNewFolder = () => {
    const trimmed = newFolderName.trim();
    if (trimmed) createFolder(trimmed);
    setShowNewFolderModal(false);
    setNewFolderName('');
  };

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden" style={{ pointerEvents: 'auto' }}>
      <Sidebar />
      <NotesList onCreateNote={triggerCreateNote} isCreating={isCreating} onDelete={triggerDeleteNote} />
      <NoteViewer />
      {showNewFolderModal && createPortal(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10002]" onMouseDown={() => setShowNewFolderModal(false)} onClick={() => setShowNewFolderModal(false)}>
          <div className="bg-[#2d2d2d] rounded-lg p-6 max-w-sm mx-4 w-full" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">New Folder</h2>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNewFolder();
                if (e.key === 'Escape') { setShowNewFolderModal(false); setNewFolderName(''); }
              }}
              placeholder="Folder name"
              className="w-full px-3 py-2 text-sm bg-[#1e1e1e] text-white rounded border border-[#3d3d3d] outline-none focus:border-[#f5b800] mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onMouseDown={(e) => { e.preventDefault(); setShowNewFolderModal(false); setNewFolderName(''); }} className="px-4 py-2 text-sm text-[#8e8e8e] hover:text-white">Cancel</button>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); submitNewFolder(); }} className="px-4 py-2 text-sm bg-[#f5b800] text-[#1e1e1e] rounded font-medium">Create</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
