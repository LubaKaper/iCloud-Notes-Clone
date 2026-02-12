import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotesProvider } from './context/NotesContext';
import { NotesApp } from './app/components/NotesApp';
import { LoginScreen } from './app/components/LoginScreen';

function AppInner() {
  const { token } = useAuth();

  if (!token) {
    return <LoginScreen />;
  }

  return (
    <ToastProvider>
      <NotesProvider>
        <NotesApp />
      </NotesProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
