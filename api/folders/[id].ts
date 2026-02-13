import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUserId } from '../_lib/auth';
import { ensureDbInitialized } from '../_lib/db';
import { renameFolder, deleteFolder } from '../_lib/models/Folder';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureDbInitialized();

  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const id = req.query.id as string;
  if (!UUID_RE.test(id)) {
    return res.status(400).json({ error: 'Invalid folder id format' });
  }

  try {
    if (req.method === 'PUT') {
      const { name } = req.body;
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required and must be a non-empty string' });
      }
      const folder = await renameFolder(id, userId, name.trim());
      if (!folder) return res.status(404).json({ error: 'Folder not found' });
      return res.json(folder);
    }

    if (req.method === 'DELETE') {
      const deleted = await deleteFolder(id, userId);
      if (!deleted) return res.status(404).json({ error: 'Folder not found' });
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Folder error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
