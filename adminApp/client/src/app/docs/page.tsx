"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";
import Header from "../../components/Header";
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
    <div className="min-h-screen w-full bg-[#f5f2e9] flex flex-col relative selection:bg-red-800/10 selection:text-stone-955 text-stone-900 font-serif">
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>
      
      <Header profile={profile} systemTime={systemTime} activeTab="docs" />
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
          <div className="flex-1 max-w-6xl mx-auto w-full pb-8 px-4 sm:px-6 md:px-8 pt-6">
            {/* Main Chronicle Feed */}
            <main className="w-full flex flex-col relative">
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
                    <div className="space-y-6 relative z-10">
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
                                  <div className="flex items-center gap-1 text-stone-500 font-mono text-[10px]">
                                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                                  </div>
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
                                  className="font-mono text-[10px] font-bold text-stone-900 hover:text-white hover:bg-stone-950 flex items-center gap-2 transition-all cursor-pointer border-2 border-stone-950 rounded px-3 py-1.5 bg-transparent shadow-[2px_2px_0px_#111] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]"
                                >
                                  <svg 
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                  </svg>
                                  <span>
                                    {isExpanded ? "HIDE SUB-CHRONICLES" : `SHOW SUB-CHRONICLES (${children.length})`}
                                  </span>
                                </button>
                                 {isExpanded && (
                                  <div className="mt-4 pl-4 flex flex-col gap-3 animate-fadeIn">
                                    {children.map((child, idx) => {
                                      const isLast = idx === children.length - 1;
                                      return (
                                        <div key={child.id} className="relative flex items-center pl-7 group">
                                          {/* Vertical connector line segment */}
                                          <div className={`absolute left-0 w-0.5 border-l-2 border-dashed border-stone-400/60 ${isLast ? 'h-[50%] top-0' : 'h-full top-0'}`}></div>
                                          {/* Horizontal connector line segment */}
                                          <div className="absolute left-0 top-1/2 w-7 h-0.5 border-t-2 border-dashed border-stone-400/60"></div>
                                          
                                          <div 
                                            onClick={() => router.push(`/docs/${child.slug}`)}
                                            className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between bg-white hover:bg-stone-50/80 border-2 border-stone-955/20 hover:border-stone-955 p-3.5 rounded shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:shadow-[3px_3px_0px_#111] cursor-pointer transition-all gap-2 text-left"
                                          >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                              <span className="font-mono text-[9px] bg-red-800/10 text-red-900 border border-red-900/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">
                                                Sub {idx + 1}
                                              </span>
                                              <svg className="w-4 h-4 text-stone-500 group-hover:text-red-900 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                              <span className="font-serif font-black text-sm uppercase text-stone-900 group-hover:text-red-900 truncate">
                                                {child.title}
                                              </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-3 font-mono text-[10px] text-stone-500">
                                              <span className="font-bold text-stone-400 group-hover:text-red-900">
                                                ORDER Index: {child.orderIndex}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                      {docList.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                          <div className="w-12 h-12 text-stone-400 mb-4">
                            <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="3" y="4" width="18" height="16" rx="2" />
                              <line x1="7" y1="8" x2="17" y2="8" />
                              <line x1="7" y1="12" x2="17" y2="12" />
                              <line x1="7" y1="16" x2="13" y2="16" />
                            </svg>
                          </div>
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
