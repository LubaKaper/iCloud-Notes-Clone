import { Search, Trash2 } from 'lucide-react';

const notes = [
  {
    title: 'New Note',
    date: 'Yesterday',
    preview: '1 table',
    folder: 'Notes',
    active: false,
  },
  {
    title: '3.',
    date: 'Saturday',
    preview: '"We redesigned the Ta...',
    folder: 'Notes',
    active: true,
  },
  {
    title: 'New Note',
    date: 'Friday',
    preview: '',
    folder: 'Notes',
    active: false,
  },
  {
    title: 'AI ideas',
    date: 'Friday',
    preview: 'Christmas tree ornaments ...',
    folder: 'Notes',
    active: false,
  },
  {
    title: '59b',
    date: 'Tuesday',
    preview: '00015335959b',
    folder: 'Notes',
    active: false,
  },
  {
    title: 'Terminal shortcuts:',
    date: 'Monday',
    preview: 'cd ~/Library/Mobile Doc...',
    folder: 'Notes',
    active: false,
  },
  {
    title: 'Lila and Plant Reminders',
    date: '1/24/26',
    preview: '🌱 Plant Watering Days',
    folder: 'Notes',
    active: false,
  },
  {
    title: 'Mental health idea app.',
    date: '1/22/26',
    preview: 'Mental health app for the...',
    folder: 'Notes',
    active: false,
  },
  {
    title: 'Add preview for pdf,',
    date: '1/21/26',
    preview: 'Moving columns on Mac a...',
    folder: 'Notes',
    active: false,
  },
  {
    title: 'Cash App 3200$',
    date: '12/23/25',
    preview: 'Paypal 11 800',
    folder: 'Notes',
    active: false,
  },
];

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
        <button className="p-1.5 hover:bg-[#3d3d3d] rounded">
          <Trash2 className="w-4 h-4 text-[#f5b800]" />
        </button>
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
