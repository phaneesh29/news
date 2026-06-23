"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Terminal, AlertTriangle, ShieldAlert, CheckCircle2, Activity, ShieldCheck, HeartPulse } from "lucide-react";
import { scenarios } from "@/lib/incident-data";

export default function IncidentSimulator() {
  const scenario = scenarios[0];
  const [currentNodeId, setCurrentNodeId] = useState(scenario.startNodeId);
  const [integrity, setIntegrity] = useState(100);
  const [trust, setTrust] = useState(100);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [history, setHistory] = useState<{ text: string; type: string; id: number }[]>([]);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const currentNode = scenario.nodes[currentNodeId];

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedText, history]);

  // Typewriter effect
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText("");
    let index = 0;
    const speed = 25; // ms per char
    
    const interval = setInterval(() => {
      setDisplayedText(currentNode.text.substring(0, index + 1));
      index++;
      if (index >= currentNode.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [currentNode.id, currentNode.text]);

  const handleChoice = (choice: any) => {
    if (isTyping) return;
    
    if (choice.impact) {
      if (choice.impact.integrity) setIntegrity(prev => Math.max(0, Math.min(100, prev + choice.impact.integrity!)));
      if (choice.impact.trust) setTrust(prev => Math.max(0, Math.min(100, prev + choice.impact.trust!)));
    }
    
    setHistory(prev => [
      ...prev, 
      { text: currentNode.text, type: currentNode.type, id: Date.now() }, 
      { text: `> EXECUTE: ${choice.label}`, type: 'choice', id: Date.now() + 1 }
    ]);
    
    setCurrentNodeId(choice.nextNodeId);
  };

  const resetGame = () => {
    setIntegrity(100);
    setTrust(100);
    setHistory([]);
    setCurrentNodeId(scenario.startNodeId);
  };

  const getTextColor = (type: string) => {
    switch(type) {
      case 'critical': return 'text-red-500 font-bold';
      case 'failure': return 'text-red-600 font-bold';
      case 'alert': return 'text-amber-500';
      case 'success': return 'text-emerald-500 font-bold';
      case 'choice': return 'text-[#cc785c] opacity-80';
      default: return 'text-current';
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'critical': return <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />;
      case 'failure': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'alert': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      default: return <Terminal className="h-5 w-5 text-current opacity-50" />;
    }
  };

  return (
    <div className="h-screen bg-background text-foreground newspaper-theme-layout p-2 sm:p-4 font-newspaper selection:bg-[#cc785c] selection:text-white flex flex-col overflow-hidden">
      <div className="mx-auto max-w-4xl w-full flex-1 flex flex-col relative z-10 h-full overflow-hidden">
        
        {/* Header Navigation */}
        <div className="mb-2 flex justify-between items-center border-b-4 border-double border-current pb-2">
          <Link href="/playables" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-current hover:text-[#cc785c] transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Playables
          </Link>
          <div className="text-xs uppercase tracking-widest font-mono opacity-80 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#cc785c] animate-pulse" />
            Live Dispatch Stream
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h1 className="font-blackletter text-3xl sm:text-4xl text-current tracking-wide mb-1">Emergency Dispatch</h1>
          <p className="font-sans text-xs italic opacity-80 uppercase tracking-widest">
            Scenario: {scenario.title}
          </p>
        </div>

        {/* HUD (Health Bars) */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-4 vintage-shadow">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
              <span className="flex items-center gap-2 font-sans"><HeartPulse className="h-4 w-4" /> System Integrity</span>
              <span className="font-mono">{integrity}%</span>
            </div>
            <div className="w-full h-3 border-2 border-current bg-background overflow-hidden p-0.5">
              <div 
                className={`h-full transition-all duration-1000 ${integrity < 30 ? 'bg-red-600' : integrity < 70 ? 'bg-amber-500' : 'bg-emerald-600'}`} 
                style={{ width: `${integrity}%` }}
              />
            </div>
          </div>
          <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-4 vintage-shadow">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2">
              <span className="flex items-center gap-2 font-sans"><ShieldCheck className="h-4 w-4" /> Public Trust</span>
              <span className="font-mono">{trust}%</span>
            </div>
            <div className="w-full h-3 border-2 border-current bg-background overflow-hidden p-0.5">
              <div 
                className={`h-full transition-all duration-1000 ${trust < 30 ? 'bg-red-600' : trust < 70 ? 'bg-amber-500' : 'bg-[#4a9eff]'}`} 
                style={{ width: `${trust}%` }}
              />
            </div>
          </div>
        </div>

        {/* Paper Window */}
        <div className="flex-1 border-4 border-[#111111] bg-[#0a0400] text-[#ff9d3b] p-4 sm:p-6 flex flex-col vintage-shadow-lg relative overflow-y-auto font-mono min-h-0 terminal-scrollbar">
          
          {/* Decorative Corners */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-current opacity-30"></div>
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-current opacity-30"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-current opacity-30"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-current opacity-30"></div>

          {/* History */}
          <div className="space-y-8 mb-8 opacity-70">
            {history.map((item) => (
              <div key={item.id} className={`flex gap-4 ${getTextColor(item.type)}`}>
                <div className="mt-1 flex-shrink-0">{item.type === 'choice' ? <span className="font-bold">&gt;&gt;</span> : getIcon(item.type)}</div>
                <div className="leading-relaxed text-sm sm:text-base">
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          {/* Current Node */}
          <div className={`flex gap-4 ${getTextColor(currentNode.type)}`}>
            <div className="mt-1 flex-shrink-0">{getIcon(currentNode.type)}</div>
            <div className="leading-relaxed text-sm sm:text-base font-medium min-h-[4rem]">
              {displayedText}
              {isTyping && <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1 align-middle"></span>}
            </div>
          </div>

          <div ref={bottomRef} />
        </div>

        {/* Actions Menu */}
        <div className="mt-4 border-t-4 border-double border-current pt-4">
          <div className="text-xs uppercase tracking-widest font-bold mb-3 flex items-center gap-2 font-sans opacity-80">
            <Terminal className="h-4 w-4" /> Available Directives
          </div>
          
          <div className="flex flex-col gap-2 font-mono">
            {currentNode.choices ? (
              currentNode.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  disabled={isTyping}
                  className="group w-full text-left p-3 border-2 border-current hover:opacity-60 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-start gap-4"
                >
                  <span className="font-bold opacity-60 group-hover:opacity-100 mt-0.5">[{choice.id.toUpperCase()}]</span>
                  <span className="text-sm sm:text-base leading-tight font-medium">{choice.label}</span>
                </button>
              ))
            ) : (
              <button
                onClick={resetGame}
                disabled={isTyping}
                className="w-full text-center p-4 border-4 border-current hover:bg-[#cc785c] hover:border-[#cc785c] hover:text-white transition-all font-bold tracking-widest uppercase disabled:opacity-50 text-xl font-blackletter"
              >
                Draft New Simulation
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
