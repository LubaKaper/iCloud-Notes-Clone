import { HelpCircle, Grid3x3, UserCircle, Share2, Edit3, AlignLeft, ListOrdered, Grid, Trash2 } from 'lucide-react';

export function NoteViewer() {
  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-[#2d2d2d] flex items-center justify-between">
        <div className="flex-1 flex items-center gap-3">
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Trash2 className="w-5 h-5 text-[#f5b800]" />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <AlignLeft className="w-4 h-4 text-[#f5b800]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <ListOrdered className="w-4 h-4 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Grid className="w-4 h-4 text-[#b4b4b4]" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-end gap-3">
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <HelpCircle className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Grid3x3 className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <UserCircle className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Share2 className="w-5 h-5 text-[#b4b4b4]" />
          </button>
          <button className="p-1 hover:bg-[#2d2d2d] rounded">
            <Edit3 className="w-5 h-5 text-[#f5b800]" />
          </button>
        </div>
      </div>

      {/* Note Content */}
      <div className="flex-1 overflow-y-auto px-24 py-8">
        <div className="max-w-3xl">
          <div className="flex items-center justify-center h-full text-[#8e8e8e] text-sm">
            Select a note or create a new one
          </div>
        </div>
      </div>
    </div>
  );
}
