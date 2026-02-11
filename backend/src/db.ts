import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    'postgres://luba@localhost:5432/icloud_notes',
});

export async function initDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS folders (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        body TEXT NOT NULL DEFAULT '',
        revision INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE notes ADD COLUMN IF NOT EXISTS "folderId" UUID REFERENCES folders(id) ON DELETE SET NULL
    `);
  } finally {
    client.release();
  }
}

export default pool;
