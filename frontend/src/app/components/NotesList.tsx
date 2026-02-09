import { Search } from 'lucide-react';

const notes: { title: string; date: string; preview: string; folder: string; active: boolean }[] = [];

export function NotesList() {
  return (
    <div className="w-[360px] bg-[#252525] border-r border-[#3d3d3d] flex flex-col">
      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-[#3d3d3d] flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-[#1e1e1e] rounded-md px-3 py-1.5">
          <Search className="w-4 h-4 text-[#8e8e8e]" />
          <input
            type="text"
            placeholder="Search all notes"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#8e8e8e] outline-none"
          />
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {notes.map((note, index) => (
          <div
            key={index}
            className={`px-4 py-3 border-b border-[#2d2d2d] cursor-pointer ${
              note.active ? 'bg-[#2d2d2d]' : 'hover:bg-[#2a2a2a]'
            }`}
          >
            <div className="text-white text-sm font-medium mb-0.5">
              {note.title}
            </div>
            <div className="text-[#8e8e8e] text-xs mb-1">
              {note.date} {note.preview}
            </div>
            <div className="flex items-center gap-1 text-[#8e8e8e] text-xs">
              <span>📄</span>
              <span>{note.folder}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
