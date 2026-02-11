import { v4 as uuidv4 } from 'uuid';
import pool from '../db';

export interface Note {
  id: string;
  title: string;
  body: string;
  revision: number;
  folderId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

function deriveTitle(body: string): string {
  const firstLine = body.split('\n')[0].trim();
  return firstLine.slice(0, 255) || 'New Note';
}

export async function createNote(body: string, folderId?: string | null): Promise<Note> {
  const id = uuidv4();
  const title = deriveTitle(body);
  const now = new Date();

  const result = await pool.query(
    `INSERT INTO notes (id, title, body, revision, "folderId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 0, $4, $5, $5)
     RETURNING id, title, body, revision, "folderId", "createdAt", "updatedAt"`,
    [id, title, body, folderId || null, now]
  );

  return result.rows[0];
}

export async function getAllNotes(folderId?: string): Promise<Note[]> {
  if (folderId) {
    const result = await pool.query(
      `SELECT id, title, body, revision, "folderId", "createdAt", "updatedAt"
       FROM notes
       WHERE "folderId" = $1
       ORDER BY "updatedAt" DESC`,
      [folderId]
    );
    return result.rows;
  }
  const result = await pool.query(
    `SELECT id, title, body, revision, "folderId", "createdAt", "updatedAt"
     FROM notes
     ORDER BY "updatedAt" DESC`
  );
  return result.rows;
}

export async function getNoteById(id: string): Promise<Note | null> {
  const result = await pool.query(
    `SELECT id, title, body, revision, "folderId", "createdAt", "updatedAt"
     FROM notes
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function updateNote(
  id: string,
  body: string,
  revision: number
): Promise<{ note: Note | null; conflict: boolean }> {
  const title = deriveTitle(body);
  const now = new Date();

  // Atomic update: only succeeds if revision matches exactly
  const result = await pool.query(
    `UPDATE notes
     SET title = $1, body = $2, revision = revision + 1, "updatedAt" = $3
     WHERE id = $4 AND revision = $5
     RETURNING id, title, body, revision, "folderId", "createdAt", "updatedAt"`,
    [title, body, now, id, revision]
  );

  if (result.rows[0]) {
    return { note: result.rows[0], conflict: false };
  }

  // Row wasn't updated — either not found or revision mismatch
  const existing = await getNoteById(id);
  if (!existing) {
    return { note: null, conflict: false };
  }

  return { note: existing, conflict: true };
}

export async function deleteNote(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM notes WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
