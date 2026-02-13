import { useEffect } from 'react';
import { PlusCircle, Folder, Trash2, X } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { getFolders, createFolder as apiCreateFolder, deleteFolder as apiDeleteFolder } from '../../utils/api';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { selectedFolder, setSelectedFolder, folders, setFolders } = useNotes();

  useEffect(() => {
    getFolders().then(setFolders).catch(() => {});
  }, [setFolders]);

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolder(folderId);
    localStorage.setItem('selectedFolderId', folderId);
    onClose();
  };

  const handleNewFolder = async () => {
    const name = window.prompt('Folder name:');
    if (!name?.trim()) return;
    try {
      const folder = await apiCreateFolder(name.trim());
      setFolders((prev) => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      // ignore
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiDeleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      if (selectedFolder === id) {
        handleSelectFolder('All iCloud');
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-[200px] flex-shrink-0 bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col transition-transform md:static md:z-auto md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3d3d3d]">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            <span className="text-white text-sm">iCloud</span>
            <span className="text-[#f5b800] text-sm font-semibold">Notes</span>
          </div>
          <button type="button" onClick={onClose} className="md:hidden p-1 text-[#8e8e8e] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folders */}
      <div className="flex-1 px-2 py-2 overflow-y-auto">
        {/* All iCloud - always first */}
        <button
          type="button"
          onClick={() => handleSelectFolder('All iCloud')}
          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#353535] cursor-pointer ${
            selectedFolder === 'All iCloud' ? 'bg-[#353535] text-[#f5b800]' : 'text-white'
          }`}
        >
          All iCloud
        </button>

        {/* Dynamic folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            onClick={() => handleSelectFolder(folder.id)}
            className={`group flex items-center justify-between px-3 py-2 text-sm rounded hover:bg-[#353535] cursor-pointer ${
              selectedFolder === folder.id ? 'bg-[#353535] text-[#f5b800]' : 'text-white'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Folder className="w-4 h-4 text-[#f5b800] flex-shrink-0" />
              <span className="truncate">{folder.name}</span>
            </div>
            <button
              type="button"
              onClick={(e) => handleDeleteFolder(e, folder.id)}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* New Folder Button */}
      <div className="p-2 border-t border-[#3d3d3d]">
        <button
          type="button"
          onClick={handleNewFolder}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[#f5b800] hover:bg-[#353535] rounded cursor-pointer"
        >
          <PlusCircle className="w-5 h-5" />
          <span>New Folder</span>
        </button>
      </div>
    </div>
  );
}
