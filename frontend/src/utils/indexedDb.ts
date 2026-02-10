import { Note } from './api';

export interface CachedNote extends Note {
  _pendingSync: boolean;
  _deleted: boolean;
}

const DB_NAME = 'icloud_notes_cache';
const DB_VERSION = 1;
const STORE_NAME = 'notes';

let dbInstance: IDBDatabase | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

function withStore(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest
): Promise<any> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const req = fn(store);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );
}

export async function cacheGetAllNotes(): Promise<CachedNote[]> {
  const all: CachedNote[] = await withStore('readonly', (store) => store.getAll());
  return all.filter((n) => !n._deleted);
}

export async function cacheGetNote(id: string): Promise<CachedNote | undefined> {
  return withStore('readonly', (store) => store.get(id));
}

export async function cachePutNote(note: Note, pendingSync = false): Promise<void> {
  const cached: CachedNote = {
    ...note,
    _pendingSync: pendingSync,
    _deleted: false,
  };
  await withStore('readwrite', (store) => store.put(cached));
}

export async function cachePutAllNotes(notes: Note[]): Promise<void> {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);

  for (const note of notes) {
    const cached: CachedNote = {
      ...note,
      _pendingSync: false,
      _deleted: false,
    };
    store.put(cached);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function cacheDeleteNote(id: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(id));
}

export async function cacheMarkDeleted(id: string): Promise<void> {
  const existing = await cacheGetNote(id);
  if (existing) {
    existing._deleted = true;
    existing._pendingSync = false;
    await withStore('readwrite', (store) => store.put(existing));
  }
}

export async function getPendingNotes(): Promise<CachedNote[]> {
  const all: CachedNote[] = await withStore('readonly', (store) => store.getAll());
  return all.filter((n) => n._pendingSync && !n._deleted);
}

export async function getPendingDeletes(): Promise<CachedNote[]> {
  const all: CachedNote[] = await withStore('readonly', (store) => store.getAll());
  return all.filter((n) => n._deleted);
}

export async function clearPendingFlag(id: string): Promise<void> {
  const note = await cacheGetNote(id);
  if (note) {
    note._pendingSync = false;
    await withStore('readwrite', (store) => store.put(note));
  }
}
