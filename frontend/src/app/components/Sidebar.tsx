import { ChevronDown, Folder, FolderOpen } from 'lucide-react';

export function Sidebar() {
  const folders = [
    { name: 'All iCloud', icon: FolderOpen, active: true },
    { name: 'Notes', icon: Folder, active: false },
    { name: 'New Folder', icon: Folder, active: false },
    { name: 'Schools', icon: Folder, active: false },
  ];

  return (
    <div className="w-[200px] bg-[#2d2d2d] border-r border-[#3d3d3d] flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3d3d3d]">
        <div className="flex items-center gap-1">
          <span className="text-white text-sm">iCloud</span>
          <span className="text-[#f5b800] text-sm font-semibold">Notes</span>
        </div>
      </div>

      {/* Folders */}
      <div className="flex-1 px-2 py-2">
        {folders.map((folder, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
              folder.active
                ? 'bg-[#3d3d3d] text-white'
                : 'text-[#b4b4b4] hover:bg-[#353535]'
            }`}
          >
            <folder.icon className="w-4 h-4" />
            <span>{folder.name}</span>
          </button>
        ))}

        {/* Tags Section */}
        <div className="mt-4">
          <button className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-[#b4b4b4] hover:bg-[#353535] rounded">
            <span>Tags</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          <div className="ml-2 mt-1">
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[#b4b4b4] hover:bg-[#353535]">
              <span>All Tags</span>
            </button>
            <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-[#b4b4b4] hover:bg-[#353535]">
              <span>#LB</span>
            </button>
          </div>
        </div>
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
