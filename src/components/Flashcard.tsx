import { useState } from "react";
import { FlashcardType } from "../types";

export function Flashcard({ card, key }: { card: FlashcardType; key?: string | number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group perspective-1000 w-full h-64 md:h-80 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute inset-0 backface-hidden bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest absolute top-6">
            Concept Preview
          </span>
          <p className="text-xl md:text-2xl font-light text-white leading-snug tracking-tight">
            {card.front}
          </p>
          <span className="absolute bottom-6 text-slate-500 text-sm italic opacity-0 group-hover:opacity-100 transition-opacity">
            Click card to view high-yield answer key
          </span>
        </div>

        {/* Back */}
        <div className="absolute inset-0 backface-hidden bg-slate-950/80 border border-blue-500/30 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.15)] p-6 flex flex-col items-center justify-center text-center rotate-y-180 relative overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 pointer-events-none"></div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest absolute top-6 relative z-10">
            Neuro-extracted Answer
          </span>
          <p className="text-lg md:text-xl text-blue-50/90 leading-relaxed overflow-y-auto w-full px-2 relative z-10">
            {card.back}
          </p>
        </div>
      </div>
    </div>
  );
}
