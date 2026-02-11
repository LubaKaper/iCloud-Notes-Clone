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
  createNote: (body: string, folder?: string) => api.post('/notes', { body, folder: folder ?? 'All iCloud' }),
  getNotes: () => api.get('/notes'),
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
  folder?: string;
  createdAt: string;
  updatedAt: string;
}

/** 409 conflict response from PUT /api/notes/:id */
export interface ConflictResponse {
  error: string;
  currentNote: Note;
}

export function isConflictResponse(data: unknown): data is ConflictResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'currentNote' in data &&
    typeof (data as ConflictResponse).currentNote === 'object'
  );
}

export async function getNotes(): Promise<Note[]> {
  const { data } = await api.get<Note[]>('/notes');
  return data;
}

/** Alias for components that use fetchNotes */
export const fetchNotes = getNotes;

export async function getNote(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
}

export async function createNote(body: string, folder = 'All iCloud'): Promise<Note> {
  const { data } = await api.post<Note>('/notes', { body, folder });
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
