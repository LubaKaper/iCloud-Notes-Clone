import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface Note {
  id: string;
  title: string;
  body: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export async function fetchNotes(): Promise<Note[]> {
  const { data } = await api.get<Note[]>('/notes');
  return data;
}

export async function fetchNote(id: string): Promise<Note> {
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
