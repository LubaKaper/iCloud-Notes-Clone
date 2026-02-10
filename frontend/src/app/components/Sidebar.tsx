import { Folder } from 'lucide-react';

export function Sidebar() {
  return (
    <div className="w-[200px] bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3d3d3d]">
        <div className="flex items-center gap-1">
          <span className="text-white text-sm">iCloud</span>
          <span className="text-[#f5b800] text-sm font-semibold">Notes</span>
        </div>
      </div>

      {/* Folders (empty for now) */}
      <div className="flex-1 px-2 py-2">
      </div>

      {/* New Folder Button */}
      <div className="p-2 border-t border-[#3d3d3d]">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-[#f5b800] hover:bg-[#353535] rounded">
          <Folder className="w-4 h-4" />
          <span>New Folder</span>
        </button>
      </div>
    </div>
  );
}
