import { Folder } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';

export function Sidebar() {
  const { selectedFolder, setSelectedFolder, folders, setShowNewFolderModal } = useNotes();

  const handleNewFolder = () => {
    setShowNewFolderModal(true);
  };

  return (
    <div className="w-[200px] flex-shrink-0 bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3d3d3d]">
        <div className="flex items-center gap-1">
          <span className="text-[#b4b4b4] text-sm">iCloud</span>
          <span className="text-[#b4b4b4] text-sm font-semibold">Notes</span>
        </div>
      </div>
      {/* Folders */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {folders.map((folder) => (
          <button
            type="button"
            key={folder}
            onMouseDown={(e) => { e.preventDefault(); setSelectedFolder(folder); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedFolder(folder); } }}
            className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-[#353535] cursor-pointer ${
              selectedFolder === folder ? 'bg-[#353535] text-[#f5b800]' : 'text-white'
            }`}
          >
            {folder}
          </button>
        ))}
      </div>

      {/* New Folder Button */}
      <div className="p-2 border-t border-[#3d3d3d]">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleNewFolder(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNewFolder(); } }}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[#f5b800] hover:bg-[#353535] rounded cursor-pointer"
        >
          <Folder className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </div>
    </div>
  );
}
