import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUserId } from '../_lib/auth';
import { createFolder, getAllFolders } from '../_lib/models/Folder';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = getAuthUserId(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const folders = await getAllFolders(userId);
      return res.json(folders);
    }

    if (req.method === 'POST') {
      const { name } = req.body;
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required and must be a non-empty string' });
      }
      const folder = await createFolder(name.trim(), userId);
      return res.status(201).json(folder);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Folders error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
