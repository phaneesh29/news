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
  isPublished: boolean;
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
  const [editIsPublished, setEditIsPublished] = useState(false);


  // Telemetry status
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);

  // Live Terminal Log System (Newspaper Teletype logs)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "TELETYPE_INIT: Mounting news wire...",
    "WIRE: Connection to Metasphere active.",
    "INK: Press calibration complete.",
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
        addLog(`WIRE_SEARCH: Querying nodes for '${query}'`);
      } else {
        url = `${API_BASE_URL}/news?limit=10${cursor ? `&cursor=${cursor}` : ""}`;
        addLog(cursor ? `WIRE: Loading next block ${cursor.slice(0, 8)}...` : "WIRE: Refreshing printing press feeds...");
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
      addLog(`WIRE: Feed updated with ${items.length} print records`);
    } catch (err) {
      console.error("Fetch news error:", err);
      addLog("WARNING: Wire connection timed out or database empty");
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
        addLog(`AUTH: Operative logged in. Role: '${data.user.role}'`);

        // Fetch server health status
        fetch(`${API_BASE_URL}/health`)
          .then(res => res.json())
          .then(data => setServerHealth(data))
          .catch(() => setServerHealth({ status: "UNREACHABLE", timestamp: new Date() }));

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
      setSystemTime(`${dateStr}  |  ${timeStr}`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      addLog("AUTH: Purging session credentials...");
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
      const payload = {
        title: editTitle.toUpperCase(),
        content: editContent,
        priority: editPriority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
        tags: editTags.split(",").map(t => t.trim().toUpperCase()).filter(Boolean),
        sourceUrl: editSourceUrl || null,
        isPublished: editIsPublished
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
      addLog(`WIRE: Record ${selectedNews.id.slice(0, 8)} updated successfully`);
    } catch (err) {
      console.error("Update error:", err);
      addLog("WARNING: Payload modification failed");
    }
  };

  const handleTogglePublish = async (newsId: string, currentStatus: boolean) => {
    try {
      addLog(`WIRE: Toggling publish status for record ${newsId.slice(0, 8)}`);
      const payload = {
        isPublished: !currentStatus
      };

      const res = await fetch(`${API_BASE_URL}/news/${newsId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to toggle publish status");
      const data = await res.json();
      
      const updatedItem = {
        ...data.news,
        status: "SYNCED"
      };

      setNewsList(prev => prev.map(item => item.id === newsId ? updatedItem : item));
      if (selectedNews?.id === newsId) {
        setSelectedNews(updatedItem);
      }
      addLog(`WIRE: Record ${newsId.slice(0, 8)} publish status updated`);
    } catch (err) {
      console.error("Toggle publish error:", err);
      addLog("WARNING: Publish toggle operation failed");
    }
  };

  const handlePurge = async (id: string) => {
    try {
      addLog(`WIRE: Issuing purge command for record ${id.slice(0, 8)}`);
      const res = await fetch(`${API_BASE_URL}/news/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete news");

      setNewsList((prev) => prev.filter(item => item.id !== id));
      if (selectedNews?.id === id) {
        setSelectedNews(null);
      }
      addLog(`WIRE: Record ${id.slice(0, 8)} successfully deleted`);
    } catch (err) {
      console.error("Purge error:", err);
      addLog("WARNING: Purge operation denied");
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center font-sans tracking-tight text-slate-200 text-2xl animate-pulse">
        [ CALIBRATING TELETYPES & FEEDING WIRE PRINT... ]
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const canAdd = profile?.role === "admin" || profile?.role === "editor";

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)]/10 selection:text-red-400 text-slate-200 font-sans">
      
      {/* Newspaper texture noise overlays via css */}
      <div className="absolute inset-0 cyber-grid pointer-events-none z-0"></div>
      
      {/* Header HUD - Traditional Newspaper style Banner */}
      <header className="w-full flex flex-col items-center border-b-4 border-double border-red-900/50 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          
          <div className="flex flex-col text-center md:text-left">
            <Link href="/dashboard" className="font-sans tracking-tight text-3xl sm:text-4xl font-black tracking-tight text-white uppercase select-none hover:text-red-500 text-glow transition-colors">
              THE DAILY <span className="text-red-500 text-glow">NEXUS</span>
            </Link>
            <span className="font-mono text-[10px] text-slate-400 tracking-wider mt-1 uppercase">
              WIRE SERVICE  •  OPERATIVE: <span className="font-bold text-slate-200">{profile?.email}</span> ({profile?.role?.toUpperCase()})
            </span>
          </div>

          {/* Nav Deck Links */}
          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-white/10/50 px-4 py-2 border border-slate-700/50/50 rounded">
            <Link href="/dashboard" className="text-red-500 text-glow hover:text-red-900 transition-colors font-black border-b-2 border-red-500 pb-0.5">&gt; News Feed</Link>
            <span className="text-slate-600">|</span>
            <Link href="/blogs" className="text-slate-400 hover:text-white transition-colors">&gt; Blogs Feed</Link>
            {canAdd && (
              <>
                
              </>
            )}
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <Link 
                href="/settings"
                className="font-mono text-[10px] sm:text-xs border-2 border-red-500/50 text-slate-200 bg-black/50 px-3 py-1.5 hover:bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5"
              >
                Security Deck
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="font-mono text-[10px] sm:text-xs border-2 border-red-500 text-red-900 bg-black/50 px-3 py-1.5 hover:bg-red-700 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Newspaper Subheader bar */}
        <div className="w-full flex justify-between items-center border-t border-slate-800 pt-2 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
          <span>VOL. CXXVI... No. 47190</span>
          <span className="font-bold text-white">{systemTime || "[ RETRIEVING TIME ]"}</span>
          <span>PRICE: 10 CENTS</span>
        </div>
      </header>

      {/* Main Newspaper Layout */}
      <div className="flex-1 grid grid-cols-1 flex flex-col relative z-10 max-w-5xl mx-auto w-full pb-8 items-start">
        
        {/* News wire articles list (Left Columns) */}
        <div className="w-full flex flex-col relative">
          
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 border-red-900/50 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 rounded">
            
            {/* Column Header */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-widest border-b border-white/10 pb-1.5 mb-2 pl-2">
              <span>DAILY WIRE LOGS</span>
              <span>LATEST BROADCASTS</span>
            </div>

            {/* Headlines Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-red-900/50 pb-3 mb-4 pl-2 gap-3">
              <div>
                <h2 className="font-sans tracking-tight text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase leading-none select-none text-left">
                  WIRE <span className="text-red-500 text-glow">REPORTS</span>
                </h2>
                
                <div className="flex gap-2.5 text-[10px] font-mono font-bold text-red-500 text-glow mt-2 uppercase tracking-wide">
                  <span>PRINT QUEUE FEED</span>
                  <span className="text-slate-600">•</span>
                  <span>SYNCED NODES</span>
                </div>
              </div>

              {/* Action Buttons & Search Widget */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                {canAdd && (
                  <Link 
                    href="/news/add"
                    className="glass-btn relative overflow-hidden text-center py-2 px-3.5 text-[10px] flex items-center justify-center font-bold tracking-wider"
                  >
                    WRITE ARTICLE
                  </Link>
                )}
                
                <div className="relative w-full sm:w-52">
                  <input
                    type="text"
                    placeholder="Search wire reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 text-xs pl-3 pr-8 py-2 font-mono outline-none border-2 border-red-900/50 focus:border-red-800 rounded shadow-sm"
                  />
                  <svg className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Split Panel: Feed List */}
            <div className="flex flex-col gap-6 pl-2">
              
              {/* Feeds Container */}
              <div className="bg-black/40 backdrop-blur-xl border-2 border-red-900/50 rounded p-4 sm:p-6 shadow-sm flex flex-col relative">
                
                {/* Priority Selector Filter Bar */}
                <div className="flex flex-wrap gap-2.5 pb-3 border-b border-white/10 mb-4 relative z-10 font-mono text-[10px] uppercase tracking-wider">
                  <span className="text-slate-400 font-bold self-center mr-1">FILTER LEVEL:</span>
                  {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedPriority(level);
                        addLog(`FILTER: Active filter changed to '${level}'`);
                      }}
                      className={`px-2 py-0.5 border-2 rounded font-black transition-all cursor-pointer ${selectedPriority === level ? "border-red-900/50 text-white bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]" : "border-slate-700/50 text-slate-400 hover:border-red-900/50 hover:text-white bg-black/50"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <div className="space-y-6 relative z-10 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                  {newsList.filter(item => {
                    if (selectedPriority === "ALL") return true;
                    return item.priority.toLowerCase() === selectedPriority.toLowerCase();
                  }).map((item) => {
                    const getPriorityColors = (pr: string) => {
                      const cleanPr = pr.toLowerCase();
                      if (cleanPr === "critical") return "urgency-badge-critical";
                      if (cleanPr === "high") return "urgency-badge-high";
                      if (cleanPr === "medium") return "urgency-badge-medium";
                      return "urgency-badge-low";
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
                          setEditIsPublished(item.isPublished);
                          addLog(`VIEW: Focus shifted to article ${item.id.slice(0, 8)}`);
                        }}
                        className="bg-black/50 border-2 border-red-900/50 p-5 hover:bg-white/5 transition-all flex flex-col gap-2 relative group/item shadow cursor-pointer text-left rounded"
                      >
                        <div className="flex flex-wrap gap-2.5 items-center">
                          <span className={`font-mono text-[9px] border-2 px-2 py-0.5 rounded tracking-wide uppercase font-bold ${getPriorityColors(item.priority)}`}>
                            {item.priority}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                          <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded tracking-wide uppercase font-bold ${item.isPublished ? "border-green-600 text-green-700 bg-green-50" : "border-slate-700/50 text-slate-500 bg-white/5"}`}>
                            {item.isPublished ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                        </div>

                        <h4 className="font-sans tracking-tight text-xl font-black text-white tracking-tight leading-snug group-hover/item:text-red-400 transition-colors uppercase">
                          {item.title}
                        </h4>
                        
                        <p className="font-sans text-sm text-slate-300 leading-relaxed truncate max-w-full">
                          {item.content}
                        </p>

                        <div className="flex flex-wrap justify-between items-center mt-2 pt-2 border-t border-dashed border-white/10">
                          <div className="flex gap-1.5">
                            {item.tags.map((tag) => (
                              <span key={tag} className="font-mono text-[9px] bg-white/10 border border-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded uppercase font-bold">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <span className="font-mono text-[10px] text-slate-400 group-hover/item:text-red-500 text-glow transition-colors font-bold">
                            [ READ REPORT ]
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state visual */}
                  {newsList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-12 h-12 text-slate-600 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <line x1="7" y1="8" x2="17" y2="8" />
                          <line x1="7" y1="12" x2="17" y2="12" />
                          <line x1="7" y1="16" x2="13" y2="16" />
                        </svg>
                      </div>
                      <h3 className="font-sans tracking-tight text-slate-300 text-lg font-black uppercase">
                        Wire Archives Empty
                      </h3>
                      <p className="font-sans text-sm text-slate-400 max-w-sm leading-relaxed mt-2">
                        No articles are currently logged on the wire feed. Ask the agent or click write article to log a report.
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
                        className="glass-btn relative overflow-hidden text-xs tracking-widest disabled:opacity-50 cursor-pointer bg-black/50"
                      >
                        {fetchLoading ? "[ RE-READING WIRE... ]" : "LOAD NEXT DISPATCHES"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

        {/* RIGHT COLUMN: Telemetry and Live Teletype Logs */}
        <div className="hidden lg:col-span-1 flex-col gap-6 relative w-full lg:sticky lg:top-8 text-left z-10">
          
          {/* Telemetry Window */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 border-red-900/50 p-6 flex flex-col relative z-10 scanline overflow-hidden shadow-sm">
            
            {/* Decorative coffee stain */}
            <div className="hidden"></div>

            <div className="border-b-2 border-red-900/50 pb-3 mb-5">
              <h3 className="font-sans tracking-tight text-lg text-white uppercase tracking-wide font-black flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse"></span>
                SYS.TELEMETRY
              </h3>
              <p className="font-mono text-[9px] text-slate-500 font-bold mt-1 tracking-wider uppercase">
                OPERATIVE DATA SCAN
              </p>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-stone-855 font-mono">
              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-slate-500 font-bold">NODE STATUS</span>
                <span className={`font-bold uppercase tracking-wider text-[10px] ${serverHealth?.status === "ok" ? "text-green-800" : "text-red-700 animate-pulse"}`}>
                  {serverHealth ? `${serverHealth.status.toUpperCase()}` : "SCANNING..."}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-slate-500 font-bold">OPERATIVE OS</span>
                <span className="text-slate-200 font-bold">{clientInfo?.os || "DETERMINING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-slate-500 font-bold">CLIENT BROWSER</span>
                <span className="text-slate-300 truncate max-w-[130px] font-bold">{clientInfo?.browser || "EXTRACTING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-slate-500 font-bold">IP ADDR COORDINATES</span>
                <span className="text-red-900 font-bold tracking-wider">{clientInfo?.ip || "SCANNING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                <span className="text-slate-500 font-bold">CLEARANCE KEY</span>
                <span className="text-slate-200 uppercase font-bold">{profile?.role || "OPERATIVE"}</span>
              </div>
            </div>
          </div>

          {/* Live Logs Terminal Window */}
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 border-red-900/50 p-6 flex flex-col relative z-10 flex-1 min-h-[350px]">
            
            <div className="border-b-2 border-red-900/50 pb-3 mb-5">
              <h3 className="font-sans tracking-tight text-lg text-white uppercase tracking-wide font-black">
                TELETYPE STREAM
              </h3>
              <p className="font-mono text-[9px] text-slate-500 font-bold mt-1 tracking-wider uppercase">
                LIVE SYSTEM EXECUTIONS
              </p>
            </div>

            <div className="flex-1 green-terminal scanline relative overflow-hidden p-4 font-mono text-[11px] leading-relaxed flex flex-col shadow-[0_0_15px_rgba(0,0,0,0.5)] min-h-[250px] max-h-[350px]">
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="opacity-90 hover:opacity-100 transition-opacity">
                    &gt;&gt; {log}
                  </div>
                ))}
                {terminalLogs.length === 0 && (
                  <div className="text-slate-500 italic">No feed logs recorded.</div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      </div>

      {/* ARTICLE DOSSIER DETAIL OVERLAY */}
      {selectedNews && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border-4 border-red-900/50 p-6 shadow-[8px_8px_0px_#111] flex flex-col relative max-h-[90vh] rounded">
            
            {/* Close */}
            <button
              onClick={() => {
                setSelectedNews(null);
                addLog("INSPECTOR: Dossier closed");
              }}
              className="absolute top-3 right-4 font-mono font-bold text-white border-2 border-red-900/50 px-2 py-0.5 hover:bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:text-white transition-colors cursor-pointer text-xs"
            >
              [ CLOSE ]
            </button>

            {/* Vintage paper column inside dossier */}
            <div className="flex-1 overflow-y-auto custom-paper-scrollbar mt-6 pr-1 text-slate-200">
              
              {isEditing ? (
                <form onSubmit={handleUpdatePayload} className="flex flex-col gap-4 font-sans text-slate-200 text-left">
                  <div className="flex flex-col border-b border-slate-700/50 pb-2">
                    <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      TRANSMISSION HEADLINE
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-transparent border-none outline-none font-bold text-lg text-white placeholder-stone-600/40 font-sans"
                    />
                  </div>

                  <div className="flex flex-col border-b border-slate-700/50 pb-2">
                    <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      SOURCE LINK
                    </label>
                    <input
                      type="url"
                      value={editSourceUrl}
                      onChange={(e) => setEditSourceUrl(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-slate-200 placeholder-stone-600/40 font-mono"
                    />
                  </div>

                  <div className="flex flex-col min-h-[140px] border-b border-slate-700/50 pb-2">
                    <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      DRAFT CHRONICLE DETAILS
                    </label>
                    <textarea
                      required
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-sm text-white placeholder-stone-600/40 resize-none flex-1 leading-relaxed custom-paper-scrollbar"
                      rows={8}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      ALERT URGENCY
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                      {[
                        { key: "low", text: "INFO", color: "bg-white/50", border: "border-stone-600" },
                        { key: "medium", text: "NOTICE", color: "bg-blue-500", border: "border-blue-600" },
                        { key: "high", text: "WARNING", color: "bg-amber-500", border: "border-amber-600" },
                        { key: "critical", text: "CRITICAL", color: "bg-red-700", border: "border-red-800" },
                      ].map((pr) => (
                        <button
                          key={pr.key}
                          type="button"
                          onClick={() => setEditPriority(pr.key)}
                          className={`py-1.5 rounded border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${editPriority.toLowerCase() === pr.key ? "bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-white border-red-900/50 font-bold scale-[1.04]" : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"}`}
                        >
                          <span>{pr.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-slate-700/50 pb-3 mt-2">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">PUBLICATION STATUS</span>
                      <span className="font-sans text-xs text-slate-500">Toggle to publish or unpublish this report.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditIsPublished(!editIsPublished)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-2 ${editIsPublished ? 'bg-green-700 border-green-800' : 'bg-white/10 border-slate-700/50'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-black/50 transition-transform ${editIsPublished ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>

                  <div className="flex flex-col border-b border-slate-700/50 pb-2">
                    <label className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      ROUTING LABELS (COMMA SEPARATED)
                    </label>
                    <input
                      type="text"
                      placeholder="AI, SECURITY, GLITCH..."
                      value={editTags}
                      onChange={(e) => setEditTags(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-slate-200 placeholder-stone-600/40 font-mono font-bold"
                    />
                  </div>

                  <div className="mt-4 flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] text-white border-2 border-red-900/50 font-mono font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-white/10 text-slate-200 border-2 border-stone-305 font-mono font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="border-b-4 border-double border-red-900/50 pb-3 mb-5 text-center relative">
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-1">
                      WIRE REPORT INDEX ID: {selectedNews.id.slice(0, 8)}
                    </span>
                    <h3 className="font-sans tracking-tight text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-white">
                      {selectedNews.title}
                    </h3>
                  </div>

                  <div className="font-sans text-base leading-relaxed text-justify space-y-4">
                    <p className="indent-6 text-slate-200">
                      {selectedNews.content}
                    </p>
                  </div>

                  {selectedNews.sourceUrl && (
                    <div className="mt-6 border-t border-white/10 pt-3 text-left">
                      <span className="font-mono text-[9px] text-slate-500 font-bold uppercase block mb-1">DATA VERIFICATION MATRIX (URL)</span>
                      <a
                        href={selectedNews.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-red-500 text-glow hover:underline break-all font-bold"
                      >
                        {selectedNews.sourceUrl}
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/10 pt-4 font-mono text-[10px] text-slate-400 font-bold text-left">
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wide">WIRE PRIORITY</span>
                      <span className="text-white uppercase">{selectedNews.priority}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wide">BROADCAST DATE</span>
                      <span className="text-white">{new Date(selectedNews.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-slate-500 uppercase tracking-wide">STATUS</span>
                      <span className={`font-bold ${selectedNews.isPublished ? "text-green-700" : "text-slate-500"}`}>
                        {selectedNews.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5 border-t border-white/10 pt-4">
                    {selectedNews.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[9px] bg-white/10 text-slate-300 border border-slate-700/50 px-2 py-0.5 rounded font-bold uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions inside inspector */}
                  <div className="mt-8 border-t-4 border-double border-red-900/50 pt-4 flex flex-wrap justify-between items-center gap-4">
                    <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">WIRE RECORDS SYSTEM CONTROL</span>
                    <div className="flex gap-3">
                      {(profile?.role === "admin" || profile?.role === "editor") && (
                        <>
                          <button
                            onClick={() => handleTogglePublish(selectedNews.id, selectedNews.isPublished)}
                            className={`glass-btn relative overflow-hidden text-xs py-2 bg-transparent hover:text-white cursor-pointer ${selectedNews.isPublished ? 'text-amber-700 border-amber-700 hover:bg-amber-700' : 'text-green-700 border-green-700 hover:bg-green-700'}`}
                          >
                            {selectedNews.isPublished ? 'UNPUBLISH' : 'PUBLISH'}
                          </button>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="glass-btn relative overflow-hidden text-xs py-2 bg-transparent text-slate-200 border-red-900/50 hover:bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)] hover:text-white cursor-pointer"
                          >
                            EDIT REPORT
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handlePurge(selectedNews.id)}
                        className="glass-btn relative overflow-hidden text-xs py-2 bg-transparent text-red-500 text-glow border-red-800 hover:bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.6)] hover:text-white shadow-[2px_2px_0px_#801c1c]"
                      >
                        PURGE REPORT
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
      <footer className="w-full max-w-[1600px] mx-auto mt-6 pt-3 border-t-2 border-red-900/50 flex flex-wrap justify-between items-center gap-4 text-[9px] font-mono text-slate-400 z-10 px-1">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border border-red-900/50 flex items-center justify-center text-white font-bold bg-black/50">
            N
          </div>
          <div>
            <span className="text-slate-300 font-bold">THE DAILY NEXUS WIRE</span>
            <span className="mx-2 text-slate-600">|</span>
            <span>Printing Engine: <span className="text-red-500 text-glow font-bold uppercase">STANDBY</span></span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span>DECK ENCRYPTION:</span>
          <span className="text-slate-300 font-bold">AES-256 / RSA-4096</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>SYSTEM TIME:</span>
          <span className="text-slate-300 font-bold">{systemTime || "[ SYSTEM STANDBY ]"}</span>
        </div>
      </footer>

    </div>
  );
}
