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
  createNote: (body: string) => api.post('/notes', { body }),
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
  createdAt: string;
  updatedAt: string;
}

export async function getNotes(): Promise<Note[]> {
  const { data } = await api.get<Note[]>('/notes');
  return data;
}

export async function getNote(id: string): Promise<Note> {
  const { data } = await api.get<Note>(`/notes/${id}`);
  return data;
}

export async function createNote(body: string): Promise<Note> {
  const { data } = await api.post<Note>('/notes', { body });
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
