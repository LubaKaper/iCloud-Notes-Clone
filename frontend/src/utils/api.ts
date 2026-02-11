import axios from 'axios';

// Use proxy (/api) when no explicit URL - works with Vite dev server
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

/** Alias for spec compatibility - returns raw axios response (use res.data) */
export const notesAPI = {
  createNote: (body: string, folderId?: string | null) =>
    api.post('/notes', { body, folderId: folderId || null }),
  getNotes: (folderId?: string) =>
    api.get('/notes', { params: folderId ? { folderId } : {} }),
  getNote: (id: string) => api.get(`/notes/${id}`),
  updateNote: (id: string, body: string, revision: number) =>
    api.put(`/notes/${id}`, { body, revision }),
  deleteNote: (id: string) => api.delete(`/notes/${id}`),
};

export interface Note {
  id: string;
  title: string;
  body: string;
  revision: number;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export async function getNotes(folderId?: string): Promise<Note[]> {
  const { data } = await api.get<Note[]>('/notes', {
    params: folderId ? { folderId } : {},
  });
  return data;
}

/** Alias used by offlineSync / components */
export const fetchNotes = getNotes;

export async function getNote(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
}

export async function createNote(body: string, folderId?: string | null): Promise<Note> {
  const { data } = await api.post<Note>('/notes', { body, folderId: folderId || null });
  return data;
}

export async function updateNote(
  id: string,
  body: string,
  revision: number
): Promise<Note> {
  const { data } = await api.put<Note>(`/notes/${id}`, { body, revision });
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  await api.delete(`/notes/${id}`);
}

// --- Folder API ---

export async function getFolders(): Promise<Folder[]> {
  const { data } = await api.get<Folder[]>('/folders');
  return data;
}

export async function createFolder(name: string): Promise<Folder> {
  const { data } = await api.post<Folder>('/folders', { name });
  return data;
}

export async function renameFolder(id: string, name: string): Promise<Folder> {
  const { data } = await api.put<Folder>(`/folders/${id}`, { name });
  return data;
}

export async function deleteFolder(id: string): Promise<void> {
  await api.delete(`/folders/${id}`);
}
