import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db';
import authRouter from './routes/auth';
import notesRouter from './routes/notes';
import foldersRouter from './routes/folders';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/folders', foldersRouter);

app.use(errorHandler);

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
