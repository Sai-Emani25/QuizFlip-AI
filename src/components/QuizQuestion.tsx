import { useState } from "react";
import { QuizQuestionType } from "../types";
import { CheckCircle2, XCircle, Lightbulb, GraduationCap } from "lucide-react";

export function QuizQuestion({
  question,
  index,
}: {
  question: QuizQuestionType;
  index: number;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = selectedOption === question.correct_answer;
  const hasAnswered = selectedOption !== null;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg mb-6 transition-all backdrop-blur-sm relative overflow-hidden">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-[0.03] pointer-events-none"></div>
      <div className="flex items-start gap-4 mb-6 relative z-10">
        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/50 text-blue-400 border border-blue-500/30 font-bold text-sm shadow-[0_0_10px_rgba(59,130,246,0.3)]">
          {index + 1}
        </span>
        <h3 className="text-lg font-light text-white leading-snug tracking-tight pt-1">
          {question.question}
        </h3>
      </div>

      <div className="space-y-3 pl-0 md:pl-12">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          const isActuallyCorrect = option === question.correct_answer;

          let optionStyle =
            "border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10 text-slate-300 bg-slate-900/80 cursor-pointer";

          if (hasAnswered) {
            if (isActuallyCorrect) {
              optionStyle = "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
            } else if (isSelected && !isActuallyCorrect) {
              optionStyle = "border-red-500/50 bg-red-500/10 text-red-300";
            } else {
              optionStyle = "border-slate-800 bg-slate-900/40 text-slate-500 opacity-50 cursor-default";
            }
          }

          return (
            <div
              key={idx}
              onClick={() => {
                if (!hasAnswered) {
                  setSelectedOption(option);
                }
              }}
              className={`w-full p-4 border rounded-xl flex items-center justify-between transition-colors ${optionStyle} ${!hasAnswered ? "active:scale-[0.99]" : ""}`}
            >
              <span>{option}</span>
              {hasAnswered && isActuallyCorrect && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
              {hasAnswered && isSelected && !isActuallyCorrect && (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          );
        })}
      </div>

      {hasAnswered && !isCorrect && (
        <div className="mt-6 mb-2 pl-0 md:pl-12 relative z-10">
          {!showHint ? (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Request Socratic Hint
            </button>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl text-sm flex items-start gap-3 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
              <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
              <p>{question.socratic_hint}</p>
            </div>
          )}
        </div>
      )}

      {hasAnswered && (
        <div className="mt-6 pl-0 md:pl-12 animate-in fade-in slide-in-from-top-4 duration-500 relative z-10">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 text-sm text-blue-100 leading-relaxed flex gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <GraduationCap className="w-5 h-5 flex-shrink-0 text-blue-400 mt-0.5 pl-1" />
            <div className="pl-1">
              <strong className="block font-semibold mb-2 text-white tracking-widest text-[10px] uppercase">
                Intelligence Explanation
              </strong>
              <p>{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
