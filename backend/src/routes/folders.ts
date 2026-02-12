import { Router, Request, Response, NextFunction } from 'express';
import {
  createFolder,
  getAllFolders,
  renameFolder,
  deleteFolder,
} from '../models/Folder';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateId(req: Request<{ id: string }>, res: Response): boolean {
  if (!UUID_RE.test(req.params.id)) {
    res.status(400).json({ error: 'Invalid folder id format' });
    return false;
  }
  return true;
}

// POST /api/folders - Create a new folder
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'name is required and must be a non-empty string' });
      return;
    }
    const folder = await createFolder(name.trim(), req.userId);
    res.status(201).json(folder);
  } catch (err) {
    next(err);
  }
});

// GET /api/folders - List all folders
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folders = await getAllFolders(req.userId);
    res.json(folders);
  } catch (err) {
    next(err);
  }
});

// PUT /api/folders/:id - Rename a folder
router.put('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    if (!validateId(req, res)) return;
    const { name } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'name is required and must be a non-empty string' });
      return;
    }
    const folder = await renameFolder(req.params.id, req.userId, name.trim());
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }
    res.json(folder);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/folders/:id - Delete a folder
router.delete('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    if (!validateId(req, res)) return;
    const deleted = await deleteFolder(req.params.id, req.userId);
    if (!deleted) {
      res.status(404).json({ error: 'Folder not found' });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
