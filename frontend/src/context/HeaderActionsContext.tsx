import { createContext, useContext, useState, ReactNode } from 'react';
import type { HeaderActionHandlers } from '../app/components/Header';

const HeaderActionsContext = createContext<{
  handlers: HeaderActionHandlers | null;
  setHandlers: (h: HeaderActionHandlers | null) => void;
} | null>(null);

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [handlers, setHandlers] = useState<HeaderActionHandlers | null>(null);
  return (
    <HeaderActionsContext.Provider value={{ handlers, setHandlers }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

export function useHeaderActions() {
  const ctx = useContext(HeaderActionsContext);
  return ctx ?? { handlers: null, setHandlers: () => {} };
}
