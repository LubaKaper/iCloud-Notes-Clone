import { createContext, useContext, useState, ReactNode } from 'react';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  pictureUrl: string | null;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadFromStorage(): { token: string | null; user: AuthUser | null } {
  try {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? (JSON.parse(userStr) as AuthUser) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = loadFromStorage();
  const [token, setToken] = useState<string | null>(initial.token);
  const [user, setUser] = useState<AuthUser | null>(initial.user);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('selectedNoteId');
    localStorage.removeItem('selectedFolderId');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
