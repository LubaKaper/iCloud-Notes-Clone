import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CreateNoteHandler = () => void;

const CUSTOM_FOLDERS_KEY = 'icloud-notes-custom-folders';

export interface Note {
  id: string;
  title: string;
  body: string;
  revision: number;
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

function loadCustomFolders(): string[] {
  try {
    const s = localStorage.getItem(CUSTOM_FOLDERS_KEY);
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

function saveCustomFolders(folders: string[]) {
  localStorage.setItem(CUSTOM_FOLDERS_KEY, JSON.stringify(folders));
}

interface NotesContextType {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFolder: string;
  setSelectedFolder: (folder: string) => void;
  folders: string[];
  createFolder: (name: string) => void;
  showNewFolderModal: boolean;
  setShowNewFolderModal: (show: boolean) => void;
  registerCreateNote: (handler: CreateNoteHandler) => void;
  triggerCreateNote: () => void;
  registerDeleteNote: (handler: () => void) => void;
  triggerDeleteNote: () => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('All iCloud');
  const [customFolders, setCustomFolders] = useState<string[]>(loadCustomFolders);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const createNoteRef = React.useRef<CreateNoteHandler | null>(null);
  const deleteNoteRef = React.useRef<(() => void) | null>(null);

  const folders = React.useMemo(() => ['All iCloud', ...customFolders], [customFolders]);

  const createFolder = React.useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCustomFolders((prev) => {
      if (prev.includes(trimmed)) return prev;
      const next = [...prev, trimmed];
      saveCustomFolders(next);
      return next;
    });
    setSelectedFolder(trimmed);
  }, []);
  const registerCreateNote = React.useCallback((handler: CreateNoteHandler) => {
    createNoteRef.current = handler;
  }, []);
  const triggerCreateNote = React.useCallback(() => {
    createNoteRef.current?.();
  }, []);
  const registerDeleteNote = React.useCallback((handler: () => void) => {
    deleteNoteRef.current = handler;
  }, []);
  const triggerDeleteNote = React.useCallback(() => {
    deleteNoteRef.current?.();
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        if (e.shiftKey) {
          setShowNewFolderModal(true);
        } else {
          createNoteRef.current?.();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes,
        setNotes,
        selectedNote,
        setSelectedNote,
        searchQuery,
        setSearchQuery,
        selectedFolder,
        setSelectedFolder,
        folders,
        createFolder,
        showNewFolderModal,
        setShowNewFolderModal,
        registerCreateNote,
        triggerCreateNote,
        registerDeleteNote,
        triggerDeleteNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}
