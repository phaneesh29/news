"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../config";

export default function AddNewsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState("INFO_LEVEL");
  const [sourceUrl, setSourceUrl] = useState("");
  
  // Injector status
  const [injectionStatus, setInjectionStatus] = useState({ active: false, phase: "", progress: 0 });

  // Clock state
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setProfile(data.user);

        // Check permission - must be admin or editor
        if (data.user.role !== "admin" && data.user.role !== "editor") {
          router.push("/news");
          return;
        }
      } catch (err) {
        console.error("Auth check error", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Clock Update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      setSystemTime(`${dateStr}  ::  ${timeStr} UTC`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectPayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setInjectionStatus({ active: true, phase: "INITIALIZING HYPER-HANDSHAKE...", progress: 10 });

    try {
      let mappedPriority: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (priority === "CRITICAL_OVERRIDE") mappedPriority = 'critical';
      else if (priority === "WARNING_LEVEL") mappedPriority = 'high';
      else if (priority === "NOTICE_LEVEL") mappedPriority = 'medium';

      const payload = {
        title: title.toUpperCase(),
        content,
        priority: mappedPriority,
        tags: tags.split(",").map(t => t.trim().toUpperCase()).filter(Boolean),
        sourceUrl: sourceUrl || null
      };

      const res = await fetch(`${API_BASE_URL}/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to create news");
      
      const phases = [
        { msg: "BYPASSING GRID PACKET INSPECTORS...", delay: 400, progress: 35 },
        { msg: "ENCRYPTING COGNITIVE PAYLOAD...", delay: 800, progress: 65 },
        { msg: "PULSING BITS INTO METASPHERE FEED...", delay: 1200, progress: 90 },
        { msg: "PAYLOAD INJECTED SUCCESSFULLY! REDIRECTING...", delay: 1600, progress: 100 }
      ];

      phases.forEach((p) => {
        setTimeout(() => {
          setInjectionStatus((prev) => ({ ...prev, phase: p.msg, progress: p.progress }));
          
          if (p.progress === 100) {
            setTimeout(() => {
              setInjectionStatus({ active: false, phase: "", progress: 0 });
              router.push("/news");
            }, 600);
          }
        }, p.delay);
      });
    } catch (err) {
      console.error(err);
      setInjectionStatus({ active: true, phase: "TRANSMISSION FAILED!", progress: 0 });
      setTimeout(() => {
        setInjectionStatus({ active: false, phase: "", progress: 0 });
      }, 1800);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#060608] flex items-center justify-center font-mono text-emerald-400 text-2xl animate-pulse">
        [ DECRYPTING BIOMETRICS... PENDING ACCESS ]
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen w-screen bg-[#060608] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-emerald-500/30 selection:text-emerald-200 text-white font-mono">
      
      {/* Visual Desk Grid Surface */}
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>
      
      {/* Ambient glowing accent bulbs */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-red-950/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header HUD */}
      <header className="w-full flex justify-between items-center border-b border-zinc-800/80 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-white uppercase select-none hover:text-red-500 transition-colors">
              NEXUS <span className="text-red-600">CORE</span>
            </Link>
          </div>
          <span className="font-mono text-[11px] text-zinc-400 tracking-wider mt-1 uppercase">
            OPERATIVE: <span className="text-red-500/90 font-bold">{profile?.email}</span> // ROLE: <span className="text-zinc-300 font-bold">{profile?.role?.toUpperCase()}</span>
          </span>
        </div>

        {/* Navigation Deck Links */}
        <div className="hidden md:flex gap-6 text-xs font-bold uppercase self-center tracking-widest">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">&gt; Command Hub</Link>
          <Link href="/news" className="text-zinc-400 hover:text-white transition-colors">&gt; Chronicles Feed</Link>
          <Link href="/news/add" className="text-emerald-400 hover:text-emerald-300 transition-colors border-b border-emerald-400 pb-0.5">&gt; Payload Injector</Link>
        </div>

        <div className="flex gap-4">
          {isAdmin && (
            <Link 
              href="/settings"
              className="font-mono text-[10px] sm:text-xs border border-emerald-500/50 text-emerald-400 px-4 py-2.5 hover:bg-emerald-500/10 transition-all uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center gap-2"
            >
              <span>&gt;</span> Security Deck
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="font-mono text-[10px] sm:text-xs border border-red-500/50 text-red-500 px-4 py-2.5 hover:bg-red-500/10 transition-all uppercase tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.15)] flex items-center gap-2"
          >
            <span>X</span> Abort Session
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex items-center justify-center relative z-10 max-w-[800px] mx-auto w-full pb-8">
        
        {/* CENTER FOLDER: Cognitive Payload Typewriter */}
        <div className="flex flex-col relative w-full">
          <div className="absolute inset-0 bg-[#000]/65 rounded-2xl transform translate-x-1.5 translate-y-2 pointer-events-none z-0"></div>

          {/* Folder Body */}
          <div className="bg-[#e2c091] border-2 border-[#b89b65] rounded-2xl p-6 md:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex flex-col relative z-10">
            
            {/* Manila Spine Cover */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/15 to-transparent border-r border-stone-800/10"></div>
            
            {/* Folder tab */}
            <div className="absolute top-0 left-8 w-32 h-5 bg-[#e2c091] border-t-2 border-l border-r border-[#b89b65] -mt-5 rounded-t-lg z-0"></div>

            {/* Brass clip overlay */}
            <div className="absolute -top-4 left-1/3 z-20 drop-shadow-[1px_3px_2px_rgba(0,0,0,0.45)] pointer-events-none transform -rotate-[5deg]">
              <svg className="w-6 h-16" viewBox="0 0 24 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2 C17 2 21 6 21 12 L21 60 C21 68 15 74 8 74 C3 74 1 70 1 64 L1 22 C1 18 4 15 8 15 C12 15 14 18 14 22 L14 54" stroke="#8c9099" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Red stamp */}
            <div className="absolute top-4 right-6 border-[3px] border-red-700/80 text-red-700/80 text-[10px] font-bold tracking-widest px-3 py-1 rounded rotate-[14deg] pointer-events-none select-none uppercase text-center leading-none z-20">
              CLASSIFIED // RESTRICTED
            </div>

            <div className="border-b border-[#a8947a] pb-3 mb-5 pl-2">
              <h3 className="font-serif text-lg text-stone-900 uppercase tracking-wider font-black flex items-center gap-2">
                PAYLOAD INJECTOR
              </h3>
              <p className="font-mono text-[9px] text-red-800 font-bold mt-1 tracking-wider uppercase">
                Teletype Draft Protocol // STATUS: ON_GRID
              </p>
            </div>

            {/* Visual Typewriter Paper visual wrapper */}
            <div className="flex-1 bg-[#f4ecd8] border border-stone-300 rounded shadow-[inset_0_0_25px_rgba(139,90,43,0.15)] flex flex-col p-6 sm:p-8 relative">
              
              <div className="absolute -top-1.5 left-0 right-0 h-3 bg-gradient-to-b from-stone-900 to-stone-700 border-b border-stone-950 z-20 shadow-md"></div>
              
              {/* Paper texturized overlay */}
              <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBoNHYxSDB6bTAgMmg0djFIMHoiIGZpbGw9IiNlNWU1ZTUiIGZpbGwtb3BhY2l0eT0iLjQiLz4KPC9zdmc+')]"></div>

              <form onSubmit={handleInjectPayload} className="flex flex-col gap-6 pt-3 relative z-10 text-stone-900 font-serif text-left">
                
                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-xs font-bold text-stone-700 uppercase tracking-widest mb-1">
                    TRANSMISSION HEADLINE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COMPILER DISRUPTION IN BOMBAY MATRIX..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-bold text-base text-stone-950 placeholder-stone-600/40"
                  />
                </div>

                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-xs font-bold text-stone-700 uppercase tracking-widest mb-1">
                    SOURCE LINK
                  </label>
                  <input
                    type="url"
                    placeholder="https://gridleak.secure/..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-stone-900 placeholder-stone-600/40 font-mono"
                  />
                </div>

                <div className="flex flex-col flex-1 min-h-[140px] border-b border-stone-400 pb-2">
                  <label className="font-mono text-xs font-bold text-stone-700 uppercase tracking-widest mb-1">
                    DRAFT CHRONICLE DETAILS
                  </label>
                  <textarea
                    required
                    placeholder="Inject intelligence dispatch packets or system details here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-stone-950 placeholder-stone-600/40 min-h-[160px] leading-relaxed custom-paper-scrollbar"
                  />
                </div>

                {/* Priority Selection Bulb Controls */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-xs font-bold text-stone-700 uppercase tracking-widest">
                    ALERT URGENCY
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    {[
                      { key: "INFO_LEVEL", color: "bg-emerald-500", border: "border-emerald-600", text: "INFO" },
                      { key: "NOTICE_LEVEL", color: "bg-blue-500", border: "border-blue-600", text: "NOTICE" },
                      { key: "WARNING_LEVEL", color: "bg-amber-500", border: "border-amber-600", text: "WARNING" },
                      { key: "CRITICAL_OVERRIDE", color: "bg-red-500", border: "border-red-600", text: "CRITICAL" },
                    ].map((pr) => (
                      <button
                        key={pr.key}
                        type="button"
                        onClick={() => setPriority(pr.key)}
                        className={`py-1.5 rounded-lg border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${priority === pr.key ? "bg-stone-900 text-[#f4ecd8] border-stone-950 font-bold scale-[1.04]" : "bg-stone-300/40 text-stone-700 border-stone-400/50 hover:bg-stone-300"} `}
                      >
                        {/* Bulb Indicator */}
                        <span className={`w-2.5 h-2.5 rounded-full border ${pr.color} ${pr.border} ${priority === pr.key ? "animate-pulse shadow-[0_0_8px_rgba(0,0,0,1)]" : "opacity-60"}`}></span>
                        <span>{pr.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-xs font-bold text-stone-700 uppercase tracking-widest mb-1">
                    ROUTING LABELS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="AI, SECURITY, GLITCH..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-stone-900 placeholder-stone-600/40 font-mono font-bold"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 mt-2">
                  <Link
                    href="/news"
                    className="flex-1 bg-stone-300 text-stone-850 hover:bg-stone-400 border-2 border-stone-900 font-mono font-bold text-xs py-3.5 rounded uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[0_0_0_#000] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Cancel Draft
                  </Link>

                  <button
                    type="submit"
                    className="flex-[2] bg-red-800 text-stone-200 hover:bg-red-900 border-2 border-stone-900 font-mono font-bold text-sm py-3.5 rounded uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[0_0_0_#000] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                    Broadcast Draft
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>

      </div>

      {/* Footer HUD */}
      <footer className="w-full max-w-[1600px] mx-auto mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap justify-between items-center gap-4 text-[9px] font-mono text-zinc-500 z-10 px-1">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border border-red-700/85 flex items-center justify-center text-red-500 font-bold bg-red-950/20">
            N
          </div>
          <div>
            <span className="text-zinc-400 font-bold">NEXUS CORE v2.4.7</span>
            <span className="mx-2 text-zinc-700">|</span>
            <span>Grid Link: <span className="text-emerald-500 font-bold animate-pulse">ONLINE ●</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-red-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>DECK ENCRYPTION:</span>
          <span className="text-zinc-400 font-bold">AES-256 / RSA-4096</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>SYSTEM TIME:</span>
          <span className="text-zinc-300 font-bold">{systemTime || "[ SYNCHRONIZING TIME ]"}</span>
        </div>
      </footer>

      {/* Cyber Injector Progress Overlay */}
      {injectionStatus.active && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#050508] border-2 border-emerald-500 p-8 shadow-[0_0_50px_rgba(0,255,100,0.3)] flex flex-col gap-6 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500/20 scanline-sweep"></div>
            
            <h3 className="font-mono text-emerald-400 font-bold text-xl uppercase tracking-widest text-center animate-pulse">
              [ INJECTING PAYLOAD ]
            </h3>
            
            <div className="flex flex-col gap-2 font-mono text-xs text-emerald-400">
              <div className="flex justify-between">
                <span>PHASE: {injectionStatus.phase}</span>
                <span>{injectionStatus.progress}%</span>
              </div>
              <div className="w-full h-4 bg-emerald-950 border border-emerald-500/30 rounded overflow-hidden p-0.5">
                <div 
                  className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,1)] transition-all duration-300"
                  style={{ width: `${injectionStatus.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="font-mono text-[9px] text-emerald-700 space-y-1 max-h-24 overflow-hidden leading-none select-none">
              <div>&gt;&gt; BYPASSING ROUTING PACKET MATRIX... ENCRYPTING...</div>
              {injectionStatus.progress > 40 && <div>&gt;&gt; INJECTING TO BROADCAST NODES... BROADCAST SYNC OK</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
