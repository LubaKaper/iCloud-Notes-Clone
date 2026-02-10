import { Sidebar } from './Sidebar';
import { NotesList } from './NotesList';
import { NoteViewer } from './NoteViewer';

export function NotesApp() {
  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">
      <Sidebar />
      <NotesList />
      <NoteViewer />
    </div>
  );
}
