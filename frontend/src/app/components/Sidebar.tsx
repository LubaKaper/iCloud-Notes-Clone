import { Folder } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';

const FOLDERS = ['All iCloud'];

export function Sidebar() {
  const { selectedFolder, setSelectedFolder } = useNotes();

  return (
    <div className="w-[200px] flex-shrink-0 bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3d3d3d]">
        <div className="flex items-center gap-1">
          <span className="text-white text-sm">iCloud</span>
          <span className="text-[#f5b800] text-sm font-semibold">Notes</span>
        </div>
      </div>

      {/* Folders */}
      <div className="flex-1 px-2 py-2">
        {FOLDERS.map((folder) => (
          <button
            type="button"
            key={folder}
            onClick={() => setSelectedFolder(folder)}
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
        <button type="button" className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[#f5b800] hover:bg-[#353535] rounded cursor-pointer">
          <Folder className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </div>
    </div>
  );
}
