import { NotesProvider } from './context/NotesContext';
import { HeaderActionsProvider } from './context/HeaderActionsContext';
import { ToastProvider } from './context/ToastContext';
import { NotesApp } from './app/components/NotesApp';

export default function App() {
  return (
    <NotesProvider>
      <ToastProvider>
        <HeaderActionsProvider>
          <NotesApp />
        </HeaderActionsProvider>
      </ToastProvider>
    </NotesProvider>
  );
}
