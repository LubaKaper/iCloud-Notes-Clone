import { v4 as uuidv4 } from 'uuid';
import pool from '../db';

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

export async function createFolder(name: string): Promise<Folder> {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO folders (id, name)
     VALUES ($1, $2)
     RETURNING id, name, "createdAt"`,
    [id, name]
  );
  return result.rows[0];
}

export async function getAllFolders(): Promise<Folder[]> {
  const result = await pool.query(
    `SELECT id, name, "createdAt" FROM folders ORDER BY name`
  );
  return result.rows;
}

export async function renameFolder(id: string, name: string): Promise<Folder | null> {
  const result = await pool.query(
    `UPDATE folders SET name = $1 WHERE id = $2
     RETURNING id, name, "createdAt"`,
    [name, id]
  );
  return result.rows[0] || null;
}

export async function deleteFolder(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM folders WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
