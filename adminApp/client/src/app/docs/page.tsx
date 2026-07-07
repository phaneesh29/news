"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";
import { marked } from "marked";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

interface DocItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  parentId: string | null;
  orderIndex: number;
  createdAt: string;
  status: string;
  isPublished: boolean;
}

export default function DocsDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [docList, setDocList] = useState<DocItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const [systemTime, setSystemTime] = useState("");
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleParent = (id: string) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "DESK_INIT: Preparing documentation log...",
    "WIRE: Connection to central press active.",
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const fetchDocs = async (query: string = "") => {
    try {
      setFetchLoading(true);
      let url = "";
      if (query) {
        url = `${API_BASE_URL}/docs/search?q=${encodeURIComponent(query)}&limit=150`;
        addLog(`WIRE_SEARCH: Querying nodes for '${query}'`);
      } else {
        url = `${API_BASE_URL}/docs?limit=150`;
        addLog("WIRE: Refreshing printing press feeds...");
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch docs");
      const data = await res.json();
      
      const items = (data.docs || []).map((item: any) => ({
        ...item,
        status: "SYNCED"
      }));

      setDocList(items);
      addLog(`WIRE: Feed updated with ${items.length} print records`);
    } catch (err) {
      console.error("Fetch docs error:", err);
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

        setClientInfo({ os, browser, ip: "SECURE/MASKED" });
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
      if (profile) fetchDocs(searchQuery);
    }, 450);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, profile]);

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
    } catch (err) { console.error(err); }
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
    <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-red-800/10 selection:text-stone-950 text-stone-900 font-serif">
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>
      
      <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-950 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex flex-col text-center md:text-left">
            <Link href="/dashboard" className="font-['UnifrakturMaguntia',_Georgia,_serif] text-6xl sm:text-7xl drop-shadow-sm tracking-tight text-black select-none hover:opacity-80 border-b-4 border-double border-black transition-opacity pb-1 leading-none">
              Dev Bits
            </Link>
            <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-2 uppercase font-bold">
              EDITORIAL DESK • STAFF ID: <span className="text-black">{profile?.email}</span> ({profile?.role?.toUpperCase()})
            </span>
          </div>

          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-stone-200/50 px-4 py-2 border border-stone-400/50 rounded">
            <Link href="/dashboard" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; News Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/blogs" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Blogs Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/docs" className="text-stone-900 border-b border-stone-900 hover:text-red-900 transition-colors font-black border-b-2 border-red-850 pb-0.5">&gt; Docs Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/digest" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Digest Wire</Link>
            {isAdmin && (
              <>
                <span className="text-stone-400">|</span>
                <Link href="/feedback" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; User Feedback</Link>
              </>
            )}
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <Link href="/settings" className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-white px-3 py-1.5 hover:bg-black hover:text-white transition-all uppercase tracking-widest flex items-center font-bold">
                Oversight Board
              </Link>
            )}
            <button onClick={handleLogout} className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-white px-3 py-1.5 hover:bg-black hover:text-white transition-all uppercase tracking-widest flex items-center font-bold cursor-pointer">
              Log Out
            </button>
          </div>
        </div>
        <div className="w-full flex justify-between items-center border-t border-stone-850 pt-2 text-[10px] font-mono uppercase text-stone-700 tracking-wider">
          <span>VOL. CXXVI... No. 47190</span>
          <span className="font-bold text-stone-950">{systemTime || "[ RETRIEVING TIME ]"}</span>
          <span>PRICE: 10 CENTS</span>
        </div>
      </header>
      {/* Filtering Logic for Parent-Child Hierarchy */}
      {(() => {
        const parents = docList.filter(item => 
          !item.parentId || !docList.some(p => p.id === item.parentId)
        ).sort((a, b) => a.orderIndex - b.orderIndex);

        const getChildrenForParent = (parentId: string) => {
          return docList.filter(item => item.parentId === parentId)
            .sort((a, b) => a.orderIndex - b.orderIndex);
        };

        const displayedDocs = searchQuery.trim() !== "" ? docList : parents;

        return (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 max-w-[1600px] mx-auto w-full pb-8 items-start">
            
            {/* Left Column: Chronicle Outline Archive Tree Directory */}
            <aside className="lg:col-span-4 bg-[#fcfaf2] border-4 border-stone-950 p-6 flex flex-col relative shadow-[4px_4px_0px_#111] rounded text-left min-h-[300px]">
              <h3 className="font-['Playfair_Display',_Georgia,_serif] text-base text-black uppercase tracking-wide font-black border-b-2 border-black pb-2 mb-4">
                ARCHIVE OUTLINE DIRECTORY
              </h3>
              <p className="font-serif text-[11px] text-stone-600 mb-4 leading-relaxed">
                A hierarchical index of all documentation entries registered on the wire. Expand parents to reveal sub-chronicles.
              </p>
              
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[50vh] pr-2 custom-paper-scrollbar">
                {parents.map((node) => {
                  const children = getChildrenForParent(node.id);
                  const isExpanded = !!expandedParents[node.id];
                  const hasChildren = children.length > 0;

                  return (
                    <div key={node.id} className="flex flex-col border-b border-stone-300/30 py-1">
                      <div className="flex items-center justify-between py-1 px-1.5 hover:bg-stone-200/50 rounded transition-colors cursor-pointer group/node">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {hasChildren ? (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleParent(node.id);
                              }}
                              className="w-4 h-4 flex items-center justify-center text-stone-500 hover:text-black font-bold text-xs"
                            >
                              {isExpanded ? "▼" : "▶"}
                            </button>
                          ) : (
                            <span className="w-4 h-4 flex items-center justify-center text-stone-300">•</span>
                          )}
                          <Link 
                            href={`/docs/${node.slug}`}
                            className="text-xs font-mono font-bold text-stone-850 hover:text-red-900 truncate"
                          >
                            {node.title}
                          </Link>
                        </div>
                        <span className="opacity-0 group-hover/node:opacity-100 font-mono text-[9px] text-stone-400 uppercase select-none">
                          VIEW
                        </span>
                      </div>
                      
                      {/* Nested Tree Children */}
                      {hasChildren && isExpanded && (
                        <div className="border-l border-stone-400/50 ml-3 pl-2 flex flex-col gap-1.5 mt-1 pb-1">
                          {children.map(child => (
                            <div key={child.id} className="flex items-center justify-between py-0.5 px-1 hover:bg-stone-200/50 rounded transition-colors group/subnode">
                              <Link 
                                href={`/docs/${child.slug}`}
                                className="text-[11px] font-mono text-stone-600 hover:text-red-900 truncate flex-1"
                              >
                                📄 {child.title}
                              </Link>
                              <span className="opacity-0 group-hover/subnode:opacity-100 font-mono text-[8px] text-stone-400 uppercase select-none">
                                READ
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {docList.length === 0 && (
                  <span className="font-mono text-xs text-stone-450 italic">No dossiers loaded.</span>
                )}
              </div>
            </aside>

            {/* Right Column: Main Chronicle Feed */}
            <main className="lg:col-span-8 w-full flex flex-col relative">
              <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 rounded">
                <div className="flex justify-between items-center text-[10px] font-mono text-stone-600 uppercase tracking-widest border-b border-stone-300 pb-1.5 mb-2 pl-2">
                  <span>SYSTEM DOCUMENTATION</span>
                  <span>LATEST ARCHIVES</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[4px] border-double border-black pb-4 mb-6 pl-2 gap-3">
                  <div>
                    <h2 className="font-['Playfair_Display',_Georgia,_serif] text-4xl sm:text-5xl font-black drop-shadow-sm text-black tracking-tighter uppercase leading-none select-none text-left">
                      SYSTEM DOCS
                    </h2>
                    <div className="flex gap-2.5 text-[10px] font-bold text-black border-b border-black mt-2 uppercase tracking-wide">
                      <span>CHRONICLE WIRES</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    {canAdd && (
                      <Link href="/docs/add" className="vintage-stamp text-center py-2 px-3.5 text-[10px] flex items-center justify-center font-bold tracking-wider">
                        CREATE DOC
                      </Link>
                    )}
                    <div className="relative w-full sm:w-52">
                      <input type="text" placeholder="Search doc reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#f5f2e9] text-stone-900 text-xs pl-3 pr-8 py-2 font-mono outline-none border-2 border-stone-950 focus:border-red-800 rounded shadow-sm" />
                      <svg className="w-3.5 h-3.5 text-stone-700 absolute right-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-6 pl-2">
                  <div className="bg-[#fcfaf2] border-2 border-stone-955 rounded p-4 sm:p-6 shadow-sm flex flex-col relative">
                    <div className="space-y-6 relative z-10 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar">
                      {displayedDocs.map((item) => {
                        const children = getChildrenForParent(item.id);
                        const isExpanded = !!expandedParents[item.id];
                        const hasChildren = children.length > 0 && searchQuery.trim() === "";

                        return (
                          <div key={item.id} className="flex flex-col gap-4 border-2 border-stone-950 p-5 bg-white hover:shadow-[4px_4px_0px_#111] transition-all rounded shadow relative">
                            {/* Card Item Header */}
                            <div 
                              onClick={() => router.push(`/docs/${item.slug}`)} 
                              className="flex flex-col gap-2.5 cursor-pointer text-left group/item"
                            >
                              <div className="flex flex-wrap gap-2.5 items-center justify-between">
                                <div className="flex gap-2.5 items-center">
                                  <span className="font-mono text-[10px] text-stone-600">
                                    🕒 {new Date(item.createdAt).toLocaleString()}
                                  </span>
                                  <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded tracking-wide uppercase font-bold ${item.isPublished ? "border-green-600 text-green-700 bg-green-50" : "border-stone-400 text-stone-500 bg-stone-100"}`}>
                                    {item.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                  </span>
                                  {item.parentId && (
                                    <span className="font-mono text-[9px] border border-blue-600 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded tracking-wide uppercase font-bold">
                                      SUB-DOC
                                    </span>
                                  )}
                                  <span className="font-mono text-[9px] border border-stone-500 text-stone-700 bg-stone-50 px-1.5 py-0.5 rounded tracking-wide uppercase font-bold">
                                    ORDER: {item.orderIndex}
                                  </span>
                                </div>
                                <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest">
                                  ID: {item.id.slice(0, 8)}
                                </span>
                              </div>

                              <h4 className="font-['Playfair_Display',_Georgia,_serif] text-2xl font-black tracking-tight text-black leading-snug group-hover/item:text-red-900 transition-colors uppercase">
                                {item.title}
                              </h4>
                              
                              <p className="font-serif text-sm text-stone-800 leading-relaxed line-clamp-2 max-w-full">
                                {item.content}
                              </p>

                              <div className="flex flex-wrap justify-between items-center mt-2 pt-2.5 border-t border-dashed border-stone-300">
                                <span className="font-mono text-[11px] text-stone-600 font-bold bg-stone-100 border border-stone-300 px-1.5 py-0.5 rounded">
                                  slug: /{item.slug}
                                </span>
                                <span className="font-mono text-[10px] text-stone-650 group-hover/item:text-red-900 border-b border-stone-900 transition-colors font-bold uppercase tracking-wider">
                                  [ OPEN DOSSIER ]
                                </span>
                              </div>
                            </div>

                            {/* Collapsible Child Docs Container */}
                            {hasChildren && (
                              <div className="mt-2 pt-3 border-t border-stone-300 text-left">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleParent(item.id);
                                  }}
                                  className="font-mono text-[10px] font-bold text-stone-700 hover:text-black flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-400 hover:border-black rounded px-2.5 py-1.5 bg-stone-100"
                                >
                                  {isExpanded ? "📖 HIDE SUB-CHRONICLES" : `📂 SHOW SUB-CHRONICLES (${children.length})`}
                                </button>

                                {isExpanded && (
                                  <div className="mt-3 pl-4 border-l-2 border-stone-950 flex flex-col gap-3.5 animate-fadeIn">
                                    {children.map((child) => (
                                      <div 
                                        key={child.id}
                                        onClick={() => router.push(`/docs/${child.slug}`)}
                                        className="bg-[#fdfcf7] hover:bg-stone-50 border border-stone-400 p-4 rounded shadow-xs cursor-pointer flex flex-col gap-1.5 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                                      >
                                        <div className="flex justify-between items-center text-[9px] font-mono text-stone-500">
                                          <span>ORDER: {child.orderIndex}</span>
                                          <span className={`px-1 rounded ${child.isPublished ? 'text-green-700 bg-green-50' : 'text-stone-500 bg-stone-100'}`}>
                                            {child.isPublished ? 'PUBLISHED' : 'DRAFT'}
                                          </span>
                                        </div>
                                        <h5 className="font-serif font-black text-sm uppercase text-stone-900 hover:text-red-900 leading-snug">
                                          {child.title}
                                        </h5>
                                        <p className="font-serif text-xs text-stone-650 leading-relaxed line-clamp-1">
                                          {child.content}
                                        </p>
                                        <div className="text-[10px] font-mono text-stone-500 mt-1 border-t border-dotted border-stone-300 pt-1.5">
                                          slug: /{child.slug}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                      {docList.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-12 h-12 text-stone-400 mb-4"><svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="16" x2="13" y2="16" /></svg></div>
                          <h3 className="font-playfair text-stone-800 text-lg font-black uppercase">Wire Archives Empty</h3>
                          <p className="font-serif text-sm text-stone-600 max-w-sm leading-relaxed mt-2">No documentation files are currently logged on the wire feed.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        );
      })()}
    </div>
  );
}
