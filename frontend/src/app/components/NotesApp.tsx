import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { NotesList } from './NotesList';
import { NoteViewer } from './NoteViewer';
import { useNotes } from '../../context/NotesContext';
import { useToast } from '../../context/ToastContext';
import { syncFetchNotes, syncPendingChanges, startOnlineListener } from '../../utils/offlineSync';

export function NotesApp() {
  const { setNotes, selectedFolder } = useNotes();
  const { addToast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  useEffect(() => {
    const cleanup = startOnlineListener(async (online) => {
      setIsOffline(!online);
      if (online) {
        addToast('Back online — syncing...', 'info');
        const result = await syncPendingChanges();
        if (result.synced > 0) {
          addToast(`Synced ${result.synced} note(s)`, 'success');
        }
        if (result.conflicts.length > 0) {
          addToast(`${result.conflicts.length} conflict(s) resolved (server wins)`, 'warning');
        }
        if (result.failed > 0) {
          addToast(`${result.failed} note(s) failed to sync`, 'error');
        }
        // Re-fetch fresh data from server, respecting current folder
        const folderId = selectedFolder === 'All iCloud' ? undefined : selectedFolder;
        const notes = await syncFetchNotes(folderId).catch(() => []);
        if (notes.length > 0) setNotes(notes);
      } else {
        addToast('You are offline', 'warning');
      }
    });
    return cleanup;
  }, [setNotes, addToast, selectedFolder]);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#1e1e1e] text-white overflow-hidden" style={{ pointerEvents: 'auto' }}>
      {isOffline && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-[#f5b800] text-black text-xs font-semibold px-3 py-1 rounded-full">
          Offline
        </div>
      )}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <NotesList onOpenSidebar={() => setSidebarOpen(true)} mobileView={mobileView} onMobileViewChange={setMobileView} />
      <NoteViewer mobileView={mobileView} onMobileViewChange={setMobileView} />
    </div>
  );
}
