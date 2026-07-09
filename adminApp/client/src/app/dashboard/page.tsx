"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";
import Header from "../../components/Header";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

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
  likesCount?: number;
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

  // Similarity Check State
  const [similarNews, setSimilarNews] = useState<any[]>([]);
  const [checkingSimilarity, setCheckingSimilarity] = useState(false);
  const [hasCheckedSimilarity, setHasCheckedSimilarity] = useState(false);
  const [similarityError, setSimilarityError] = useState("");

  const handleCheckSimilarity = async () => {
    if (!editContent.trim()) return;
    setCheckingSimilarity(true);
    setSimilarityError("");
    setSimilarNews([]);
    setHasCheckedSimilarity(false);
    try {
      const res = await fetch(`${API_BASE_URL}/news/check-similarity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
        credentials: "include"
      });
      if (!res.ok) {
        throw new Error("Failed to check news wire similarity");
      }
      const data = await res.json();
      setSimilarNews(data.similarNews || []);
      setHasCheckedSimilarity(true);
    } catch (err: any) {
      console.error(err);
      setSimilarityError(err.message || "An error occurred");
    } finally {
      setCheckingSimilarity(false);
    }
  };

  const [agentQuery, setAgentQuery] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_BASE_URL}/agent/draft/news`
    }),
    onFinish: (event) => {
      const message = event.message;
      const toolInvs = message.parts ? message.parts.filter((p: any) => p.type === 'tool-invocation' || p.type === 'dynamic-tool-invocation').map((p: any) => p.toolInvocation) : [];
      let outputArgs = toolInvs.find((t: any) => t.args && (t.args.title !== undefined || t.args.content !== undefined))?.args;

      if (!outputArgs) {
        const textParts = message.parts ? message.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text) : [];
        const fullText = textParts.join('');
        try {
          const startIdx = fullText.indexOf('{');
          const endIdx = fullText.lastIndexOf('}');
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const jsonText = fullText.substring(startIdx, endIdx + 1);
            const parsed = JSON.parse(jsonText);
            if (parsed.title !== undefined || parsed.content !== undefined) {
              outputArgs = parsed;
            }
          }
        } catch (e) {
          console.error("Failed to parse JSON output", e);
        }
      }

      if (outputArgs) {
        if (outputArgs.title) setEditTitle(outputArgs.title);
        if (outputArgs.content) setEditContent(outputArgs.content);
        if (outputArgs.tags) setEditTags(Array.isArray(outputArgs.tags) ? outputArgs.tags.join(', ') : outputArgs.tags);
        if (outputArgs.sourceUrl) setEditSourceUrl(outputArgs.sourceUrl);
        if (outputArgs.priority) {
          const pr = String(outputArgs.priority).toLowerCase();
          if (["low", "medium", "high", "critical"].includes(pr)) {
            setEditPriority(pr);
          } else {
            setEditPriority("low");
          }
        }
        setAgentQuery("");
        addLog("WIRE: AI agent successfully updated edit draft fields");
      }
    }
  });

  const agentLoading = status === 'submitted' || status === 'streaming';


  // Telemetry status
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);

  // Live Terminal Log System (Newspaper Teletype logs)
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "DESK_INIT: Preparing editorial log...",
    "WIRE: Connection to central press active.",
    "INK: Printing presses ready.",
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
          ip: "SECURE/MASKED"
        });
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

  useEffect(() => {
    if (selectedNews) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedNews]);

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
        ...selectedNews,
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

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuery.trim()) return;

    const promptWithContext = `You are updating/revising an existing news article. 

Here is the current edit draft:
---
TITLE: ${editTitle || "(empty)"}
CONTENT:
${editContent || "(empty)"}
TAGS: ${editTags || "(empty)"}
PRIORITY: ${editPriority || "(empty)"}
SOURCE LINK: ${editSourceUrl || "(empty)"}
---

User Update Instructions:
"${agentQuery}"

Please modify or rewrite the news article according to the user instructions. Make sure to respond with the complete updated schema (title, content, tags, priority, and sourceUrl).`;

    sendMessage({ content: promptWithContext, role: 'user' } as any);
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
      
      const oldItem = newsList.find(item => item.id === newsId);
      const updatedItem = {
        ...oldItem,
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
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-['Playfair_Display',_Georgia,_serif] text-stone-900 text-2xl animate-pulse font-bold">
        [ RETRIEVING ARCHIVES & EDITORIAL FEED... ]
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const canAdd = profile?.role === "admin" || profile?.role === "editor";

  return (
    <div className="min-h-screen w-full bg-[#f5f2e9] flex flex-col relative selection:bg-red-800/10 selection:text-stone-955 text-stone-900 font-serif">
      
      {/* Newspaper texture noise overlays via css */}
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>
      
      <Header profile={profile} systemTime={systemTime} activeTab="news" />

      {/* Main Newspaper Layout */}
      <div className="flex-1 grid grid-cols-1 relative z-10 max-w-6xl mx-auto w-full pb-8 items-start px-4 sm:px-6 md:px-8 pt-6">
        
        {/* News wire articles list (Left Columns) */}
        <div className="w-full flex flex-col relative">
          
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 rounded">
            
            {/* Column Header */}
            <div className="flex justify-between items-center text-[10px] font-mono text-stone-600 uppercase tracking-widest border-b border-stone-300 pb-1.5 mb-2 pl-2">
              <span>DAILY WIRE LOGS</span>
              <span>LATEST BROADCASTS</span>
            </div>

            {/* Headlines Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[4px] border-double border-black pb-4 mb-6 pl-2 gap-3">
              <div>
                <h2 className="font-['Playfair_Display',_Georgia,_serif] text-4xl sm:text-5xl font-black drop-shadow-sm text-black tracking-tighter uppercase leading-none select-none text-left">
                  LATEST DISPATCHES
                </h2>
                
                <div className="flex gap-2.5 text-[10px] font-bold text-black border-b border-black mt-2 uppercase tracking-wide">
                  <span>PRINT QUEUE FEED</span>
                </div>
              </div>

              {/* Action Buttons & Search Widget */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                {canAdd && (
                  <Link 
                    href="/news/add"
                    className="vintage-stamp text-center py-2 px-3.5 text-[10px] flex items-center justify-center font-bold tracking-wider"
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
                    className="w-full bg-[#f5f2e9] text-stone-900 text-xs pl-3 pr-8 py-2 font-mono outline-none border-2 border-stone-950 focus:border-red-800 rounded shadow-sm"
                  />
                  <svg className="w-3.5 h-3.5 text-stone-700 absolute right-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Split Panel: Feed List */}
            <div className="flex flex-col gap-6 pl-2">
              
              {/* Feeds Container */}
              <div className="bg-[#fcfaf2] border-2 border-stone-950 rounded p-4 sm:p-6 shadow-sm flex flex-col relative">
                              {/* Priority Selector Filter Bar */}
                <div className="flex flex-wrap gap-2.5 pb-3 border-b border-stone-300 mb-4 relative z-10 font-mono text-[10px] uppercase tracking-wider">
                  <span className="text-stone-600 font-bold self-center mr-1">FILTER LEVEL:</span>
                  {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setSelectedPriority(level);
                        addLog(`FILTER: Active filter changed to '${level}'`);
                      }}
                      className={`px-2 py-0.5 border-2 rounded font-black transition-all cursor-pointer ${selectedPriority === level ? "border-stone-950 text-white bg-stone-950" : "border-stone-400 text-stone-600 hover:border-stone-950 hover:text-stone-950 bg-white"}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <div className="space-y-6 relative z-10">
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
                          setSimilarNews([]);
                          setCheckingSimilarity(false);
                          setHasCheckedSimilarity(false);
                          setSimilarityError("");
                          addLog(`VIEW: Focus shifted to article ${item.id.slice(0, 8)}`);
                        }}
                        className="bg-white border-2 border-stone-950 p-5 hover:bg-stone-50 transition-all flex flex-col gap-2 relative group/item shadow cursor-pointer text-left rounded"
                      >
                        <div className="flex flex-wrap gap-2.5 items-center">
                          <span className={`font-mono text-[9px] border-2 px-2 py-0.5 rounded tracking-wide uppercase font-bold ${getPriorityColors(item.priority)}`}>
                             {item.priority}
                          </span>
                          <span className="font-mono text-[10px] text-stone-600">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                          <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded tracking-wide uppercase font-bold ${item.isPublished ? "border-green-600 text-green-700 bg-green-50" : "border-stone-400 text-stone-500 bg-stone-100"}`}>
                            {item.isPublished ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                          {isAdmin && item.likesCount !== undefined && (
                            <span className="font-mono text-[9px] border border-red-800 text-red-800 bg-red-50/50 px-1.5 py-0.5 rounded tracking-wide uppercase font-bold">
                              ❤️ {item.likesCount} {item.likesCount === 1 ? 'LIKE' : 'LIKES'}
                            </span>
                          )}
                        </div>

                        <h4 className="font-['Playfair_Display',_Georgia,_serif] text-2xl font-black tracking-tight text-black leading-snug group-hover/item:text-gray-800 transition-colors uppercase">
                          {item.title}
                        </h4>
                        
                        <p className="font-serif text-sm text-stone-850 leading-relaxed truncate max-w-full">
                          {item.content}
                        </p>

                        <div className="flex flex-wrap justify-between items-center mt-2 pt-2 border-t border-dashed border-stone-300">
                          <div className="flex gap-1.5">
                            {item.tags.map((tag) => (
                              <span key={tag} className="font-mono text-[9px] bg-stone-200 border border-stone-400 text-stone-800 px-1.5 py-0.5 rounded uppercase font-bold">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <span className="font-mono text-[10px] text-stone-600 group-hover/item:text-stone-900 border-b border-stone-900 transition-colors font-bold">
                            [ READ REPORT ]
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty state visual */}
                  {newsList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-12 h-12 text-stone-400 mb-4">
                        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="4" width="18" height="16" rx="2" />
                          <line x1="7" y1="8" x2="17" y2="8" />
                          <line x1="7" y1="12" x2="17" y2="12" />
                          <line x1="7" y1="16" x2="13" y2="16" />
                        </svg>
                      </div>
                      <h3 className="font-playfair text-stone-800 text-lg font-black uppercase">
                        Wire Archives Empty
                      </h3>
                      <p className="font-serif text-sm text-stone-600 max-w-sm leading-relaxed mt-2">
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
                        className="vintage-stamp text-xs tracking-widest disabled:opacity-50 cursor-pointer bg-white"
                      >
                        {fetchLoading ? "[ RE-READING WIRE... ]" : "LOAD NEXT DISPATCHES"}
                      </button>
                    </div>
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
          <div className={`w-full ${isEditing ? 'max-w-5xl' : 'max-w-2xl'} bg-[#fcfaf2] border-4 border-stone-950 p-6 shadow-[8px_8px_0px_#111] flex flex-col relative max-h-[90vh] rounded transition-all duration-300`}>
            
            {/* Close */}
            <button
              onClick={() => {
                setSelectedNews(null);
                addLog("INSPECTOR: Dossier closed");
              }}
              className="absolute top-3 right-4 font-mono font-bold text-stone-950 border-2 border-stone-950 px-2 py-0.5 hover:bg-stone-950 hover:text-white transition-colors cursor-pointer text-xs"
            >
              [ CLOSE ]
            </button>

            {/* Vintage paper column inside dossier */}
            <div className="flex-1 overflow-y-auto custom-paper-scrollbar mt-6 pr-6 text-stone-900">
              
              {isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <form onSubmit={handleUpdatePayload} className="lg:col-span-2 flex flex-col gap-4 font-serif text-stone-900 text-left">
                    <div className="flex flex-col border-b border-stone-400 pb-2">
                      <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                        TRANSMISSION HEADLINE
                      </label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-transparent border-none outline-none font-bold text-lg text-stone-950 placeholder-stone-600/40 font-serif"
                      />
                    </div>

                    <div className="flex flex-col border-b border-stone-400 pb-2">
                      <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
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
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                          DRAFT CHRONICLE DETAILS
                        </label>
                        <button
                          type="button"
                          onClick={handleCheckSimilarity}
                          disabled={checkingSimilarity || !editContent.trim()}
                          className="font-mono text-[10px] border-2 border-black text-black bg-[#fcfaf2] px-3 py-1 hover:bg-black hover:text-[#fcfaf2] transition-all uppercase tracking-widest font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {checkingSimilarity ? "Checking..." : "[ Check Wire Similarity ]"}
                        </button>
                      </div>
                      <textarea
                        required
                        value={editContent}
                        onChange={(e) => {
                          setEditContent(e.target.value);
                          setSimilarNews([]);
                          setHasCheckedSimilarity(false);
                          setSimilarityError("");
                        }}
                        className="w-full bg-transparent border-none outline-none text-sm text-stone-950 placeholder-stone-600/40 resize-none flex-1 leading-relaxed custom-paper-scrollbar"
                        rows={8}
                      />

                      {/* Similarity check results dashboard */}
                      {similarNews.length > 0 && (
                        <div className="mt-2 border-2 border-dashed border-stone-800 bg-[#e8e4d9]/40 p-3 text-xs font-mono">
                          <div className="font-bold uppercase tracking-wider text-red-900 mb-2 flex items-center justify-between">
                            <span>🚨 SIMILAR DISPATCHES DETECTED ON WIRE:</span>
                            <button 
                              type="button" 
                              onClick={() => {
                                setSimilarNews([]);
                                setHasCheckedSimilarity(false);
                              }} 
                              className="text-stone-500 hover:text-black font-bold uppercase tracking-widest cursor-pointer"
                            >
                              [Clear]
                            </button>
                          </div>
                          <div className="flex flex-col gap-2">
                            {similarNews.map((newsItem, i) => {
                              const pct = Math.round(newsItem.similarity * 100);
                              let colorClass = "text-stone-600";
                              if (pct > 80) colorClass = "text-red-700 font-bold";
                              else if (pct > 50) colorClass = "text-amber-700 font-bold";

                              return (
                                <div key={newsItem.id} className="border-b border-stone-300 pb-2 last:border-b-0 last:pb-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="font-serif font-bold text-stone-900 uppercase">
                                      {i + 1}. {newsItem.title}
                                    </span>
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${colorClass}`}>
                                      {pct}% MATCH
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-stone-600 line-clamp-2 mt-1 leading-relaxed font-serif">
                                    {newsItem.content}
                                  </p>
                                  <div className="text-[8px] text-stone-500 uppercase mt-0.5">
                                    Priority: {newsItem.priority} • Created: {new Date(newsItem.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {hasCheckedSimilarity && similarNews.length === 0 && (
                        <div className="mt-2 border border-green-600 bg-green-50/50 p-2.5 text-[10px] font-mono text-green-800 uppercase flex items-center gap-1.5">
                          <span>✅</span>
                          <span>No similar dispatches found on wire. Clear for transmission!</span>
                        </div>
                      )}

                      {similarityError && (
                        <div className="mt-2 border border-red-500 bg-red-100/50 p-2 text-[10px] font-mono text-red-800 uppercase">
                          ERROR: {similarityError}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                        ALERT URGENCY
                      </span>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                        {[
                          { key: "low", text: "LOW", color: "bg-stone-500", border: "border-stone-600" },
                          { key: "medium", text: "MEDIUM", color: "bg-blue-500", border: "border-blue-600" },
                          { key: "high", text: "HIGH", color: "bg-amber-500", border: "border-amber-600" },
                          { key: "critical", text: "CRITICAL", color: "bg-red-700", border: "border-red-800" },
                        ].map((pr) => (
                          <button
                            key={pr.key}
                            type="button"
                            onClick={() => setEditPriority(pr.key)}
                            className={`py-1.5 rounded border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${editPriority.toLowerCase() === pr.key ? "bg-stone-950 text-white border-stone-950 font-bold scale-[1.04]" : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"}`}
                          >
                            <span>{pr.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-b border-stone-400 pb-3 mt-2">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">PUBLICATION STATUS</span>
                        <span className="font-serif text-xs text-stone-500">Toggle to publish or unpublish this report.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditIsPublished(!editIsPublished)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-2 ${editIsPublished ? 'bg-green-700 border-green-800' : 'bg-stone-300 border-stone-400'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsPublished ? 'translate-x-5' : 'translate-x-1'}`}
                        />
                      </button>
                    </div>

                    <div className="flex flex-col border-b border-stone-400 pb-2">
                      <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
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
                        className="flex-1 bg-stone-950 text-white border-2 border-stone-950 font-mono font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-stone-300 text-stone-900 border-2 border-stone-305 font-mono font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                  <div className="lg:col-span-1 flex flex-col relative w-full lg:sticky lg:top-0">
                    <div className="bg-[#fcfaf2] border-[3px] border-black p-4 flex flex-col relative z-10 shadow-[4px_4px_0px_#111111] rounded">
                      <div className="absolute top-4 right-4 border-2 border-black text-black border-b border-black font-black text-[9px] px-1.5 -rotate-[10deg] mix-blend-multiply select-none font-['Playfair_Display',_Georgia,_serif] uppercase">
                        STAFF AI
                      </div>
                      <div className="border-b-2 border-black pb-3 mb-4 text-left">
                        <h3 className="font-['Playfair_Display',_Georgia,_serif] text-base text-black uppercase tracking-wide font-black">EDITORIAL ASSISTANT</h3>
                        <p className="font-mono text-[9px] text-stone-600 font-bold mt-1 tracking-wider uppercase">AUTOMATED WIRE DESPATCH</p>
                      </div>
                      <div className="flex-1 bg-[#fcfaf2] flex flex-col relative">
                        <form onSubmit={handleAskAgent} className="flex flex-col gap-4 font-serif text-stone-900 text-left">
                          <p className="font-serif text-xs text-stone-700 leading-relaxed">Provide instructions or a topic. The Staff Agent will search the web using <strong>Tavily Search & Extraction</strong>, synthesize the details, and return a print-ready news report draft matching the database schema.</p>
                          <div className="flex flex-col border-[2px] border-black p-2 bg-[#fcfaf2]">
                            <label className="font-mono text-[9px] font-bold text-black uppercase tracking-widest mb-1.5">Enter Topic or Wire Request:</label>
                            <textarea required placeholder="e.g. OpenAI releases a new reasoning model named o3. Include its features and pricing." value={agentQuery} onChange={(e) => setAgentQuery(e.target.value)} className="w-full bg-transparent outline-none text-xs text-stone-950 placeholder-stone-400 font-serif leading-relaxed h-20 resize-none typewriter-field" disabled={agentLoading} />
                          </div>
                          <button type="submit" className="vintage-stamp w-full text-center py-2 bg-black text-[#fcfaf2] border-black hover:bg-stone-800 hover:text-[#fcfaf2] font-bold cursor-pointer text-xs" disabled={agentLoading || !agentQuery.trim()}>
                            {agentLoading ? "COMMISSIONING TELETYPES..." : "DISPATCH NEWS AGENT"}
                          </button>
                          {agentLoading && (
                            <div className="mt-2 p-2 border border-stone-300 bg-[#e8e4d9]/60 text-center font-mono text-[10px] text-stone-700 flex flex-col gap-1">
                              <div className="animate-pulse flex items-center justify-center gap-1">
                                <span className="inline-block w-2 h-2 bg-black rounded-full animate-ping"></span>
                                <span className="text-black font-bold">[ WIRE AGENT AT WORK ]</span>
                              </div>
                            </div>
                          )}
                          {messages.length > 0 && (
                            <div className="mt-4 border border-stone-400 bg-stone-100 p-2 text-[10px] font-mono h-48 overflow-y-auto custom-paper-scrollbar">
                              <div className="font-bold border-b border-stone-300 pb-1 mb-2 uppercase text-stone-800">Agent Logs</div>
                              {messages.map((m, i) => {
                                const userContent = (m as any).content || (m.parts && m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')) || '';
                                const agentContent = (m as any).content || (m.parts && m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')) || '';
                                const toolInvs = (m.parts ? m.parts.filter((p: any) => p.type === 'tool-invocation' || p.type === 'dynamic-tool-invocation').map((p: any) => p.toolInvocation) : ((m as any).toolInvocations || []));

                                return (
                                <div key={i} className="mb-2">
                                  {m.role === 'user' ? (
                                    <div className="text-blue-700">USER: {userContent}</div>
                                  ) : (
                                    <div className="text-green-800">
                                      {agentContent && <div>AGENT: {agentContent}</div>}
                                      {toolInvs.map((t: any, idx: number) => (
                                        <div key={idx} className="ml-2 border-l-2 border-stone-300 pl-2 mt-1">
                                          <span className="font-bold text-orange-700">TOOL CALLED: </span> {t.toolName}
                                          <div className="text-stone-500 truncate">Args: {JSON.stringify(t.args)}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                );
                              })}
                            </div>
                          )}
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b-4 border-double border-stone-950 pb-3 mb-5 text-center relative">
                    <span className="font-mono text-[9px] text-stone-600 font-bold uppercase tracking-widest block mb-1">
                      WIRE REPORT INDEX ID: {selectedNews.id.slice(0, 8)}
                    </span>
                    <h3 className="font-playfair text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-stone-950">
                      {selectedNews.title}
                    </h3>
                  </div>

                  <div className="font-serif text-base leading-relaxed text-justify space-y-4">
                    <p className="indent-6 text-stone-900">
                      {selectedNews.content}
                    </p>
                  </div>

                  {selectedNews.sourceUrl && (
                    <div className="mt-6 border-t border-stone-300 pt-3 text-left">
                      <span className="font-mono text-[9px] text-stone-500 font-bold uppercase block mb-1">DATA VERIFICATION MATRIX (URL)</span>
                      <a
                        href={selectedNews.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] text-stone-900 border-b border-stone-900 hover:underline break-all font-bold"
                      >
                        {selectedNews.sourceUrl}
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-stone-300 pt-4 font-mono text-[10px] text-stone-600 font-bold text-left">
                    <div>
                      <span className="block text-[8px] text-stone-500 uppercase tracking-wide">WIRE PRIORITY</span>
                      <span className="text-stone-950 uppercase">{selectedNews.priority}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-stone-500 uppercase tracking-wide">BROADCAST DATE</span>
                      <span className="text-stone-950">{new Date(selectedNews.createdAt).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] text-stone-500 uppercase tracking-wide">STATUS</span>
                      <span className={`font-bold ${selectedNews.isPublished ? "text-green-700" : "text-stone-500"}`}>
                        {selectedNews.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </div>
                    {isAdmin && selectedNews.likesCount !== undefined && (
                      <div>
                        <span className="block text-[8px] text-stone-500 uppercase tracking-wide">NUMBER OF LIKES</span>
                        <span className="text-red-800 font-bold">
                          ❤️ {selectedNews.likesCount} {selectedNews.likesCount === 1 ? 'LIKE' : 'LIKES'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5 border-t border-stone-300 pt-4">
                    {selectedNews.tags.map((tag) => (
                      <span key={tag} className="font-mono text-[9px] bg-stone-200 text-stone-850 border border-stone-400 px-2 py-0.5 rounded font-bold uppercase">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions inside inspector */}
                  <div className="mt-8 border-t-4 border-double border-stone-950 pt-4 flex flex-wrap justify-between items-center gap-4">
                    <span className="font-mono text-[9px] text-stone-500 font-bold uppercase">WIRE RECORDS SYSTEM CONTROL</span>
                    <div className="flex gap-3">
                      {(profile?.role === "admin" || profile?.role === "editor") && (
                        <>
                          <button
                            onClick={() => handleTogglePublish(selectedNews.id, selectedNews.isPublished)}
                            className={`vintage-stamp text-xs py-2 bg-transparent hover:text-white cursor-pointer ${selectedNews.isPublished ? 'text-amber-700 border-amber-700 hover:bg-amber-700' : 'text-green-700 border-green-700 hover:bg-green-700'}`}
                          >
                            {selectedNews.isPublished ? 'UNPUBLISH' : 'PUBLISH'}
                          </button>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="vintage-stamp text-xs py-2 bg-transparent text-stone-900 border-stone-950 hover:bg-stone-950 hover:text-white cursor-pointer"
                          >
                            EDIT REPORT
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handlePurge(selectedNews.id)}
                        className="vintage-stamp text-xs py-2 bg-transparent text-stone-900 border-b border-stone-900 border-red-800 hover:bg-red-800 hover:text-white shadow-[2px_2px_0px_#801c1c]"
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
      

    </div>
  );
}


