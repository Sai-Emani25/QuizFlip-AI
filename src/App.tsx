import { useState, useRef } from "react";
import { Sparkles, FileText, Layers, BrainCircuit, GraduationCap, Github, Upload } from "lucide-react";
import { Flashcard } from "./components/Flashcard";
import { QuizQuestion } from "./components/QuizQuestion";
import { QuizResponse } from "./types";

export default function App() {
  const [inputText, setInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<QuizResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"input" | "flashcards" | "quiz">("input");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    let appendedText = "";
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            const text = await file.text();
            appendedText += `\n\n--- Document: ${file.name} ---\n\n${text}`;
        } catch (err) {
            console.error(`Failed to read ${file.name}`);
        }
    }
    if (appendedText) {
        setInputText(prev => prev + appendedText);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("Please paste some study material first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to generate learning assets");
      }

      setResult(json.data);
      setActiveTab("flashcards");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadDemoText = () => {
    setInputText(`The process of photosynthesis occurs in two main stages: the light-dependent reactions and the Calvin cycle (light-independent reactions). \n\nDuring the light-dependent reactions, which take place in the thylakoid membrane, chlorophyll absorbs light energy, which excites electrons that are used to generate ATP from ADP and reduce NADP+ to NADPH. Water is split to replace these lost electrons, releasing oxygen as a byproduct.\n\nIn the second stage, the Calvin cycle takes place in the stroma of the chloroplast. Here, ATP and NADPH produced in the light reactions are used to convert CO2 into a simple sugar called G3P (glyceraldehyde-3-phosphate). It takes three turns of the Calvin cycle to produce one net G3P molecule.`);
  };

  return (
    <div className="min-h-screen bg-[#020617] font-sans text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center font-bold text-white">
              <BrainCircuit strokeWidth={2.5} className="w-5 h-5" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              QuizFlip <span className="text-blue-400 font-light italic">Intelligence</span>
            </span>
          </div>
          {result && (
            <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                <span className="text-[10px] uppercase tracking-widest font-medium text-slate-400">Engine Active</span>
              </div>
              <div className="h-6 w-[1px] bg-slate-800"></div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                Level: {result.target_academic_level}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* State: Has Result, Tab Navigation */}
        {result && (
          <div className="flex gap-4 mb-8 pb-4 border-b border-slate-800/60 overflow-x-auto">
            <button
              onClick={() => setActiveTab("input")}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-full transition-colors whitespace-nowrap border ${
                activeTab === "input"
                  ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              <FileText className="w-4 h-4" />
              Source Material
            </button>
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-full transition-colors whitespace-nowrap border ${
                activeTab === "flashcards"
                  ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              <Layers className="w-4 h-4" />
              Practice Flashcards
              <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {result.flashcards.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm rounded-full transition-colors whitespace-nowrap border ${
                activeTab === "quiz"
                  ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-300"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Socratic Quiz
              <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {result.quiz_questions.length}
              </span>
            </button>
          </div>
        )}

        {/* View: Input */}
        {activeTab === "input" && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            {!result && (
              <div className="text-center mb-10 pt-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                  Transform notes into <span className="text-blue-400 flex-inline items-center gap-2">active recall</span>.
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                  Paste your lecture notes, study guides, or document text. Our pedagogical engine will extract core concepts into targeted flashcards and Socratic quizzes.
                </p>
              </div>
            )}

            <div 
              className={`bg-slate-900/50 rounded-2xl shadow-2xl border ${isDragging ? 'border-blue-500' : 'border-slate-800'} overflow-hidden flex flex-col backdrop-blur-md relative transition-colors`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 pointer-events-none"></div>
              <div className="bg-slate-950/20 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between relative z-10">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Type here!
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-slate-300 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700 px-3 py-1.5 rounded flex items-center gap-1.5 border border-slate-700/50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload Files
                  </button>
                  {!inputText && !isGenerating && (
                    <button 
                      onClick={loadDemoText}
                      className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded border border-blue-500/20"
                    >
                      Load Demo Data
                    </button>
                  )}
                </div>
              </div>
              <div className="relative z-10 flex-1 flex flex-col">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your syllabus, textbook summary, or raw lecture notes here... Or drag & drop text files."
                  className={`w-full flex-1 min-h-[20rem] lg:min-h-[24rem] p-6 focus:outline-none resize-none text-slate-300 leading-relaxed bg-transparent ${isDragging ? 'bg-blue-500/5' : ''}`}
                  disabled={isGenerating}
                />
                {isDragging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-20">
                    <div className="text-center">
                      <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3 animate-bounce" />
                      <p className="text-white font-medium text-lg">Drop files to add content</p>
                      <p className="text-slate-400 text-sm mt-1">Text-based files only (.txt, .md, .csv)</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
                <div className="text-sm text-red-400 font-medium">
                  {error && <p>{error}</p>}
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim()}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-slate-700 disabled:shadow-none border border-blue-500/50 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting Concepts...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Study Assets
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View: Flashcards */}
        {activeTab === "flashcards" && result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.flashcards.map((card) => (
                  <Flashcard key={card.id} card={card} />
                ))}
            </div>
          </div>
        )}

        {/* View: Quiz */}
        {activeTab === "quiz" && result && (
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {result.quiz_questions.map((q, idx) => (
              <QuizQuestion key={q.id} question={q} index={idx} />
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
