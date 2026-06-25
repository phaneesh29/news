"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  quizQuestions, 
  getRandomQuestions, 
  getUniqueRoles, 
  QuizQuestion, 
  Difficulty 
} from "@/lib/quiz-data";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle2, XCircle, Flame, Trophy, ChevronDown } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type GameState = "start" | "playing" | "results";

export default function QuizPage() {
  const [gameState, setGameState] = useState<GameState>("start");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  
  // Settings
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const roles = getUniqueRoles();

  const startGame = () => {
    const q = getRandomQuestions(
      999, 
      roleFilter === "all" ? undefined : roleFilter, 
      difficultyFilter === "all" ? undefined : (difficultyFilter as Difficulty)
    );
    if (q.length === 0) {
      alert("No questions found for the selected filters. Please adjust and try again.");
      return;
    }
    setQuestions(q);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedAnswer(null);
    setIsAnswerChecked(false);
    setGameState("playing");
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswerChecked) return; // Prevent changing answer after checking
    setSelectedAnswer(index);
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    
    setIsAnswerChecked(true);
    
    const isCorrect = selectedAnswer === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const newStreak = s + 1;
        setMaxStreak(max => Math.max(max, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setIsAnswerChecked(false);
    } else {
      setGameState("results");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground newspaper-theme-layout p-4 sm:p-8 font-newspaper selection:bg-[#cc785c] selection:text-white pb-24">
      <div className="mx-auto max-w-5xl pt-8">
        
        {/* Header Back Button */}
        <div className="mb-8 flex items-center justify-between border-b-4 border-double border-current pb-4">
          <Link href="/playables" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-current hover:text-[#cc785c] transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Playables
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-blackletter text-2xl tracking-wide">DevBits Playables</span>
          </div>
        </div>

        {gameState === "start" && (
          <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-8 vintage-shadow-lg text-center space-y-8 relative overflow-hidden">
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-current"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-current"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-current"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-current"></div>

            <div className="space-y-4 relative z-10">
              <h1 className="font-blackletter text-4xl sm:text-5xl text-current tracking-wide">Technical Interview Simulator</h1>
              <p className="font-sans text-sm italic opacity-80 uppercase tracking-widest max-w-lg mx-auto">
                Rigorous, role-based technical interview preparation to test your depth of engineering knowledge.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-6 pt-4 text-left relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase font-sans tracking-[0.15em] opacity-80 block text-[#cc785c]">
                  SELECT ROLE:
                </label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full rounded-none border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-3 h-14 text-sm font-mono transition-all hover:-translate-y-1 vintage-shadow-sm focus:ring-0 focus:ring-offset-0 focus:border-[#cc785c]">
                    <SelectValue placeholder="Jack of All Trades" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] vintage-shadow-sm p-0">
                    <SelectItem value="all" className="font-mono cursor-pointer hover:bg-[#cc785c]/10 focus:bg-[#cc785c] focus:!text-white focus:*:text-white rounded-none p-3">Jack of All Trades</SelectItem>
                    {roles.map(r => (
                      <SelectItem key={r} value={r} className="font-mono cursor-pointer hover:bg-[#cc785c]/10 focus:bg-[#cc785c] focus:!text-white focus:*:text-white rounded-none p-3 border-t border-[#111111]/10 dark:border-[#e6dfd8]/10">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase font-sans tracking-[0.15em] opacity-80 block text-[#cc785c]">
                  DIFFICULTY LEVEL:
                </label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="w-full rounded-none border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-3 h-14 text-sm font-mono transition-all hover:-translate-y-1 vintage-shadow-sm focus:ring-0 focus:ring-offset-0 focus:border-[#cc785c]">
                    <SelectValue placeholder="Mixed Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] vintage-shadow-sm p-0">
                    <SelectItem value="all" className="font-mono cursor-pointer hover:bg-[#cc785c]/10 focus:bg-[#cc785c] focus:!text-white focus:*:text-white rounded-none p-3">Mixed Difficulty</SelectItem>
                    <SelectItem value="easy" className="font-mono cursor-pointer hover:bg-[#cc785c]/10 focus:bg-[#cc785c] focus:!text-white focus:*:text-white rounded-none p-3 border-t border-[#111111]/10 dark:border-[#e6dfd8]/10">Easy</SelectItem>
                    <SelectItem value="medium" className="font-mono cursor-pointer hover:bg-[#cc785c]/10 focus:bg-[#cc785c] focus:!text-white focus:*:text-white rounded-none p-3 border-t border-[#111111]/10 dark:border-[#e6dfd8]/10">Medium</SelectItem>
                    <SelectItem value="hard" className="font-mono cursor-pointer hover:bg-[#cc785c]/10 focus:bg-[#cc785c] focus:!text-white focus:*:text-white rounded-none p-3 border-t border-[#111111]/10 dark:border-[#e6dfd8]/10">Hard</SelectItem>
                    <SelectItem value="expert" className="font-mono cursor-pointer hover:bg-[#cc785c]/10 focus:bg-[#cc785c] focus:!text-white focus:*:text-white rounded-none p-3 border-t border-[#111111]/10 dark:border-[#e6dfd8]/10">Expert</SelectItem>
                    <SelectItem value="chaos" className="font-mono cursor-pointer hover:bg-[#cc785c]/10 focus:bg-[#cc785c] focus:!text-white focus:*:text-white rounded-none p-3 border-t border-[#111111]/10 dark:border-[#e6dfd8]/10">Chaos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={startGame}
                className="w-full bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] font-bold uppercase tracking-widest h-14 rounded-none vintage-shadow-sm transition-all text-sm mt-4 cursor-pointer hover:-translate-y-1"
              >
                Commence Quiz
              </Button>
            </div>
          </div>
        )}

        {gameState === "playing" && questions.length > 0 && (
          <div className="space-y-6">
            
            {/* Top Stats Bar */}
            <div className="flex items-center justify-between border-b-2 border-current pb-4 flex-wrap gap-4">
              <div className="font-mono text-sm font-bold flex items-center gap-4">
                <span>DISPATCH {currentIndex + 1} <span className="opacity-50 mx-1">/</span> {questions.length}</span>
                <button 
                  onClick={() => setGameState("results")}
                  className="text-xs font-bold uppercase tracking-wider text-[#c64545] hover:bg-[#c64545]/10 border-2 border-[#c64545] px-3 py-1 transition-colors cursor-pointer rounded-none"
                >
                  Stop Assessment
                </button>
              </div>
              
              <div className="flex gap-6">
                <div className="flex items-center gap-2 font-mono font-bold text-[#cc785c]">
                  <Flame className={`h-5 w-5 ${streak > 2 ? 'animate-pulse' : ''}`} />
                  <span>x{streak}</span>
                </div>
                <div className="font-mono font-bold uppercase tracking-wider">
                  Score: {score}
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-5 sm:p-8 vintage-shadow-lg relative transition-all duration-300">
              <div className="absolute top-0 right-0 bg-[#cc785c] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 font-mono border-b-2 border-l-2 border-[#111111] dark:border-[#e6dfd8]">
                {questions[currentIndex].difficulty}
              </div>
              <div className="text-[10px] font-bold uppercase font-sans tracking-[0.15em] opacity-80 block text-[#cc785c] mb-3">
                ROLE: {questions[currentIndex].role}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-6">
                {questions[currentIndex].question}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {questions[currentIndex].options.map((opt, idx) => {
                  let baseClass = "p-3 flex items-center gap-3 transition-all duration-150 rounded-sm relative cursor-pointer ";
                  
                  if (isAnswerChecked) {
                    if (idx === questions[currentIndex].correctAnswer) {
                      baseClass += "border-2 border-emerald-600 bg-emerald-600/10 text-emerald-800 dark:text-emerald-400 mt-[2px]";
                    } else if (idx === selectedAnswer) {
                      baseClass += "border-2 border-[#c64545] bg-[#c64545]/10 text-[#c64545] mt-[2px]";
                    } else {
                      baseClass += "border-2 border-b-4 border-current opacity-40 cursor-not-allowed";
                    }
                  } else if (selectedAnswer === idx) {
                    baseClass += "border-2 border-[#cc785c] bg-[#cc785c]/20 mt-[2px]";
                  } else {
                    baseClass += "border-2 border-b-4 border-current hover:bg-[#cc785c]/10 active:border-b-2 active:mt-[2px]";
                  }

                  return (
                    <div 
                      key={idx}
                      onClick={() => handleSelectAnswer(idx)}
                      className={baseClass}
                    >
                      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-bold border-2 ${isAnswerChecked && idx === questions[currentIndex].correctAnswer ? 'border-emerald-600 bg-emerald-600 text-white' : isAnswerChecked && idx === selectedAnswer ? 'border-[#c64545] bg-[#c64545] text-white' : selectedAnswer === idx ? 'border-[#cc785c] bg-[#cc785c] text-white' : 'border-current'}`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="font-mono text-xs sm:text-sm flex-grow leading-tight pr-6">
                        {opt}
                      </div>
                      
                      {isAnswerChecked && idx === questions[currentIndex].correctAnswer && (
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 flex-shrink-0 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                      {isAnswerChecked && idx === selectedAnswer && idx !== questions[currentIndex].correctAnswer && (
                        <XCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#c64545] flex-shrink-0 absolute right-3 top-1/2 -translate-y-1/2" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explanation & Next Button */}
            {isAnswerChecked && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 border-2 border-current bg-[#111111]/5 dark:bg-[#e6dfd8]/5 p-4 sm:p-5 border-l-4 border-l-[#cc785c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="font-bold uppercase tracking-wider mb-1 text-xs text-[#cc785c]">Editor's Note:</h3>
                  <p className="font-mono text-xs sm:text-sm opacity-80 leading-relaxed">
                    {questions[currentIndex].explanation}
                  </p>
                </div>
                
                <div className="flex-shrink-0 w-full sm:w-auto">
                  <Button 
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto bg-[#111111] dark:bg-[#e6dfd8] text-white dark:text-[#111111] hover:bg-[#cc785c] dark:hover:bg-[#cc785c] hover:text-white dark:hover:text-white border-2 border-[#111111] dark:border-[#e6dfd8] font-bold uppercase tracking-wider h-12 px-6 rounded-none transition-all text-sm cursor-pointer group"
                  >
                    {currentIndex < questions.length - 1 ? (
                      <>Next <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                    ) : (
                      <>Finish <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Check Button (if not checked) */}
            {!isAnswerChecked && (
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={handleCheckAnswer}
                  disabled={selectedAnswer === null}
                  className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] font-bold uppercase tracking-wider h-12 px-8 rounded-none vintage-shadow-sm transition-all text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#cc785c]"
                >
                  Confirm Answer
                </Button>
              </div>
            )}
          </div>
        )}

        {gameState === "results" && (
          <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-8 sm:p-12 vintage-shadow-lg text-center space-y-10 relative">
             <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-transparent via-[#cc785c] to-transparent opacity-50"></div>
             
             <Trophy className="h-20 w-20 mx-auto text-[#cc785c] mb-6" strokeWidth={1.5} />

             <div>
               <h2 className="font-blackletter text-4xl sm:text-5xl text-current tracking-wide mb-4">Official Assessment</h2>
               <p className="font-sans text-sm italic opacity-80 uppercase tracking-widest">
                 Your technical evaluation is complete.
               </p>
             </div>

             <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
               <div className="border-2 border-current p-6">
                 <div className="text-[10px] font-bold uppercase font-sans tracking-[0.15em] opacity-80 block text-[#cc785c] mb-2">FINAL SCORE</div>
                 <div className="text-4xl font-bold font-mono">
                   {score} <span className="text-lg opacity-50">/ {isAnswerChecked ? currentIndex + 1 : currentIndex}</span>
                 </div>
               </div>
               <div className="border-2 border-current p-6">
                 <div className="text-[10px] font-bold uppercase font-sans tracking-[0.15em] opacity-80 block text-[#cc785c] mb-2">MAX STREAK</div>
                 <div className="text-4xl font-bold font-mono flex items-center justify-center gap-2">
                    {maxStreak} <Flame className="h-6 w-6 text-[#cc785c]" />
                  </div>
                </div>
             </div>

             <div className="flex flex-wrap justify-center gap-4 text-sm font-mono mt-6">
               <div className="border-2 border-current px-4 py-2 bg-[#cc785c]/10">
                 <span className="opacity-60 text-xs uppercase tracking-wider block mb-1">Role</span>
                 <span className="font-bold">{roleFilter || "Jack of All Trades"}</span>
               </div>
               <div className="border-2 border-current px-4 py-2 bg-[#cc785c]/10 capitalize">
                 <span className="opacity-60 text-xs uppercase tracking-wider block mb-1">Difficulty</span>
                 <span className="font-bold">{difficultyFilter || "Mixed"}</span>
               </div>
             </div>

              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just scored ${score} on the ${roleFilter || 'Jack of All Trades'} (${difficultyFilter || 'Mixed'}) Technical Interview Simulator! Can you beat my score?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-current px-4 py-3 hover:bg-[#cc785c] hover:text-white hover:border-[#cc785c] transition-colors font-bold uppercase text-xs tracking-widest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg> Share to X
                </a>
                <a 
                  href={`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(`I just scored ${score} on the ${roleFilter || 'Jack of All Trades'} (${difficultyFilter || 'Mixed'}) Technical Interview Simulator! Can you beat my score?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border-2 border-current px-4 py-3 hover:bg-[#cc785c] hover:text-white hover:border-[#cc785c] transition-colors font-bold uppercase text-xs tracking-widest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> Share to LinkedIn
                </a>
             </div>

             <div className="pt-8">
               <Button 
                 onClick={() => setGameState("start")}
                 className="bg-[#111111] dark:bg-[#e6dfd8] text-white dark:text-[#111111] hover:bg-[#cc785c] dark:hover:bg-[#cc785c] hover:text-white dark:hover:text-white border-2 border-[#111111] dark:border-[#e6dfd8] font-bold uppercase tracking-widest h-14 px-10 rounded-none vintage-shadow-sm transition-all text-sm cursor-pointer"
               >
                 <RefreshCw className="mr-2 h-4 w-4" /> Try Another Assessment
               </Button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
