import { ToastProvider } from './context/ToastContext';
import { NotesProvider } from './context/NotesContext';
import { NotesApp } from './app/components/NotesApp';

export default function App() {
  return (
    <ToastProvider>
      <NotesProvider>
        <NotesApp />
      </NotesProvider>
    </ToastProvider>
  );
}
