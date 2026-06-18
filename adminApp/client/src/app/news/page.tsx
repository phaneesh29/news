"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";

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

export default function NewsPage() {
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

  // Clock state
  const [systemTime, setSystemTime] = useState("");

  // Filter state
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");

  // Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editSourceUrl, setEditSourceUrl] = useState("");

  // Client telemetry info
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);

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
        url = `${API_BASE_URL}/news/search?q=${encodeURIComponent(query)}&limit=10`;
        addLog(`DB_QUERY: scanning news nodes for query '${query}'`);
      } else {
        url = `${API_BASE_URL}/news?limit=10${cursor ? `&cursor=${cursor}` : ""}`;
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
    const fetchProfileAndTelemetry = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setProfile(data.user);
        addLog(`SEC_DECK: biometrics verified. user role: '${data.user.role}'`);

        // Fetch health status
        fetch(`${API_BASE_URL}/health`)
          .then(res => res.json())
          .then(data => setServerHealth(data))
          .catch(() => setServerHealth({ status: "UNREACHABLE", timestamp: new Date(), requestId: "ERR_0x08F" }));

        const ua = window.navigator.userAgent;
        const os = ua.indexOf("Win") !== -1 ? "WINDOWS" 
                 : ua.indexOf("Mac") !== -1 ? "MACOS" 
                 : ua.indexOf("Linux") !== -1 ? "LINUX" 
                 : "UNKNOWN_OS";
        
        let browser = "UNKNOWN_BROWSER";
        if (ua.includes("Chrome")) browser = "CHROME";
        else if (ua.includes("Firefox")) browser = "FIREFOX";
        else if (ua.includes("Safari")) browser = "SAFARI";
        else if (ua.includes("Edge")) browser = "EDGE";

        setClientInfo({
          os,
          browser,
          ip: "SCANNING..."
        });

        fetch("https://api.ipify.org?format=json")
          .then(res => res.json())
          .then(data => setClientInfo((prev: any) => ({ ...prev, ip: data.ip })))
          .catch(() => setClientInfo((prev: any) => ({ ...prev, ip: "SECURE/MASKED" })));

      } catch (err) {
        console.error("Dashboard auth check error", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndTelemetry();
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
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editContent || !selectedNews) return;

    try {
      let mappedPriority: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (editPriority === "CRITICAL_OVERRIDE" || editPriority === "critical") mappedPriority = 'critical';
      else if (editPriority === "WARNING_LEVEL" || editPriority === "high") mappedPriority = 'high';
      else if (editPriority === "NOTICE_LEVEL" || editPriority === "medium") mappedPriority = 'medium';

      const payload = {
        title: editTitle.toUpperCase(),
        content: editContent,
        priority: mappedPriority,
        tags: editTags.split(",").map(t => t.trim().toUpperCase()).filter(Boolean),
        sourceUrl: editSourceUrl || null
      };

      const res = await fetch(`${API_BASE_URL}/news/${selectedNews.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to update news");
      const data = await res.json();
      
      const updatedItem = {
        ...data.news,
        status: "SYNCED"
      };

      setNewsList(prev => prev.map(item => item.id === selectedNews.id ? updatedItem : item));
      setSelectedNews(updatedItem);
      setIsEditing(false);
      addLog(`SYS_UPDATE: successfully updated node record ${selectedNews.id.slice(0, 8)}`);
    } catch (err) {
      console.error("Update error:", err);
      addLog("WARNING: payload update failure");
    }
  };

  const handlePurge = async (id: string) => {
    try {
      addLog(`SEC_DECK: initializing purge coordinates for record ${id.slice(0, 8)}`);
      const res = await fetch(`${API_BASE_URL}/news/${id}`, {
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
  const canAdd = profile?.role === "admin" || profile?.role === "editor";

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
          <Link href="/news" className="text-emerald-400 hover:text-emerald-300 transition-colors border-b border-emerald-400 pb-0.5">&gt; Chronicles Feed</Link>
          {canAdd && (
            <Link href="/news/add" className="text-zinc-400 hover:text-white transition-colors">&gt; Payload Injector</Link>
          )}
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-10 relative z-10 max-w-[1600px] mx-auto w-full pb-8">
        
        {/* LEFT PANEL: Console Telemetry (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6 relative">
          
          {/* CRT Screen Frame */}
          <div className="cyber-console rounded-2xl p-6 sm:p-8 flex flex-col h-full min-h-[400px] border border-cyan-500/35 shadow-[0_0_35px_rgba(0,240,255,0.06)]">
            
            {/* Dynamic scanline sweep animation */}
            <div className="scanline-sweep absolute top-0 left-0 right-0 pointer-events-none z-20"></div>

            {/* Glowing bezel title */}
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,1)] animate-pulse rounded-sm"></span>
                <h3 className="font-mono text-base sm:text-lg text-white uppercase tracking-[0.2em] font-bold">
                  TELEMETRY DECK
                </h3>
              </div>
              <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
                SYS.ONLINE // ACTIVE
              </span>
            </div>

            {/* Telemetry metrics rows */}
            <div className="flex-1 flex flex-col gap-4 text-xs text-zinc-400">
              
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">SERVER STATUS</span>
                <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${serverHealth?.status === "ok" ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900/30" : "text-red-500 bg-red-950/40 border border-red-900/30 animate-pulse"}`}>
                  {serverHealth ? `[${serverHealth.status}]` : "[SCANNING...]"}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">OPERATIVE OS</span>
                <span className="text-cyan-400 font-bold tracking-wider">{clientInfo?.os || "DETERMINING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">BROWSER SIG</span>
                <span className="text-zinc-300 tracking-wider truncate max-w-[150px]">{clientInfo?.browser || "EXTRACTING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">OPERATIVE IP</span>
                <span className="text-red-400 font-bold tracking-widest">{clientInfo?.ip || "SCANNING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">REQUEST ID</span>
                <span className="text-zinc-500 text-[10px] font-mono truncate max-w-[140px] tracking-wider">
                  {serverHealth?.requestId || "GENERATING..."}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2 bg-black/40 border border-zinc-900 p-3 rounded">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">GRID LOGS STREAM</span>
                <div className="text-[10px] font-mono text-cyan-400/75 leading-relaxed space-y-0.5">
                  <div>&gt; CONNECTING NETWORK NODES... OK</div>
                  <div>&gt; INTRUSION ATTEMPT FILTERED: ZERO THREAT</div>
                  <div>&gt; DECRYPTION MODULE LOADED</div>
                </div>
              </div>

              {canAdd && (
                <div className="mt-4 pt-2 border-t border-cyan-500/20">
                  <Link 
                    href="/news/add"
                    className="relative w-full flex items-center justify-center p-3.5 bg-transparent border-2 border-emerald-600/60 hover:border-emerald-500 transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-emerald-600/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                    <span className="relative z-10 text-emerald-400 group-hover/btn:text-white text-sm font-black uppercase tracking-[0.25em] transition-colors duration-300">
                      [ INJECT NEW PAYLOAD ]
                    </span>
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* RIGHT FOLDER: Metasphere Chronicles Feed List (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col relative">
          <div className="absolute inset-0 bg-[#000]/65 rounded-2xl transform translate-x-1.5 translate-y-2 pointer-events-none z-0"></div>
          <div className="absolute inset-0 bg-[#dbcfbc] rounded-2xl transform -rotate-[0.6deg] pointer-events-none border border-stone-800/10"></div>

          {/* Top Page Layer */}
          <div className="bg-[#f2efe6] border-2 border-[#d3c7b3] rounded-2xl p-6 md:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col relative z-10">
            
            {/* Spine seam */}
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/10 to-transparent border-r border-stone-800/10"></div>
            
            {/* Header meta */}
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-mono text-stone-600 uppercase tracking-widest border-b border-stone-300 pb-1.5 mb-2 pl-2">
              <span>NEXUS DISPATCH DECK</span>
              <span>GRID MONITOR STATE</span>
              <span>TIME CHECK: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()}</span>
            </div>

            {/* Headlines Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-stone-800 pb-3 mb-4 pl-2 gap-3">
              <div>
                <h2 className="font-playfair text-3xl sm:text-4xl font-black text-stone-900 tracking-tighter uppercase leading-none select-none">
                  METASPHERE <span className="text-red-800">CHRONICLES</span>
                </h2>
                
                {/* Simulated newspaper tabs */}
                <div className="flex gap-2.5 text-[10px] sm:text-xs font-mono font-bold text-red-800 mt-2 uppercase tracking-wide">
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
                    className="w-full bg-[#1c1c1f] text-stone-200 text-xs sm:text-sm pl-3 pr-8 py-2 font-mono outline-none border border-stone-900 focus:border-red-700 rounded shadow-[inset_0_1px_4px_rgba(0,0,0,0.8)]"
                  />
                  <svg className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Split Panel: Feed List and Event Terminal logs */}
            <div className="flex flex-col gap-6 pl-2">
              
              {/* Feeds Container */}
              <div className="bg-[#121215] border-2 border-stone-950 rounded-xl p-4 sm:p-6 shadow-[inset_0_4px_15px_rgba(0,0,0,0.85)] flex flex-col relative">
                
                {/* Grid Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none z-0"></div>

                {/* Priority Selector Filter Bar */}
                <div className="flex flex-wrap gap-2.5 pb-3 border-b border-zinc-900/60 mb-3 relative z-10 font-mono text-[11px] sm:text-xs uppercase tracking-wider">
                  <span className="text-zinc-500 font-bold self-center mr-1">FILTER LEVEL:</span>
                  {["ALL", "CRITICAL", "WARNING", "NOTICE", "INFO"].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedPriority(level);
                        addLog(`FILTER: set broadcast priority filter to '${level}'`);
                      }}
                      className={`px-2 py-0.5 border rounded-sm font-black transition-all cursor-pointer ${selectedPriority === level ? "border-emerald-500 text-emerald-400 bg-emerald-950/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]" : "border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 relative z-10 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
                  {newsList.filter(item => {
                    if (selectedPriority === "ALL") return true;
                    const lowerPriority = item.priority.toLowerCase();
                    if (selectedPriority === "CRITICAL" && (lowerPriority === "critical" || lowerPriority === "critical_override")) return true;
                    if (selectedPriority === "WARNING" && (lowerPriority === "high" || lowerPriority === "warning_level")) return true;
                    if (selectedPriority === "NOTICE" && (lowerPriority === "medium" || lowerPriority === "notice_level")) return true;
                    if (selectedPriority === "INFO" && (lowerPriority === "low" || lowerPriority === "info_level")) return true;
                    return false;
                  }).map((item) => {
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
                          setIsEditing(false);
                          setEditTitle(item.title);
                          setEditContent(item.content);
                          setEditPriority(item.priority);
                          setEditSourceUrl(item.sourceUrl || "");
                          setEditTags(item.tags.join(", "));
                          addLog(`INSPECTOR: mounting node record ${item.id.slice(0, 8)}`);
                        }}
                        className="bg-black/85 border border-zinc-900/60 p-4 rounded-lg hover:border-red-800/40 hover:bg-stone-950/90 transition-all flex flex-col gap-2.5 relative group/item shadow cursor-pointer text-left"
                      >
                        <div className="flex flex-wrap gap-2.5 items-center">
                          <span className={`font-mono text-[10px] border px-2.5 py-0.5 rounded tracking-wide uppercase font-bold ${getPriorityColors(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className="font-mono text-[11px] text-zinc-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <h4 className="font-serif text-base sm:text-lg font-black text-zinc-200 tracking-wide uppercase group-hover/item:text-white transition-colors">
                          {item.title}
                        </h4>
                        
                        <p className="font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed truncate max-w-full">
                          {item.content}
                        </p>

                        <div className="flex flex-wrap justify-between items-center mt-1">
                          <div className="flex gap-2">
                            {item.tags.map((tag) => (
                              <span key={tag} className="font-mono text-[10px] bg-red-950/20 border border-red-900/30 text-red-400 px-2 py-0.5 rounded uppercase font-bold">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <span className="font-mono text-[11px] text-zinc-500 group-hover/item:text-cyan-400 transition-colors font-bold">
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
                        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="50" cy="50" r="12" strokeDasharray="3 3"/>
                          <circle cx="50" cy="50" r="30"/>
                          <path d="M50 20 L50 80 M20 50 L80 50" strokeWidth="1"/>
                        </svg>
                      </div>
                      <h3 className="font-mono text-zinc-400 text-base font-bold tracking-widest uppercase">
                        METASPHERE QUIET
                      </h3>
                      <p className="font-serif text-xs sm:text-sm text-zinc-400 max-w-sm leading-relaxed mt-2 font-bold">
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
                        className="font-mono text-xs sm:text-sm border border-emerald-500/50 text-emerald-400 px-4 py-2 hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                      >
                        {fetchLoading ? "[ ACQUIRING BITS... ]" : "[ LOAD MORE DECK NODES ]"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Logs console drawer */}
              <div className="h-36 bg-black border border-stone-950 rounded-lg p-4 shadow-inner flex flex-col relative">
                <div className="absolute top-0.5 right-3 text-[10px] font-mono text-emerald-600 font-bold uppercase tracking-widest select-none animate-pulse">
                  SYSTEM LOGS // MONITORING
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-[11px] text-emerald-500/80 space-y-1.5 custom-scrollbar pr-1">
                  {terminalLogs.map((log, index) => (
                    <div key={index} className="truncate text-left">
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
              
              {isEditing ? (
                <form onSubmit={handleUpdatePayload} className="flex flex-col gap-4 font-serif text-stone-900 text-left">
                  <div className="flex flex-col border-b border-stone-400 pb-2">
                    <label className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                      TRANSMISSION HEADLINE
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-bold text-base text-stone-950 placeholder-stone-600/40 font-serif"
                    />
                  </div>

                  <div className="flex flex-col border-b border-stone-400 pb-2">
                    <label className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                      SOURCE LINK
                    </label>
                    <input
                      type="url"
                      value={editSourceUrl}
                      onChange={(e) => setEditSourceUrl(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/40 font-mono"
                    />
                  </div>

                  <div className="flex flex-col min-h-[140px] border-b border-stone-400 pb-2">
                    <label className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                      DRAFT CHRONICLE DETAILS
                    </label>
                    <textarea
                      required
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-stone-950 placeholder-stone-600/40 resize-none flex-1 leading-relaxed custom-paper-scrollbar"
                      rows={6}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[9px] font-bold text-stone-600 uppercase tracking-widest">
                      ALERT URGENCY
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                      {[
                        { key: "low", text: "INFO", color: "bg-emerald-500", border: "border-emerald-600" },
                        { key: "medium", text: "NOTICE", color: "bg-blue-500", border: "border-blue-600" },
                        { key: "high", text: "WARNING", color: "bg-amber-500", border: "border-amber-600" },
                        { key: "critical", text: "CRITICAL", color: "bg-red-500", border: "border-red-600" },
                      ].map((pr) => (
                        <button
                          key={pr.key}
                          type="button"
                          onClick={() => setEditPriority(pr.key)}
                          className={`py-1.5 rounded-lg border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${editPriority.toLowerCase() === pr.key ? "bg-stone-900 text-[#f4ecd8] border-stone-950 font-bold scale-[1.04]" : "bg-stone-300/40 text-stone-700 border-stone-400/50 hover:bg-stone-300"}`}
                        >
                          <span className={`w-2 h-2 rounded-full border ${pr.color} ${pr.border} ${editPriority.toLowerCase() === pr.key ? "animate-pulse" : "opacity-60"}`}></span>
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
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/40 font-mono font-bold"
                    />
                  </div>

                  <div className="mt-4 flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-800 text-stone-200 hover:bg-emerald-900 border-2 border-stone-900 font-mono font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[0_0_0_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-stone-400 text-stone-900 hover:bg-stone-500 border-2 border-stone-900 font-mono font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:shadow-[0_0_0_#000] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
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
                    <div className="mt-6 border-t border-stone-300 pt-3 text-left">
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

                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-stone-300 pt-4 font-mono text-[10px] text-stone-600 font-bold text-left">
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
                  <div className="mt-8 border-t-2 border-stone-900 pt-4 flex flex-wrap justify-between items-center gap-4">
                    <span className="font-mono text-[9px] text-stone-500 font-bold uppercase">SECURE COORDINATES CONTROL</span>
                    <div className="flex gap-3">
                      {(profile?.role === "admin" || profile?.role === "editor") && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="vintage-stamp text-xs py-2 bg-transparent text-emerald-850 border-emerald-800 hover:bg-emerald-800 hover:text-white"
                        >
                          EDIT PAYLOAD
                        </button>
                      )}
                      <button
                        onClick={() => handlePurge(selectedNews.id)}
                        className="vintage-stamp text-xs py-2 bg-transparent text-red-800 border-red-800 hover:bg-red-800 hover:text-white"
                      >
                        PURGE TRANSMISSION
                      </button>
                    </div>
                  </div>
                </>
              )}
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
    </div>
  );
}
