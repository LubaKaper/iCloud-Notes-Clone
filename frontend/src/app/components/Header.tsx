import { Search, Plus, Trash2, AlignLeft, List, LayoutGrid, Grid3x3, HelpCircle, UserCircle, Share2, Edit3 } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';

export type HeaderActionHandlers = {
  onDelete: () => void;
  onShare: () => void;
  onHelp: () => void;
  onAccount: () => void;
  onApps: () => void;
  onFocusEditor: () => void;
  onAlign: () => void;
  onListFormat: () => void;
  onGridFormat: () => void;
};

interface HeaderProps {
  onCreateNote: () => void;
  handlers?: HeaderActionHandlers;
  isCreating?: boolean;
}

export function Header({ onCreateNote, handlers, isCreating = false }: HeaderProps) {
  const { searchQuery, setSearchQuery } = useNotes();

  return (
    <header className="flex-shrink-0 h-14 px-4 flex items-center gap-4 bg-[#1e1e1e] border-b border-[#2d2d2d]">
      {/* Left: Title */}
      <div className="flex items-center gap-1 min-w-0">
        <span className="text-white text-sm">iCloud</span>
        <span className="text-[#f5b800] text-sm font-semibold">Notes</span>
      </div>

      {/* Center: Search + New Note */}
      <div className="flex-1 flex items-center gap-3 max-w-2xl">
        <div className="flex-1 flex items-center gap-2 bg-[#252525] rounded-md px-3 py-1.5 min-w-0">
          <Search className="w-4 h-4 text-[#8e8e8e] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search all notes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#8e8e8e] outline-none min-w-0"
          />
        </div>
        <button
          type="button"
          onClick={onCreateNote}
          disabled={isCreating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[#f5b800] text-sm font-medium hover:bg-[#2d2d2d] cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" />
          <span>{isCreating ? 'Creating...' : 'New Note'}</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={handlers?.onDelete}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Delete"
        >
          <Trash2 className="w-5 h-5 text-[#f5b800]" />
        </button>
        <button
          type="button"
          onClick={handlers?.onAlign}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Text alignment"
        >
          <AlignLeft className="w-5 h-5 text-[#b4b4b4]" />
        </button>
        <button
          type="button"
          onClick={handlers?.onListFormat}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Bullet list"
        >
          <List className="w-5 h-5 text-[#b4b4b4]" />
        </button>
        <button
          type="button"
          onClick={handlers?.onGridFormat}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Grid view"
        >
          <LayoutGrid className="w-5 h-5 text-[#b4b4b4]" />
        </button>
        <button
          type="button"
          onClick={handlers?.onApps}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Apps"
        >
          <Grid3x3 className="w-5 h-5 text-[#b4b4b4]" />
        </button>
        <button
          type="button"
          onClick={handlers?.onHelp}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Help"
        >
          <HelpCircle className="w-5 h-5 text-[#b4b4b4]" />
        </button>
        <button
          type="button"
          onClick={handlers?.onAccount}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Account"
        >
          <UserCircle className="w-5 h-5 text-[#b4b4b4]" />
        </button>
        <button
          type="button"
          onClick={handlers?.onShare}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Share"
        >
          <Share2 className="w-5 h-5 text-[#b4b4b4]" />
        </button>
        <button
          type="button"
          onClick={handlers?.onFocusEditor}
          className="p-2 hover:bg-[#2d2d2d] rounded cursor-pointer"
          title="Edit"
        >
          <Edit3 className="w-5 h-5 text-[#f5b800]" />
        </button>
      </div>
    </header>
  );
}
