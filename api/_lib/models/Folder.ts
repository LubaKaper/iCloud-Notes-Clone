import { v4 as uuidv4 } from 'uuid';
import pool from '../db';

export interface Folder {
  id: string;
  name: string;
  userId: string | null;
  createdAt: Date;
}

export async function createFolder(name: string, userId: string): Promise<Folder> {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO folders (id, name, "userId")
     VALUES ($1, $2, $3)
     RETURNING id, name, "userId", "createdAt"`,
    [id, name, userId]
  );
  return result.rows[0];
}

export async function getAllFolders(userId: string): Promise<Folder[]> {
  const result = await pool.query(
    `SELECT id, name, "userId", "createdAt" FROM folders WHERE "userId" = $1 ORDER BY name`,
    [userId]
  );
  return result.rows;
}

export async function renameFolder(id: string, userId: string, name: string): Promise<Folder | null> {
  const result = await pool.query(
    `UPDATE folders SET name = $1 WHERE id = $2 AND "userId" = $3
     RETURNING id, name, "userId", "createdAt"`,
    [name, id, userId]
  );
  return result.rows[0] || null;
}

export async function deleteFolder(id: string, userId: string): Promise<boolean> {
  const result = await pool.query(
    'DELETE FROM folders WHERE id = $1 AND "userId" = $2',
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
