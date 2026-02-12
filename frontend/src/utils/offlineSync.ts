import { Note, fetchNotes, createNote, updateNote, deleteNote } from './api';
import {
  cachePutAllNotes,
  cachePutNote,
  cacheGetAllNotes,
  cacheDeleteNote,
  cacheMarkDeleted,
  getPendingNotes,
  getPendingDeletes,
  clearPendingFlag,
} from './indexedDb';
import { showToast } from '../context/ToastContext';

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: string[];
}

function isNetworkError(err: any): boolean {
  return (
    err.code === 'ERR_NETWORK' ||
    err.message === 'Network Error' ||
    !err.response
  );
}

function deriveTitle(body: string): string {
  const firstLine = body.split('\n')[0].trim();
  return firstLine.slice(0, 255) || 'New Note';
}

// --- Wrapped API functions ---

export async function syncFetchNotes(folderId?: string): Promise<Note[]> {
  try {
    const notes = await fetchNotes(folderId);
    if (!folderId) {
      await cachePutAllNotes(notes).catch(() => {});
    }
    return notes;
  } catch (err: any) {
    if (isNetworkError(err)) {
      showToast('Offline — showing cached notes', 'warning');
      try {
        return await cacheGetAllNotes();
      } catch {
        return [];
      }
    }
    throw err;
  }
}

export async function syncCreateNote(body: string, folderId?: string | null): Promise<Note> {
  try {
    const note = await createNote(body, folderId);
    await cachePutNote(note).catch(() => {});
    return note;
  } catch (err: any) {
    if (isNetworkError(err)) {
      const now = new Date().toISOString();
      const localNote: Note = {
        id: crypto.randomUUID(),
        title: deriveTitle(body),
        body,
        revision: 0,
        folderId: folderId || null,
        createdAt: now,
        updatedAt: now,
      };
      await cachePutNote(localNote, true).catch(() => {});
      showToast('Saved offline — will sync when back online', 'info');
      return localNote;
    }
    throw err;
  }
}

export async function syncUpdateNote(
  id: string,
  body: string,
  revision: number
): Promise<Note> {
  try {
    const note = await updateNote(id, body, revision);
    await cachePutNote(note).catch(() => {});
    return note;
  } catch (err: any) {
    if (isNetworkError(err)) {
      const now = new Date().toISOString();
      const localNote: Note = {
        id,
        title: deriveTitle(body),
        body,
        revision,
        folderId: null,
        createdAt: now,
        updatedAt: now,
      };
      await cachePutNote(localNote, true).catch(() => {});
      showToast('Saved offline', 'info');
      return localNote;
    }
    throw err;
  }
}

export async function syncDeleteNote(id: string): Promise<void> {
  try {
    await deleteNote(id);
    await cacheDeleteNote(id).catch(() => {});
  } catch (err: any) {
    if (isNetworkError(err)) {
      await cacheMarkDeleted(id).catch(() => {});
      showToast('Delete queued — will sync when back online', 'info');
      return;
    }
    throw err;
  }
}

// --- Background sync ---

export async function syncPendingChanges(): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, failed: 0, conflicts: [] };

  // Sync pending updates/creates
  const pending = await getPendingNotes().catch(() => []);
  for (const note of pending) {
    try {
      // Try update first; if 404, the note was created offline so create it on server
      try {
        await updateNote(note.id, note.body, note.revision);
      } catch (updateErr: any) {
        if (updateErr.response?.status === 404) {
          await createNote(note.body);
          // Server assigns a new ID — remove the old local-UUID entry
          await cacheDeleteNote(note.id).catch(() => {});
        } else if (updateErr.response?.status === 409) {
          result.conflicts.push(note.id);
          // Server wins — cache the server version
          const serverNote = updateErr.response.data.currentNote;
          if (serverNote) {
            await cachePutNote(serverNote).catch(() => {});
          }
          continue;
        } else {
          throw updateErr;
        }
      }
      await clearPendingFlag(note.id).catch(() => {});
      result.synced++;
    } catch {
      result.failed++;
    }
  }

  // Sync pending deletes
  const deletes = await getPendingDeletes().catch(() => []);
  for (const note of deletes) {
    try {
      await deleteNote(note.id);
      await cacheDeleteNote(note.id).catch(() => {});
      result.synced++;
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Already deleted on server — clean up cache
        await cacheDeleteNote(note.id).catch(() => {});
        result.synced++;
      } else {
        result.failed++;
      }
    }
  }

  return result;
}

// --- Online/offline listener ---

export function startOnlineListener(
  onStatusChange: (online: boolean) => void
): () => void {
  const handleOnline = () => onStatusChange(true);
  const handleOffline = () => onStatusChange(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
