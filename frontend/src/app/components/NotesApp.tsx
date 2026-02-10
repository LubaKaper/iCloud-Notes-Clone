import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { NotesList } from './NotesList';
import { NoteViewer } from './NoteViewer';
import { useNotes } from '../../context/NotesContext';
import { fetchNotes } from '../../utils/api';

export function NotesApp() {
  const { setNotes } = useNotes();

  useEffect(() => {
    fetchNotes().then(setNotes).catch(console.error);
  }, [setNotes]);

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">
      <Sidebar />
      <NotesList />
      <NoteViewer />
    </div>
  );
}
