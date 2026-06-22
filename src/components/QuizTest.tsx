import { useState, useEffect } from "react";
import { QuizQuestionType, QuizAnalysisResponse } from "../types";
import { QuizQuestion } from "./QuizQuestion";
import { Play, RotateCcw, Trophy, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface QuizHistoryEntry {
  date: string;
  score: number;
  total: number;
  percentage: number;
}

export function QuizTest({ questions }: { questions: QuizQuestionType[] }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [hasFinished, setHasFinished] = useState(false);
  const [selectedInCurrent, setSelectedInCurrent] = useState(false);
  
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [analysis, setAnalysis] = useState<QuizAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<QuizHistoryEntry[]>([]);

  useEffect(() => {
    if (hasFinished) {
      const percentage = Math.round((score / questions.length) * 100);
      const newEntry: QuizHistoryEntry = {
        date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        score,
        total: questions.length,
        percentage
      };
      const existingStr = localStorage.getItem('quizflip_history');
      let existing: QuizHistoryEntry[] = [];
      try {
        existing = existingStr ? JSON.parse(existingStr) : [];
      } catch (e) {
        existing = [];
      }
      const updated = [...existing, newEntry];
      localStorage.setItem('quizflip_history', JSON.stringify(updated));
      setHistory(updated);
    }
  }, [hasFinished, score, questions.length]);

  const startTest = () => {
    setHasStarted(true);
    setCurrentIndex(0);
    setScore(0);
    setHasFinished(false);
    setSelectedInCurrent(false);
    setAnswers([]);
    setAnalysis(null);
  };

  const fetchAnalysis = async (finalAnswers: boolean[]) => {
    setIsAnalyzing(true);
    try {
      const results = questions.map((q, i) => ({
        question: q.question,
        correct: finalAnswers[i] ?? false
      }));
      
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results })
      });
      const json = await res.json();
      if (res.ok) {
        setAnalysis(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch analysis", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedInCurrent(false);
    } else {
      setHasFinished(true);
      fetchAnalysis(answers);
    }
  };

  const handleAnswer = (isCorrect: boolean) => {
    setSelectedInCurrent(true);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = isCorrect;
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  if (!hasStarted) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <Trophy className="w-16 h-16 text-blue-500 mb-6" />
        <h2 className="text-2xl font-semibold text-white mb-2">Ready to test your knowledge?</h2>
        <p className="text-slate-400 mb-8 text-center max-w-md">
          This test includes {questions.length} questions. Answer them to see your final score.
        </p>
        <button
          onClick={startTest}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all"
        >
          <Play className="w-5 h-5 fill-current" />
          Start Test
        </button>
      </div>
    );
  }

  if (hasFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div className="relative mb-8">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-800"
            />
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={377}
              strokeDashoffset={377 - (377 * percentage) / 100}
              className={`${percentage >= 80 ? 'text-emerald-500' : percentage >= 50 ? 'text-blue-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{percentage}%</span>
          </div>
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">Test Completed</h2>
        <p className="text-slate-400 mb-8">
          You scored {score} out of {questions.length}.
        </p>

        {isAnalyzing ? (
          <div className="w-full max-w-lg mt-8 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 flex flex-col items-center justify-center animate-pulse">
            <svg className="animate-spin h-6 w-6 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-blue-400 text-sm font-semibold tracking-wider uppercase">Generating AI Progress Analysis...</p>
          </div>
        ) : analysis ? (
          <div className="w-full max-w-2xl mt-8 text-left bg-slate-900/80 rounded-xl border border-slate-700 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-3">AI Progress Analysis</h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">{analysis.summary}</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s: string, idx: number) => (
                      <li key={idx} className="text-slate-300 text-xs bg-slate-800/50 p-2 rounded border border-slate-700/50">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                 <h4 className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div> Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {analysis.areas_for_improvement.map((s: string, idx: number) => (
                      <li key={idx} className="text-slate-300 text-xs bg-slate-800/50 p-2 rounded border border-slate-700/50">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {history && history.length > 0 && (
          <div className="w-full max-w-2xl mt-8 p-6 bg-slate-900/80 rounded-xl border border-slate-700 shadow-xl overflow-hidden">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Your Performance History
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                    itemStyle={{ color: '#60a5fa' }}
                    formatter={(value: number) => [`${value}%`, 'Score']}
                    labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4, stroke: '#1e293b' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <button
          onClick={startTest}
          className="mt-8 flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-semibold border border-slate-700 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          Restart Test
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-semibold text-blue-400">
          Score: {score}
        </span>
      </div>
      
      {/* We add a specific key here so that QuizQuestion fully remounts/resets internal state (like selectedOption) when the index changes, avoiding state bleeding between questions */}
      <QuizQuestion 
        key={`${currentQuestion.id}-${currentIndex}`} 
        question={currentQuestion} 
        index={currentIndex} 
        onAnswer={handleAnswer} 
      />

      <div className="flex justify-end mt-4">
        <button
          onClick={handleNext}
          disabled={!selectedInCurrent}
          className={`px-8 py-3 rounded-full font-bold transition-all ${
            selectedInCurrent 
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
              : "bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed"
          }`}
        >
          {currentIndex < questions.length - 1 ? "Next Question" : "Finish Test"}
        </button>
      </div>
    </div>
  );
}
