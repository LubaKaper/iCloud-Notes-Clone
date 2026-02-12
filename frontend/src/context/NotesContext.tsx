import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Folder } from '../utils/api';

export interface Note {
  id: string;
  title: string;
  body: string;
  revision: number;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
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
  folders: Folder[];
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(() => {
    return localStorage.getItem('selectedFolderId') || 'All iCloud';
  });
  const [folders, setFolders] = useState<Folder[]>([]);

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
        setFolders,
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
