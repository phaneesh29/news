"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  sourceUrl?: string | null;
  priority: string;
  tags: string[];
  createdAt: string;
  status: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // News State
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  // Selected News for Inspector Dossier
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

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

  // Live Terminal Log System
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SYS_INIT: mounting secure decryption deck...",
    "TELEMETRY: active connection established.",
    "DB_DECK: mapping operative indices...",
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const fetchNews = async (cursor: string | null = null, query: string = "", isAppend = false) => {
    try {
      setFetchLoading(true);
      let url = "";
      if (query) {
        url = `http://localhost:8000/api/news/search?q=${encodeURIComponent(query)}&limit=10`;
        addLog(`DB_QUERY: scanning news nodes for query '${query}'`);
      } else {
        url = `http://localhost:8000/api/news?limit=10${cursor ? `&cursor=${cursor}` : ""}`;
        addLog(cursor ? `DB_DECK: pulling next cursor block ${cursor.slice(0, 8)}...` : "DB_DECK: synchronizing active broadcasts feed...");
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      
      const items = (data.news || []).map((item: any) => ({
        ...item,
        status: "SYNCED"
      }));

      if (isAppend) {
        setNewsList((prev) => [...prev, ...items]);
      } else {
        setNewsList(items);
      }
      
      setNextCursor(query ? null : data.nextCursor || null);
      addLog(`DB_DECK: successfully mounted ${items.length} telemetry records`);
    } catch (err) {
      console.error("Fetch news error:", err);
      addLog("WARNING: database news retrieval returned null or failed");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/profile", { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setProfile(data.user);
        addLog(`SEC_DECK: biometrics verified. user role: '${data.user.role}'`);
      } catch (err) {
        console.error("Dashboard auth check error", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (profile) {
        fetchNews(null, searchQuery, false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, profile]);

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
      addLog("SEC_DECK: aborting session, purging local cookie keys...");
      await fetch("http://localhost:8000/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectPayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    addLog(`SYS: payload injection initialized: '${title.slice(0, 15)}...'`);
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

      const res = await fetch("http://localhost:8000/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to create news");
      const data = await res.json();
      
      const createdItem = {
        ...data.news,
        status: "SYNCED"
      };

      const phases = [
        { msg: "BYPASSING GRID PACKET INSPECTORS...", delay: 500, progress: 35 },
        { msg: "ENCRYPTING COGNITIVE PAYLOAD...", delay: 1100, progress: 65 },
        { msg: "PULSING BITS INTO METASPHERE FEED...", delay: 1700, progress: 90 },
        { msg: "PAYLOAD INJECTED SUCCESSFULLY!", delay: 2200, progress: 100 }
      ];

      phases.forEach((p) => {
        setTimeout(() => {
          setInjectionStatus((prev) => ({ ...prev, phase: p.msg, progress: p.progress }));
          
          if (p.progress === 100) {
            setNewsList((prev) => [createdItem, ...prev]);
            addLog(`SYS_BROADCAST: broadcast packet ${createdItem.id.slice(0, 8)} successfully linked`);
            
            setTitle("");
            setContent("");
            setTags("");
            setPriority("INFO_LEVEL");
            setSourceUrl("");

            setTimeout(() => {
              setInjectionStatus({ active: false, phase: "", progress: 0 });
            }, 800);
          }
        }, p.delay);
      });
    } catch (err) {
      console.error(err);
      addLog("WARNING: payload injection failure");
      setInjectionStatus({ active: true, phase: "TRANSMISSION FAILED!", progress: 0 });
      setTimeout(() => {
        setInjectionStatus({ active: false, phase: "", progress: 0 });
      }, 1800);
    }
  };

  const handlePurge = async (id: string) => {
    try {
      addLog(`SEC_DECK: initializing purge coordinates for record ${id.slice(0, 8)}`);
      const res = await fetch(`http://localhost:8000/api/news/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete news");

      setNewsList((prev) => prev.filter(item => item.id !== id));
      if (selectedNews?.id === id) {
        setSelectedNews(null);
      }
      addLog(`SYS_PURGE: node record ${id.slice(0, 8)} successfully wiped from mainframe`);
    } catch (err) {
      console.error("Purge error:", err);
      addLog("WARNING: record purge operation denied");
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
    <div className="h-screen w-screen bg-[#060608] flex flex-col p-4 sm:p-6 overflow-hidden relative selection:bg-emerald-500/30 selection:text-emerald-200 text-white font-mono">
      
      {/* Visual Desk Grid Surface */}
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>
      
      {/* Ambient glowing accent bulbs */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-red-950/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header HUD */}
      <header className="w-full flex justify-between items-center border-b border-zinc-800/80 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-white uppercase select-none">
              NEXUS <span className="text-red-600">CORE</span>
            </span>
          </div>
          <span className="font-mono text-[9px] text-zinc-500 tracking-wider mt-1 uppercase">
            OPERATIVE: <span className="text-red-500/90 font-bold">{profile?.email}</span> // ROLE: <span className="text-zinc-300 font-bold">{profile?.role?.toUpperCase()}</span>
          </span>
        </div>

        {/* Wireframe Spinning Compass Radar */}
        <div className="hidden md:flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-crosshair">
          <svg className="w-10 h-10 text-emerald-500/80 animate-[spin_12s_linear_infinite]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="0.8" stroke-dasharray="3 3"/>
            <circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="0.8"/>
            <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" stroke-width="0.6"/>
            <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" stroke-width="0.6"/>
            <path d="M50 50 L80 20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10 max-w-[1600px] mx-auto w-full h-full pb-4 overflow-hidden">
        
        {/* LEFT FOLDER: Cognitive Payload Typewriter (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col relative h-full">
          <div className="absolute inset-0 bg-[#000]/65 rounded-2xl transform translate-x-1.5 translate-y-2 pointer-events-none z-0"></div>

          {/* Folder Body */}
          <div className="bg-[#e2c091] border-2 border-[#b89b65] rounded-2xl p-5 shadow-[0_10px_20px_rgba(0,0,0,0.6)] flex flex-col h-full relative z-10 overflow-hidden">
            
            {/* Manila Spine Cover */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/15 to-transparent border-r border-stone-800/10"></div>
            
            {/* Folder tab */}
            <div className="absolute top-0 left-8 w-32 h-5 bg-[#e2c091] border-t-2 border-l border-r border-[#b89b65] -mt-5 rounded-t-lg z-0"></div>

            {/* Brass clip overlay */}
            <div className="absolute -top-4 left-1/3 z-20 drop-shadow-[1px_3px_2px_rgba(0,0,0,0.45)] pointer-events-none transform -rotate-[5deg]">
              <svg className="w-6 h-16" viewBox="0 0 24 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2 C17 2 21 6 21 12 L21 60 C21 68 15 74 8 74 C3 74 1 70 1 64 L1 22 C1 18 4 15 8 15 C12 15 14 18 14 22 L14 54" stroke="#8c9099" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
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
            <div className="flex-1 bg-[#f4ecd8] border border-stone-300 rounded shadow-[inset_0_0_20px_rgba(139,90,43,0.15)] flex flex-col p-4 overflow-hidden relative">
              
              {/* Typewriter horizontal roller bar */}
              <div className="absolute -top-1.5 left-0 right-0 h-3 bg-gradient-to-b from-stone-900 to-stone-700 border-b border-stone-950 z-20 shadow-md"></div>
              
              {/* Paper texturized overlay */}
              <div className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBoNHYxSDB6bTAgMmg0djFIMHoiIGZpbGw9IiNlNWU1ZTUiIGZpbGwtb3BhY2l0eT0iLjQiLz4KPC9zdmc+')]"></div>

              <form onSubmit={handleInjectPayload} className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 pt-3 custom-paper-scrollbar relative z-10 text-stone-900 font-serif">
                
                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                    TRANSMISSION HEADLINE
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. COMPILER DISRUPTION IN BOMBAY MATRIX..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-transparent border-none outline-none font-bold text-sm text-stone-950 placeholder-stone-600/40"
                  />
                </div>

                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                    SOURCE LINK
                  </label>
                  <input
                    type="url"
                    placeholder="https://gridleak.secure/..."
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/40 font-mono"
                  />
                </div>

                <div className="flex flex-col flex-1 min-h-[140px] border-b border-stone-400 pb-2">
                  <label className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                    DRAFT CHRONICLE DETAILS
                  </label>
                  <textarea
                    required
                    placeholder="Inject intelligence dispatch packets or system details here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-950 placeholder-stone-600/40 resize-none flex-1 leading-relaxed custom-paper-scrollbar"
                  />
                </div>

                {/* Priority Selection Bulb Controls */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest">
                    ALERT URGENCY
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                    {[
                      { key: "INFO_LEVEL", color: "bg-emerald-500", border: "border-emerald-600", text: "INFO" },
                      { key: "NOTICE_LEVEL", color: "bg-blue-500", border: "border-blue-600", text: "NOTICE" },
                      { key: "WARNING_LEVEL", color: "bg-amber-500", border: "border-amber-600", text: "WARNING" },
                      { key: "CRITICAL_OVERRIDE", color: "bg-red-500", border: "border-red-600", text: "CRITICAL" },
                    ].map((pr) => (
                      <button
                        key={pr.key}
                        type="button"
                        onClick={() => {
                          setPriority(pr.key);
                          addLog(`INJECTOR: Urgency dial set to '${pr.text}'`);
                        }}
                        className={`py-1.5 rounded-lg border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${priority === pr.key ? "bg-stone-900 text-[#f4ecd8] border-stone-950 font-bold scale-[1.04]" : "bg-stone-300/40 text-stone-700 border-stone-400/50 hover:bg-stone-300"} `}
                      >
                        {/* Bulb Indicator */}
                        <span className={`w-2 h-2 rounded-full border ${pr.color} ${pr.border} ${priority === pr.key ? "animate-pulse shadow-[0_0_8px_rgba(0,0,0,1)]" : "opacity-60"}`}></span>
                        <span>{pr.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                    ROUTING LABELS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    placeholder="AI, SECURITY, GLITCH..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/40 font-mono font-bold"
                  />
                </div>

                {/* Submit Trigger */}
                <button
                  type="submit"
                  className="mt-2 bg-red-800 text-stone-200 hover:bg-red-900 border-2 border-stone-900 font-mono font-bold text-xs py-3 rounded uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[0_0_0_#000] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Broadcast Draft to Mainframe
                </button>

              </form>

            </div>
          </div>
        </div>

        {/* RIGHT FOLDER: News Feeds + Simulated Term Log (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col relative h-full">
          <div className="absolute inset-0 bg-[#000]/65 rounded-2xl transform translate-x-1.5 translate-y-2 pointer-events-none z-0"></div>
          <div className="absolute inset-0 bg-[#dbcfbc] rounded-2xl transform -rotate-[0.6deg] pointer-events-none border border-stone-800/10"></div>

          {/* Top Page Layer */}
          <div className="bg-[#f2efe6] border-2 border-[#d3c7b3] rounded-2xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.5)] flex flex-col h-full relative z-10 overflow-hidden">
            
            {/* Spine seam */}
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/10 to-transparent border-r border-stone-800/10"></div>
            
            {/* Header meta */}
            <div className="flex justify-between items-center text-[8px] font-mono text-stone-500 uppercase tracking-widest border-b border-stone-300 pb-1.5 mb-2 pl-2">
              <span>NEXUS DISPATCH DECK</span>
              <span>GRID MONITOR STATE</span>
              <span>TIME CHECK: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
            </div>

            {/* Headlines Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-stone-800 pb-3 mb-4 pl-2 gap-3">
              <div>
                <h2 className="font-playfair text-2xl sm:text-3xl font-black text-stone-900 tracking-tighter uppercase leading-none select-none">
                  METASPHERE <span className="text-red-800">CHRONICLES</span>
                </h2>
                
                {/* Simulated newspaper tabs */}
                <div className="flex gap-2.5 text-[8.5px] font-mono font-bold text-red-800 mt-2 uppercase tracking-wide">
                  <span>LIVE TRANSMISSIONS</span>
                  <span className="text-stone-400">•</span>
                  <span>MONITORED CHANNELS</span>
                </div>
              </div>

              {/* Search Widget */}
              <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-2 md:mt-0">
                <div className="relative w-full sm:w-48">
                  <input
                    type="text"
                    placeholder="Search node IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1c1c1f] text-stone-200 text-[10.5px] pl-3 pr-8 py-1.5 font-mono outline-none border border-stone-900 focus:border-red-700 rounded shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]"
                  />
                  <svg className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Split Panel: Feed List and Event Terminal logs */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden pl-2">
              
              {/* Feeds Container */}
              <div className="flex-1 bg-[#121215] border-2 border-stone-950 rounded-xl p-3 shadow-[inset_0_4px_15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden relative">
                
                {/* Grid Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none z-0"></div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar relative z-10">
                  {newsList.map((item) => {
                    const getPriorityColors = (pr: string) => {
                      if (pr === "CRITICAL_OVERRIDE" || pr === "critical") return "border-red-700 text-red-500 bg-red-950/40";
                      if (pr === "WARNING_LEVEL" || pr === "high") return "border-amber-700 text-amber-500 bg-amber-950/40";
                      if (pr === "NOTICE_LEVEL" || pr === "medium") return "border-blue-700 text-blue-400 bg-blue-950/40";
                      return "border-emerald-700 text-emerald-400 bg-emerald-950/40";
                    };

                    return (
                      <div 
                        key={item.id} 
                        onClick={() => {
                          setSelectedNews(item);
                          addLog(`INSPECTOR: mounting node record ${item.id.slice(0, 8)}`);
                        }}
                        className="bg-black/85 border border-zinc-900/60 p-3.5 rounded-lg hover:border-red-800/40 hover:bg-stone-950/90 transition-all flex flex-col gap-2 relative group/item shadow cursor-pointer"
                      >
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className={`font-mono text-[8px] border px-2 py-0.5 rounded tracking-wide uppercase font-bold ${getPriorityColors(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className="font-mono text-[9px] text-zinc-500">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <h4 className="font-serif text-sm font-bold text-zinc-200 tracking-wide uppercase group-hover/item:text-white transition-colors">
                          {item.title}
                        </h4>
                        
                        <p className="font-mono text-[11px] text-zinc-400 leading-relaxed truncate max-w-full">
                          {item.content}
                        </p>

                        <div className="flex flex-wrap justify-between items-center mt-1">
                          <div className="flex gap-1.5">
                            {item.tags.map((tag) => (
                              <span key={tag} className="font-mono text-[8px] bg-red-950/20 border border-red-900/30 text-red-400 px-1.5 py-0.2 rounded uppercase">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <span className="font-mono text-[9px] text-zinc-600 group-hover/item:text-cyan-400 transition-colors">
                            [ Inspect Coordinates ]
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state visual */}
                  {newsList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-14 h-14 text-zinc-700 mb-4 animate-pulse">
                        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.5">
                          <circle cx="50" cy="50" r="12" stroke-dasharray="3 3"/>
                          <circle cx="50" cy="50" r="30"/>
                          <path d="M50 20 L50 80 M20 50 L80 50" stroke-width="1"/>
                        </svg>
                      </div>
                      <h3 className="font-mono text-zinc-400 text-sm font-bold tracking-widest uppercase">
                        METASPHERE QUIET
                      </h3>
                      <p className="font-serif text-[10.5px] text-zinc-500 max-w-xs leading-relaxed mt-2 font-bold">
                        Awaiting dispatch signals. Broadcast payloads will populate details in real-time coordinates.
                      </p>
                    </div>
                  )}

                  {nextCursor && (
                    <div className="text-center pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchNews(nextCursor, searchQuery, true);
                        }}
                        disabled={fetchLoading}
                        className="font-mono text-[10px] border border-emerald-500/50 text-emerald-400 px-3 py-1.5 hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                      >
                        {fetchLoading ? "[ ACQUIRING BITS... ]" : "[ LOAD MORE DECK NODES ]"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Logs console drawer */}
              <div className="h-28 bg-black border border-stone-950 rounded-lg p-3 shadow-inner flex flex-col overflow-hidden relative">
                <div className="absolute top-0.5 right-3 text-[8px] font-mono text-emerald-600 font-bold uppercase tracking-widest select-none animate-pulse">
                  SYSTEM LOGS // MONITORING
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-[9px] text-emerald-500/80 space-y-1.5 custom-scrollbar pr-1">
                  {terminalLogs.map((log, index) => (
                    <div key={index} className="truncate">
                      &gt; {log}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* DETAILED INSPECTION DOSSIER OVERLAY PANEL */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#e2c091] border-4 border-[#b89b65] rounded-xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col relative animate-bounce-slight max-h-[90vh]">
            
            {/* staples */}
            <div className="absolute -top-3 left-12 w-16 h-5 bg-gradient-to-b from-stone-400 to-stone-500 border border-stone-600 rounded-sm transform rotate-[-4deg]"></div>
            
            {/* Close */}
            <button
              onClick={() => {
                setSelectedNews(null);
                addLog("INSPECTOR: unmounting node dossier");
              }}
              className="absolute top-3 right-4 font-mono font-bold text-stone-950 border-2 border-stone-900 px-2 py-0.5 hover:bg-red-800 hover:text-white transition-colors cursor-pointer text-xs"
            >
              [ CLOSE ]
            </button>

            {/* Parchment inspection sheet inside dossier */}
            <div className="flex-1 bg-[#f4ecd8] border border-stone-300 rounded p-6 sm:p-8 overflow-y-auto custom-paper-scrollbar mt-4 text-stone-900">
              
              <div className="border-b-2 border-stone-900 pb-2.5 mb-5 text-center relative">
                
                {/* Stain */}
                <div className="coffee-stain -top-6 -right-6 w-20 h-20 opacity-30"></div>
                
                <span className="font-mono text-[9px] text-stone-600 font-bold uppercase tracking-widest block mb-1">
                  CLEARANCE FILE // NODE IDENTIFIER: {selectedNews.id.slice(0, 8)}
                </span>
                <h3 className="font-serif text-2xl font-black uppercase tracking-tight leading-none text-stone-950">
                  {selectedNews.title}
                </h3>
              </div>

              <div className="font-serif text-[14px] leading-relaxed text-justify space-y-4">
                <p className="indent-6 text-stone-900">
                  {selectedNews.content}
                </p>
              </div>

              {selectedNews.sourceUrl && (
                <div className="mt-6 border-t border-stone-300 pt-3">
                  <span className="font-mono text-[9px] text-stone-600 font-bold uppercase block mb-1">DATA VERIFICATION MATRIX (URL)</span>
                  <a
                    href={selectedNews.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] text-red-800 hover:underline break-all font-bold"
                  >
                    {selectedNews.sourceUrl}
                  </a>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-6 border-t border-stone-300 pt-4 font-mono text-[10px] text-stone-600 font-bold">
                <div>
                  <span className="block text-[8px] text-stone-500 uppercase tracking-wide">BROADCAST PRIORITY</span>
                  <span className="text-stone-950 uppercase">{selectedNews.priority}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-stone-500 uppercase tracking-wide">BROADCAST DATE</span>
                  <span className="text-stone-950">{new Date(selectedNews.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-1.5 border-t border-stone-300 pt-4">
                {selectedNews.tags.map((tag) => (
                  <span key={tag} className="font-mono text-[9px] bg-stone-300 text-stone-800 border border-stone-400 px-2 py-0.5 rounded font-bold uppercase">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Purge inside inspector */}
              <div className="mt-8 border-t-2 border-stone-900 pt-4 flex justify-between items-center">
                <span className="font-mono text-[9px] text-stone-500 font-bold uppercase">SECURE COORDINATES CONTROL</span>
                <button
                  onClick={() => handlePurge(selectedNews.id)}
                  className="vintage-stamp text-xs py-2 bg-transparent text-red-800 border-red-800 hover:bg-red-800 hover:text-white"
                >
                  PURGE TRANSMISSION
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

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
          <svg className="w-3.5 h-3.5 text-red-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>DECK ENCRYPTION:</span>
          <span className="text-zinc-400 font-bold">AES-256 / RSA-4096</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
