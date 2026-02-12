import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUserId } from '../_lib/auth';
import { createNote, getAllNotes } from '../_lib/models/Note';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const folderId = req.query.folderId as string | undefined;
      const notes = await getAllNotes(userId, folderId);
      return res.json(notes);
    }

    if (req.method === 'POST') {
      const { body, folderId } = req.body;
      if (typeof body !== 'string') {
        return res.status(400).json({ error: 'body is required and must be a string' });
      }
      const note = await createNote(body, folderId || null, userId);
      return res.status(201).json(note);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Notes error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
