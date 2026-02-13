import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUserId } from '../_lib/auth';
import { ensureDbInitialized } from '../_lib/db';
import { getNoteById, updateNote, deleteNote } from '../_lib/models/Note';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseJsonBody(body: unknown): Record<string, unknown> {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (body && typeof body === 'object') {
    return body as Record<string, unknown>;
  }
  return {};
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureDbInitialized();

  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const id = req.query.id as string;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid note id format' });
  }

  try {
    if (req.method === 'GET') {
      const note = await getNoteById(id, userId);
      if (!note) return res.status(404).json({ error: 'Note not found' });
      return res.json(note);
    }

    if (req.method === 'PUT') {
      const parsed = parseJsonBody(req.body);
      const body = parsed.body;
      const revision = parsed.revision;
      if (typeof body !== 'string') {
        return res.status(400).json({ error: 'body is required and must be a string' });
      }
      if (typeof revision !== 'number') {
        return res.status(400).json({ error: 'revision is required and must be a number' });
      }
      const result = await updateNote(id, body, revision, userId);
      if (!result.note && !result.conflict) {
        return res.status(404).json({ error: 'Note not found' });
      }
      if (result.conflict) {
        return res.status(409).json({
          error: 'Revision conflict: your data is outdated',
          currentNote: result.note,
        });
      }
      return res.json(result.note);
    }

    if (req.method === 'DELETE') {
      const deleted = await deleteNote(id, userId);
      if (!deleted) return res.status(404).json({ error: 'Note not found' });
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Note error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
