import { v4 as uuidv4 } from 'uuid';
import pool from '../db';

export interface Note {
  id: string;
  title: string;
  body: string;
  revision: number;
  folderId: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function deriveTitle(body: string): string {
  const firstLine = body.split('\n')[0].trim();
  return firstLine.slice(0, 255) || 'New Note';
}

export async function createNote(body: string, folderId: string | null, userId: string): Promise<Note> {
  const id = uuidv4();
  const title = deriveTitle(body);
  const now = new Date();
  const result = await pool.query(
    `INSERT INTO notes (id, title, body, revision, "folderId", "userId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 0, $4, $5, $6, $6)
     RETURNING id, title, body, revision, "folderId", "userId", "createdAt", "updatedAt"`,
    [id, title, body, folderId, userId, now]
  );
  return result.rows[0];
}

export async function getAllNotes(userId: string, folderId?: string): Promise<Note[]> {
  if (folderId) {
    const result = await pool.query(
      `SELECT id, title, body, revision, "folderId", "userId", "createdAt", "updatedAt"
       FROM notes WHERE "userId" = $1 AND "folderId" = $2 ORDER BY "updatedAt" DESC`,
      [userId, folderId]
    );
    return result.rows;
  }
  const result = await pool.query(
    `SELECT id, title, body, revision, "folderId", "userId", "createdAt", "updatedAt"
     FROM notes WHERE "userId" = $1 ORDER BY "updatedAt" DESC`,
    [userId]
  );
  return result.rows;
}

export async function getNoteById(id: string, userId: string): Promise<Note | null> {
  const result = await pool.query(
    `SELECT id, title, body, revision, "folderId", "userId", "createdAt", "updatedAt"
     FROM notes WHERE id = $1 AND "userId" = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function updateNote(
  id: string,
  body: string,
  revision: number,
  userId: string
): Promise<{ note: Note | null; conflict: boolean }> {
  const title = deriveTitle(body);
  const now = new Date();
  const result = await pool.query(
    `UPDATE notes SET title = $1, body = $2, revision = revision + 1, "updatedAt" = $3
     WHERE id = $4 AND revision = $5 AND "userId" = $6
     RETURNING id, title, body, revision, "folderId", "userId", "createdAt", "updatedAt"`,
    [title, body, now, id, revision, userId]
  );
  if (result.rows[0]) return { note: result.rows[0], conflict: false };
  const existing = await getNoteById(id, userId);
  if (!existing) return { note: null, conflict: false };
  return { note: existing, conflict: true };
}

export async function deleteNote(id: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM notes WHERE id = $1 AND "userId" = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
