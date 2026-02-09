import { HelpCircle, Grid3x3, UserCircle, Share2, Edit3, AlignLeft, ListOrdered, Grid } from 'lucide-react';

export function NoteViewer() {
  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col">
      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-[#2d2d2d] flex items-center justify-between">
        <div className="flex-1"></div>
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
          <h1 className="text-4xl mb-8 text-white">3.</h1>
          
          <div className="space-y-6 text-[#e0e0e0] leading-relaxed">
            <p>
              "We redesigned the Taste page around one core idea: users should be able to express their preferences clearly and confidently without needing expert knowledge.
            </p>
            
            <p>
              Instead of creating a taste profile that works across all wine categories. Instead of configuring preferences separately for reds, whites, or sparkling wines, users set their taste once using discrete, clearly labeled options—like Dry, Medium, or Sweet—and memorable categories such as sweetness, body, tannins, and acidity.
            </p>
            
            <p>
              We also replaced overly broad price sliders with realistic price buckets, so users can quickly choose ranges that feel relevant. Behind the scenes, the system translates these inputs across all wine types, but from the user's perspective, the experience is simple and understandable."
            </p>
            
            <p>5,</p>
            
            <p>
              "By reducing cognitive load and removing false precision, we help casual wine buyers move from curiosity to confidence. One taste profile, all wine types, less overwhelm—and better decisions."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
