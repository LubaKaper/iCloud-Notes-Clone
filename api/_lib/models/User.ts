import { v4 as uuidv4 } from 'uuid';
import pool from '../db';

export interface User {
  id: string;
  google_sub: string;
  email: string | null;
  name: string | null;
  picture_url: string | null;
  created_at: Date;
}

export async function upsertUser(
  google_sub: string,
  email: string | null,
  name: string | null,
  picture_url: string | null
): Promise<User> {
  const id = uuidv4();
  const result = await pool.query(
    `INSERT INTO users (id, google_sub, email, name, picture_url)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (google_sub) DO UPDATE
       SET email = $3, name = $4, picture_url = $5
     RETURNING id, google_sub, email, name, picture_url, created_at`,
    [id, google_sub, email, name, picture_url]
  );
  return result.rows[0];
}
