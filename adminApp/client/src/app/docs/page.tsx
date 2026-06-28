"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";
import { marked } from "marked";

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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  const [systemTime, setSystemTime] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [editSlug, setEditSlug] = useState("");
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [editOrderIndex, setEditOrderIndex] = useState<number>(0);
  const [editIsPublished, setEditIsPublished] = useState(false);
  
  const [parentOptions, setParentOptions] = useState<DocItem[]>([]);

  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

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

  const fetchDocs = async (cursor: string | null = null, query: string = "", isAppend = false) => {
    try {
      setFetchLoading(true);
      let url = "";
      if (query) {
        url = `${API_BASE_URL}/docs/search?q=${encodeURIComponent(query)}&limit=10`;
        addLog(`WIRE_SEARCH: Querying nodes for '${query}'`);
      } else {
        url = `${API_BASE_URL}/docs?limit=10${cursor ? `&cursor=${cursor}` : ""}`;
        addLog(cursor ? `WIRE: Loading next block ${cursor.slice(0, 8)}...` : "WIRE: Refreshing printing press feeds...");
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch docs");
      const data = await res.json();
      
      const items = (data.docs || []).map((item: any) => ({
        ...item,
        status: "SYNCED"
      }));

      if (isAppend) {
        setDocList((prev) => [...prev, ...items]);
      } else {
        setDocList(items);
      }
      
      setNextCursor(query ? null : data.nextCursor || null);
      addLog(`WIRE: Feed updated with ${items.length} print records`);
    } catch (err) {
      console.error("Fetch docs error:", err);
      addLog("WARNING: Wire connection timed out or database empty");
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchParentOptions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/docs?limit=150`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setParentOptions(data.docs || []);
      }
    } catch (err) {
      console.error("Failed to fetch parents:", err);
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
      if (profile) fetchDocs(null, searchQuery, false);
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

  useEffect(() => {
    if (selectedDoc) {
      document.body.style.overflow = "hidden";
      fetchParentOptions();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDoc]);

  const handleLogout = async () => {
    try {
      addLog("AUTH: Purging session credentials...");
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) { console.error(err); }
  };

  const handleUpdatePayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editContent || !selectedDoc) return;
    try {
      const payload = {
        title: editTitle.toUpperCase(),
        content: editContent,
        slug: editSlug.toLowerCase(),
        parentId: editParentId || null,
        orderIndex: Number(editOrderIndex),
        isPublished: editIsPublished
      };
      const res = await fetch(`${API_BASE_URL}/docs/${selectedDoc.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update doc");
      const data = await res.json();
      const updatedItem = { ...data.doc, status: "SYNCED" };
      setDocList(prev => prev.map(item => item.id === selectedDoc.id ? updatedItem : item));
      setSelectedDoc(updatedItem);
      setIsEditing(false);
      addLog(`WIRE: Record ${selectedDoc.id.slice(0, 8)} updated successfully`);
    } catch (err) {
      console.error("Update error:", err);
      addLog("WARNING: Payload modification failed (Slug might not be unique)");
    }
  };

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuery.trim()) return;

    setAgentLoading(true);
    try {
      const promptWithContext = `You are updating/revising an existing documentation page. 

Here is the current edit draft:
---
TITLE: ${editTitle || "(empty)"}
SLUG: ${editSlug || "(empty)"}
CONTENT:
${editContent || "(empty)"}
---

User Update Instructions:
"${agentQuery}"

Please modify or rewrite the documentation page according to the user instructions. Make sure to respond with the complete updated schema (title, slug, content, parentId, and orderIndex).`;

      const res = await fetch(`${API_BASE_URL}/agent/draft/doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: promptWithContext }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Agent failed to draft doc");
      const data = await res.json();
      if (data.success) {
        const draft = data.draft;
        setEditTitle(draft.title || "");
        setEditContent(draft.content || "");
        if (draft.slug) {
          setEditSlug(draft.slug);
        }
        if (draft.parentId !== undefined) {
          setEditParentId(draft.parentId);
        }
        if (draft.orderIndex !== undefined) {
          setEditOrderIndex(draft.orderIndex);
        }
        setAgentQuery("");
        addLog("WIRE: AI agent successfully updated edit draft fields");
      } else {
        throw new Error(data.error?.message || "Failed to draft doc");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error generating draft from agent");
    } finally {
      setAgentLoading(false);
    }
  };

  const handleTogglePublish = async (docId: string, currentStatus: boolean) => {
    try {
      addLog(`WIRE: Toggling publish status for record ${docId.slice(0, 8)}`);
      const res = await fetch(`${API_BASE_URL}/docs/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
      const data = await res.json();
      const updatedItem = { ...data.doc, status: "SYNCED" };
      setDocList(prev => prev.map(item => item.id === docId ? updatedItem : item));
      if (selectedDoc?.id === docId) setSelectedDoc(updatedItem);
      addLog(`WIRE: Record ${docId.slice(0, 8)} publish status updated`);
    } catch (err) {
      console.error("Toggle publish error:", err);
      addLog("WARNING: Publish toggle operation failed");
    }
  };

  const handlePurge = async (id: string) => {
    try {
      addLog(`WIRE: Issuing purge command for record ${id.slice(0, 8)}`);
      const res = await fetch(`${API_BASE_URL}/docs/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete doc");
      setDocList((prev) => prev.filter(item => item.id !== id));
      if (selectedDoc?.id === id) setSelectedDoc(null);
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

      <div className="flex-1 grid grid-cols-1 relative z-10 max-w-5xl mx-auto w-full pb-8 items-start">
        <div className="w-full flex flex-col relative">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 rounded">
            <div className="flex justify-between items-center text-[10px] font-mono text-stone-600 uppercase tracking-widest border-b border-stone-300 pb-1.5 mb-2 pl-2">
              <span>SYSTEM DOCUMENTATION</span>
              <span>LATEST DOCS</span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[4px] border-double border-black pb-4 mb-6 pl-2 gap-3">
              <div>
                <h2 className="font-['Playfair_Display',_Georgia,_serif] text-4xl sm:text-5xl font-black drop-shadow-sm text-black tracking-tighter uppercase leading-none select-none text-left">
                  SYSTEM DOCS
                </h2>
                <div className="flex gap-2.5 text-[10px] font-bold text-black border-b border-black mt-2 uppercase tracking-wide">
                  <span>PRINT QUEUE FEED</span>
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
              <div className="bg-[#fcfaf2] border-2 border-stone-950 rounded p-4 sm:p-6 shadow-sm flex flex-col relative">
                <div className="space-y-6 relative z-10 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                  {docList.map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => { 
                        setSelectedDoc(item); 
                        setIsEditing(false); 
                        setEditTitle(item.title); 
                        setEditContent(item.content); 
                        setEditSlug(item.slug); 
                        setEditParentId(item.parentId);
                        setEditOrderIndex(item.orderIndex);
                        setEditIsPublished(item.isPublished); 
                        addLog(`VIEW: Focus shifted to doc ${item.id.slice(0, 8)}`); 
                      }} 
                      className="bg-white border-2 border-stone-950 p-5 hover:bg-stone-50/80 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#111] transition-all flex flex-col gap-2.5 relative group/item shadow cursor-pointer text-left rounded"
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

                      <h4 className="font-['Playfair_Display',_Georgia,_serif] text-2xl font-black tracking-tight text-black leading-snug group-hover/item:text-gray-800 transition-colors uppercase">
                        {item.title}
                      </h4>
                      
                      <p className="font-serif text-sm text-stone-850 leading-relaxed line-clamp-2 max-w-full">
                        {item.content}
                      </p>

                      <div className="flex flex-wrap justify-between items-center mt-2 pt-2.5 border-t border-dashed border-stone-300">
                        <span className="font-mono text-[11px] text-stone-600 font-bold bg-stone-100 border border-stone-300 px-1.5 py-0.5 rounded">
                          slug: /{item.slug}
                        </span>
                        <span className="font-mono text-[10px] text-stone-600 group-hover/item:text-stone-955 border-b border-stone-900 transition-colors font-bold uppercase tracking-wider">
                          [ OPEN DISPATCH ]
                        </span>
                      </div>
                    </div>
                  ))}
                  {docList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-12 h-12 text-stone-400 mb-4"><svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="16" x2="13" y2="16" /></svg></div>
                      <h3 className="font-playfair text-stone-800 text-lg font-black uppercase">Wire Archives Empty</h3>
                      <p className="font-serif text-sm text-stone-600 max-w-sm leading-relaxed mt-2">No documentation files are currently logged on the wire feed.</p>
                    </div>
                  )}
                  {nextCursor && (
                    <div className="text-center pt-2">
                      <button onClick={(e) => { e.stopPropagation(); fetchDocs(nextCursor, searchQuery, true); }} disabled={fetchLoading} className="vintage-stamp text-xs tracking-widest disabled:opacity-50 cursor-pointer bg-white">
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

      {selectedDoc && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full ${isEditing ? 'max-w-5xl' : 'max-w-2xl'} bg-[#fcfaf2] border-4 border-stone-950 p-6 shadow-[8px_8px_0px_#111] flex flex-col relative max-h-[90vh] rounded transition-all duration-300`}>
            <button onClick={() => { setSelectedDoc(null); addLog("INSPECTOR: Dossier closed"); }} className="absolute top-3 right-4 font-mono font-bold text-stone-950 border-2 border-stone-950 px-2 py-0.5 hover:bg-stone-950 hover:text-white transition-colors cursor-pointer text-xs">[ CLOSE ]</button>
            <div className="flex-1 overflow-y-auto custom-paper-scrollbar mt-6 pr-6 text-stone-900">
              {isEditing ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                  <form onSubmit={handleUpdatePayload} className="lg:col-span-2 flex flex-col gap-4 font-serif text-stone-900 text-left">
                    <div className="flex flex-col border-b border-stone-400 pb-2">
                      <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">TRANSMISSION HEADLINE</label>
                      <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold text-lg text-stone-955 placeholder-stone-600/40 font-serif font-black" />
                    </div>
                    <div className="flex flex-col border-b border-stone-400 pb-2">
                      <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">UNIQUE SLUG</label>
                      <input type="text" required value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/40 font-mono" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 border-b border-stone-400 pb-3">
                      <div className="flex flex-col">
                        <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">PARENT CATEGORY</label>
                        <select 
                          value={editParentId || ""} 
                          onChange={(e) => setEditParentId(e.target.value || null)} 
                          className="bg-transparent border-2 border-stone-450 p-1 font-mono text-xs outline-none"
                        >
                          <option value="">[ NONE - TOP LEVEL ]</option>
                          {parentOptions
                            .filter(opt => opt.id !== selectedDoc.id) // Prevent self-referencing loops
                            .map(opt => (
                              <option key={opt.id} value={opt.id}>{opt.title}</option>
                            ))
                          }
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">ORDER INDEX</label>
                        <input 
                          type="number" 
                          min="0"
                          value={editOrderIndex} 
                          onChange={(e) => setEditOrderIndex(parseInt(e.target.value, 10) || 0)} 
                          className="bg-transparent border-2 border-stone-450 p-1 font-mono text-xs outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col min-h-[140px] border-b border-stone-400 pb-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">DRAFT CHRONICLE DETAILS</label>
                        <button type="button" onClick={() => setShowPreview(!showPreview)} className="font-mono text-[9px] font-bold text-black hover:text-stone-700 uppercase border border-black px-2 py-0.5 rounded cursor-pointer transition-colors">
                          {showPreview ? "Edit Mode" : "Preview"}
                        </button>
                      </div>
                      {showPreview ? (
                        <div className="w-full bg-transparent border-none outline-none text-sm text-stone-950 min-h-[140px] leading-relaxed prose prose-stone max-w-none overflow-y-auto" dangerouslySetInnerHTML={{ __html: marked.parse(editContent || "*No content*") as string }} />
                      ) : (
                        <textarea required value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm text-stone-950 placeholder-stone-600/40 resize-none flex-1 leading-relaxed custom-paper-scrollbar" rows={8} />
                      )}
                    </div>
                    <div className="flex items-center justify-between border-b border-stone-400 pb-3 mt-2">
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">PUBLICATION STATUS</span>
                        <span className="font-serif text-xs text-stone-500">Toggle to publish or unpublish this report.</span>
                      </div>
                      <button type="button" onClick={() => setEditIsPublished(!editIsPublished)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-2 ${editIsPublished ? 'bg-green-700 border-green-800' : 'bg-stone-300 border-stone-400'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsPublished ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <div className="mt-4 flex gap-4">
                      <button type="submit" className="flex-1 bg-stone-950 text-white border-2 border-stone-950 font-mono font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all cursor-pointer">Save Changes</button>
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-stone-300 text-stone-900 border-2 border-stone-305 font-mono font-bold text-xs py-2.5 rounded uppercase tracking-wider transition-all cursor-pointer">Cancel</button>
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
                          <p className="font-serif text-xs text-stone-700 leading-relaxed">Provide instructions or a topic. The Staff Agent will search the web using <strong>Tavily Search</strong>, synthesize details, and return a print-ready doc draft.</p>
                          <div className="flex flex-col border-[2px] border-black p-2 bg-[#fcfaf2]">
                            <label className="font-mono text-[9px] font-bold text-black uppercase tracking-widest mb-1.5">Enter Topic or Wire Request:</label>
                            <textarea required placeholder="e.g. Write a documentation guide about using the Hono framework." value={agentQuery} onChange={(e) => setAgentQuery(e.target.value)} className="w-full bg-transparent outline-none text-xs text-stone-955 placeholder-stone-400 font-serif leading-relaxed h-20 resize-none typewriter-field" disabled={agentLoading} />
                          </div>
                          <button type="submit" className="vintage-stamp w-full text-center py-2 bg-black text-[#fcfaf2] border-black hover:bg-stone-800 hover:text-[#fcfaf2] font-bold cursor-pointer text-xs" disabled={agentLoading || !agentQuery.trim()}>
                            {agentLoading ? "COMMISSIONING TELETYPES..." : "DISPATCH DOC AGENT"}
                          </button>
                          {agentLoading && (
                            <div className="mt-2 p-2 border border-stone-300 bg-[#e8e4d9]/60 text-center font-mono text-[10px] text-stone-700 flex flex-col gap-1">
                              <div className="animate-pulse flex items-center justify-center gap-1">
                                <span className="inline-block w-2 h-2 bg-black rounded-full animate-ping"></span>
                                <span className="text-black font-bold">[ WIRE AGENT AT WORK ]</span>
                              </div>
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
                    <span className="font-mono text-[9px] text-stone-600 font-bold uppercase tracking-widest block mb-1">WIRE REPORT INDEX ID: {selectedDoc.id.slice(0, 8)}</span>
                    <h3 className="font-playfair text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-stone-955">{selectedDoc.title}</h3>
                  </div>
                  <div 
                    className="font-serif text-base leading-relaxed text-justify space-y-4 markdown-content text-stone-900"
                    dangerouslySetInnerHTML={{ __html: marked.parse(selectedDoc.content) as string }}
                  />
                  <div className="mt-6 border-t border-stone-300 pt-3 text-left">
                    <span className="font-mono text-[9px] text-stone-500 font-bold uppercase block mb-1">DOC SLUG</span>
                    <span className="font-mono text-[10px] text-stone-900 font-bold">/{selectedDoc.slug}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-stone-300 pt-4 font-mono text-[10px] text-stone-600 font-bold text-left">
                    <div><span className="block text-[8px] text-stone-500 uppercase tracking-wide">BROADCAST DATE</span><span className="text-stone-950">{new Date(selectedDoc.createdAt).toLocaleString()}</span></div>
                    <div><span className="block text-[8px] text-stone-500 uppercase tracking-wide">STATUS</span><span className={`font-bold ${selectedDoc.isPublished ? "text-green-700" : "text-stone-500"}`}>{selectedDoc.isPublished ? 'PUBLISHED' : 'DRAFT'}</span></div>
                  </div>
                  <div className="mt-8 border-t-4 border-double border-stone-950 pt-4 flex flex-wrap justify-between items-center gap-4">
                    <span className="font-mono text-[9px] text-stone-500 font-bold uppercase">WIRE RECORDS SYSTEM CONTROL</span>
                    <div className="flex gap-3">
                      {(profile?.role === "admin" || profile?.role === "editor") && (
                        <>
                          <button onClick={() => handleTogglePublish(selectedDoc.id, selectedDoc.isPublished)} className="font-mono text-[10px] text-stone-900 border-2 border-stone-900 px-3 py-1 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
                            {selectedDoc.isPublished ? "PULL FROM PRINT" : "APPROVE FOR PRINT"}
                          </button>
                          <button onClick={() => setIsEditing(true)} className="font-mono text-[10px] text-blue-900 border-2 border-blue-900 px-3 py-1 hover:bg-blue-900 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
                            AMEND RECORD
                          </button>
                          <button onClick={() => handlePurge(selectedDoc.id)} className="font-mono text-[10px] text-stone-900 border-b border-stone-900 border-2 border-red-850 px-3 py-1 hover:bg-red-850 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
                            PURGE RECORD
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
