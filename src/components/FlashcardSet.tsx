import { useState } from "react";
import { FlashcardType } from "../types";
import { Flashcard } from "./Flashcard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function FlashcardSet({ flashcards }: { flashcards: FlashcardType[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!flashcards.length) return null;

  const progressPercentage = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto gap-8">
      <div className="w-full">
        <Flashcard card={flashcards[currentIndex]} />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-8 w-full justify-center">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-all text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <span className="text-sm font-medium text-slate-400 tabular-nums">
            {String(currentIndex + 1).padStart(3, '0')} / {String(flashcards.length).padStart(3, '0')}
          </span>

          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition-all text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
