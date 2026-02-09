import { Router, Request, Response, NextFunction } from 'express';
import {
  createNote,
  getAllNotes,
  getNoteById,
  updateNote,
  deleteNote,
} from '../models/Note';

const router = Router();

// POST /api/notes - Create a new note
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body } = req.body;
    if (typeof body !== 'string') {
      res.status(400).json({ error: 'body is required and must be a string' });
      return;
    }
    const note = await createNote(body);
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes - List all notes sorted by updatedAt DESC
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const notes = await getAllNotes();
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// GET /api/notes/:id - Get a single note
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const note = await getNoteById(req.params.id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notes/:id - Update a note (with revision check)
router.put('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { body, revision } = req.body;
    if (typeof body !== 'string') {
      res.status(400).json({ error: 'body is required and must be a string' });
      return;
    }
    if (typeof revision !== 'number') {
      res
        .status(400)
        .json({ error: 'revision is required and must be a number' });
      return;
    }

    const result = await updateNote(req.params.id, body, revision);

    if (!result.note && !result.conflict) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    if (result.conflict) {
      res.status(409).json({
        error: 'Revision conflict: your data is outdated',
        currentNote: result.note,
      });
      return;
    }

    res.json(result.note);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete(
  '/:id',
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const deleted = await deleteNote(req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Note not found' });
        return;
      }
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
