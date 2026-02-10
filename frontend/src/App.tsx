import { NotesProvider } from './context/NotesContext';
import { NotesApp } from './app/components/NotesApp';

export default function App() {
  return (
    <NotesProvider>
      <NotesApp />
    </NotesProvider>
  );
}
