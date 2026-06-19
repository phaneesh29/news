"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  status: string;
  isPublished: boolean;
}

export default function BlogsDashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [blogList, setBlogList] = useState<BlogItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const [selectedBlog, setSelectedBlog] = useState<BlogItem | null>(null);
  const [systemTime, setSystemTime] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(false);

  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "TELETYPE_INIT: Mounting blog wire...",
    "WIRE: Connection to Metasphere active.",
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const fetchBlogs = async (cursor: string | null = null, query: string = "", isAppend = false) => {
    try {
      setFetchLoading(true);
      let url = "";
      if (query) {
        url = `${API_BASE_URL}/blogs/search?q=${encodeURIComponent(query)}&limit=10`;
        addLog(`WIRE_SEARCH: Querying nodes for '${query}'`);
      } else {
        url = `${API_BASE_URL}/blogs?limit=10${cursor ? `&cursor=${cursor}` : ""}`;
        addLog(cursor ? `WIRE: Loading next block ${cursor.slice(0, 8)}...` : "WIRE: Refreshing printing press feeds...");
      }

      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const data = await res.json();
      
      const items = (data.blogs || []).map((item: any) => ({
        ...item,
        status: "SYNCED"
      }));

      if (isAppend) {
        setBlogList((prev) => [...prev, ...items]);
      } else {
        setBlogList(items);
      }
      
      setNextCursor(query ? null : data.nextCursor || null);
      addLog(`WIRE: Feed updated with ${items.length} print records`);
    } catch (err) {
      console.error("Fetch blogs error:", err);
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

        setClientInfo({ os, browser, ip: "SCANNING..." });

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
      if (profile) fetchBlogs(null, searchQuery, false);
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

  const handleUpdatePayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editContent || !selectedBlog) return;
    try {
      const payload = {
        title: editTitle.toUpperCase(),
        content: editContent,
        slug: editSlug.toLowerCase(),
        isPublished: editIsPublished
      };
      const res = await fetch(`${API_BASE_URL}/blogs/${selectedBlog.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update blog");
      const data = await res.json();
      const updatedItem = { ...data.blog, status: "SYNCED" };
      setBlogList(prev => prev.map(item => item.id === selectedBlog.id ? updatedItem : item));
      setSelectedBlog(updatedItem);
      setIsEditing(false);
      addLog(`WIRE: Record ${selectedBlog.id.slice(0, 8)} updated successfully`);
    } catch (err) {
      console.error("Update error:", err);
      addLog("WARNING: Payload modification failed (Slug might not be unique)");
    }
  };

  const handleTogglePublish = async (blogId: string, currentStatus: boolean) => {
    try {
      addLog(`WIRE: Toggling publish status for record ${blogId.slice(0, 8)}`);
      const res = await fetch(`${API_BASE_URL}/blogs/${blogId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
      const data = await res.json();
      const updatedItem = { ...data.blog, status: "SYNCED" };
      setBlogList(prev => prev.map(item => item.id === blogId ? updatedItem : item));
      if (selectedBlog?.id === blogId) setSelectedBlog(updatedItem);
      addLog(`WIRE: Record ${blogId.slice(0, 8)} publish status updated`);
    } catch (err) {
      console.error("Toggle publish error:", err);
      addLog("WARNING: Publish toggle operation failed");
    }
  };

  const handlePurge = async (id: string) => {
    try {
      addLog(`WIRE: Issuing purge command for record ${id.slice(0, 8)}`);
      const res = await fetch(`${API_BASE_URL}/blogs/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete blog");
      setBlogList((prev) => prev.filter(item => item.id !== id));
      if (selectedBlog?.id === id) setSelectedBlog(null);
      addLog(`WIRE: Record ${id.slice(0, 8)} successfully deleted`);
    } catch (err) {
      console.error("Purge error:", err);
      addLog("WARNING: Purge operation denied");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-playfair text-stone-900 text-2xl animate-pulse">
        [ CALIBRATING TELETYPES & FEEDING WIRE PRINT... ]
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
            <Link href="/dashboard" className="font-blackletter text-4xl sm:text-5xl font-normal drop-shadow-sm tracking-tight text-stone-950 uppercase select-none hover:text-stone-900 border-b border-stone-900 transition-colors">
              THE DAILY <span className="text-stone-900 border-b border-stone-900">NEXUS</span>
            </Link>
            <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-1 uppercase">
              WIRE SERVICE • OPERATIVE: <span className="font-bold text-stone-900">{profile?.email}</span> ({profile?.role?.toUpperCase()})
            </span>
          </div>

          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-stone-200/50 px-4 py-2 border border-stone-400/50 rounded">
            <Link href="/dashboard" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; News Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/blogs" className="text-stone-900 border-b border-stone-900 hover:text-red-900 transition-colors font-black border-b-2 border-red-850 pb-0.5">&gt; Blogs Feed</Link>
            {canAdd && (
              <>
                <span className="text-stone-400">|</span>
                <Link href="/blogs/add" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Injector</Link>
              </>
            )}
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <Link href="/settings" className="font-mono text-[10px] sm:text-xs border-2 border-stone-900 text-stone-900 bg-white px-3 py-1.5 hover:bg-stone-950 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5">
                Security Deck
              </Link>
            )}
            <button onClick={handleLogout} className="font-mono text-[10px] sm:text-xs border-2 border-red-950 text-red-900 bg-white px-3 py-1.5 hover:bg-red-950 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
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

      <div className="flex-1 grid grid-cols-1 flex flex-col relative z-10 max-w-5xl mx-auto w-full pb-8 items-start">
        <div className="w-full flex flex-col relative">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 rounded">
            <div className="flex justify-between items-center text-[10px] font-mono text-stone-600 uppercase tracking-widest border-b border-stone-300 pb-1.5 mb-2 pl-2">
              <span>DAILY WIRE LOGS</span>
              <span>LATEST BLOGS</span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-stone-950 pb-3 mb-4 pl-2 gap-3">
              <div>
                <h2 className="font-blackletter text-4xl sm:text-5xl font-normal drop-shadow-sm text-stone-950 tracking-tighter uppercase leading-none select-none text-left">
                  BLOG <span className="text-stone-900 border-b border-stone-900">POSTS</span>
                </h2>
                <div className="flex gap-2.5 text-[10px] font-mono font-bold text-stone-900 border-b border-stone-900 mt-2 uppercase tracking-wide">
                  <span>PRINT QUEUE FEED</span>
                  <span className="text-stone-400">•</span>
                  <span>SYNCED NODES</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                {canAdd && (
                  <Link href="/blogs/add" className="vintage-stamp text-center py-2 px-3.5 text-[10px] flex items-center justify-center font-bold tracking-wider">
                    WRITE BLOG
                  </Link>
                )}
                <div className="relative w-full sm:w-52">
                  <input type="text" placeholder="Search blog reports..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#f5f2e9] text-stone-900 text-xs pl-3 pr-8 py-2 font-mono outline-none border-2 border-stone-950 focus:border-red-800 rounded shadow-sm" />
                  <svg className="w-3.5 h-3.5 text-stone-700 absolute right-2.5 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6 pl-2">
              <div className="bg-[#fcfaf2] border-2 border-stone-950 rounded p-4 sm:p-6 shadow-sm flex flex-col relative">
                <div className="space-y-6 relative z-10 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                  {blogList.map((item) => (
                    <div key={item.id} onClick={() => { setSelectedBlog(item); setIsEditing(false); setEditTitle(item.title); setEditContent(item.content); setEditSlug(item.slug); setEditIsPublished(item.isPublished); addLog(`VIEW: Focus shifted to blog ${item.id.slice(0, 8)}`); }} className="bg-white border-2 border-stone-950 p-5 hover:bg-stone-50 transition-all flex flex-col gap-2 relative group/item shadow cursor-pointer text-left rounded">
                      <div className="flex flex-wrap gap-2.5 items-center">
                        <span className="font-mono text-[10px] text-stone-600">{new Date(item.createdAt).toLocaleString()}</span>
                        <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded tracking-wide uppercase font-bold ${item.isPublished ? "border-green-600 text-green-700 bg-green-50" : "border-stone-400 text-stone-500 bg-stone-100"}`}>
                          {item.isPublished ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                      <h4 className="font-playfair text-2xl font-black italic tracking-tight text-stone-950 tracking-tight leading-snug group-hover/item:text-stone-950 transition-colors uppercase">{item.title}</h4>
                      <p className="font-mono text-xs text-stone-500">/{item.slug}</p>
                      <p className="font-serif text-sm text-stone-850 leading-relaxed truncate max-w-full">{item.content}</p>
                    </div>
                  ))}
                  {blogList.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-12 h-12 text-stone-400 mb-4"><svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="16" rx="2" /><line x1="7" y1="8" x2="17" y2="8" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="7" y1="16" x2="13" y2="16" /></svg></div>
                      <h3 className="font-playfair text-stone-800 text-lg font-black uppercase">Wire Archives Empty</h3>
                      <p className="font-serif text-sm text-stone-600 max-w-sm leading-relaxed mt-2">No blogs are currently logged on the wire feed.</p>
                    </div>
                  )}
                  {nextCursor && (
                    <div className="text-center pt-2">
                      <button onClick={(e) => { e.stopPropagation(); fetchBlogs(nextCursor, searchQuery, true); }} disabled={fetchLoading} className="vintage-stamp text-xs tracking-widest disabled:opacity-50 cursor-pointer bg-white">
                        {fetchLoading ? "[ RE-READING WIRE... ]" : "LOAD NEXT DISPATCHES"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:col-span-1 flex-col gap-6 relative w-full lg:sticky lg:top-8 text-left z-10">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 flex flex-col relative z-10 scanline overflow-hidden shadow-sm">
            <div className="coffee-stain -top-6 -right-6 opacity-25"></div>
            <div className="border-b-2 border-stone-950 pb-3 mb-5">
              <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-800 animate-pulse"></span>
                SYS.TELEMETRY
              </h3>
              <p className="font-mono text-[9px] text-stone-500 font-bold mt-1 tracking-wider uppercase">OPERATIVE DATA SCAN</p>
            </div>
            <div className="flex flex-col gap-3.5 text-xs text-stone-855 font-mono">
              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5"><span className="text-stone-500 font-bold">NODE STATUS</span><span className={`font-bold uppercase tracking-wider text-[10px] ${serverHealth?.status === "ok" ? "text-green-800" : "text-red-700 animate-pulse"}`}>{serverHealth ? serverHealth.status.toUpperCase() : "SCANNING..."}</span></div>
              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5"><span className="text-stone-500 font-bold">OPERATIVE OS</span><span className="text-stone-900 font-bold">{clientInfo?.os || "DETERMINING..."}</span></div>
              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5"><span className="text-stone-500 font-bold">CLIENT BROWSER</span><span className="text-stone-800 truncate max-w-[130px] font-bold">{clientInfo?.browser || "EXTRACTING..."}</span></div>
              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5"><span className="text-stone-500 font-bold">IP ADDR COORDINATES</span><span className="text-red-900 font-bold tracking-wider">{clientInfo?.ip || "SCANNING..."}</span></div>
              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5"><span className="text-stone-500 font-bold">CLEARANCE KEY</span><span className="text-stone-900 uppercase font-bold">{profile?.role || "OPERATIVE"}</span></div>
            </div>
          </div>
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 flex flex-col relative z-10 flex-1 min-h-[350px]">
            <div className="border-b-2 border-stone-950 pb-3 mb-5">
              <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black">TELETYPE STREAM</h3>
              <p className="font-mono text-[9px] text-stone-500 font-bold mt-1 tracking-wider uppercase">LIVE SYSTEM EXECUTIONS</p>
            </div>
            <div className="flex-1 green-terminal scanline relative overflow-hidden p-4 font-mono text-[11px] leading-relaxed flex flex-col vintage-shadow-sm min-h-[250px] max-h-[350px]">
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
                {terminalLogs.map((log, index) => <div key={index} className="opacity-90 hover:opacity-100 transition-opacity">&gt;&gt; {log}</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedBlog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#fcfaf2] border-4 border-stone-950 p-6 shadow-[8px_8px_0px_#111] flex flex-col relative max-h-[90vh] rounded">
            <button onClick={() => { setSelectedBlog(null); addLog("INSPECTOR: Dossier closed"); }} className="absolute top-3 right-4 font-mono font-bold text-stone-950 border-2 border-stone-950 px-2 py-0.5 hover:bg-stone-950 hover:text-white transition-colors cursor-pointer text-xs">[ CLOSE ]</button>
            <div className="flex-1 overflow-y-auto custom-paper-scrollbar mt-6 pr-1 text-stone-900">
              {isEditing ? (
                <form onSubmit={handleUpdatePayload} className="flex flex-col gap-4 font-serif text-stone-900 text-left">
                  <div className="flex flex-col border-b border-stone-400 pb-2">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">TRANSMISSION HEADLINE</label>
                    <input type="text" required value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold text-lg text-stone-950 placeholder-stone-600/40 font-serif" />
                  </div>
                  <div className="flex flex-col border-b border-stone-400 pb-2">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">UNIQUE SLUG</label>
                    <input type="text" required value={editSlug} onChange={(e) => setEditSlug(e.target.value)} className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/40 font-mono" />
                  </div>
                  <div className="flex flex-col min-h-[140px] border-b border-stone-400 pb-2">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">DRAFT CHRONICLE DETAILS</label>
                    <textarea required value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm text-stone-950 placeholder-stone-600/40 resize-none flex-1 leading-relaxed custom-paper-scrollbar" rows={8} />
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
              ) : (
                <>
                  <div className="border-b-4 border-double border-stone-950 pb-3 mb-5 text-center relative">
                    <span className="font-mono text-[9px] text-stone-600 font-bold uppercase tracking-widest block mb-1">WIRE REPORT INDEX ID: {selectedBlog.id.slice(0, 8)}</span>
                    <h3 className="font-playfair text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight text-stone-950">{selectedBlog.title}</h3>
                  </div>
                  <div className="font-serif text-base leading-relaxed text-justify space-y-4">
                    <p className="indent-6 text-stone-900 whitespace-pre-wrap">{selectedBlog.content}</p>
                  </div>
                  <div className="mt-6 border-t border-stone-300 pt-3 text-left">
                    <span className="font-mono text-[9px] text-stone-500 font-bold uppercase block mb-1">BLOG SLUG</span>
                    <span className="font-mono text-[10px] text-stone-900 font-bold">{selectedBlog.slug}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6 border-t border-stone-300 pt-4 font-mono text-[10px] text-stone-600 font-bold text-left">
                    <div><span className="block text-[8px] text-stone-500 uppercase tracking-wide">BROADCAST DATE</span><span className="text-stone-950">{new Date(selectedBlog.createdAt).toLocaleString()}</span></div>
                    <div><span className="block text-[8px] text-stone-500 uppercase tracking-wide">STATUS</span><span className={`font-bold ${selectedBlog.isPublished ? "text-green-700" : "text-stone-500"}`}>{selectedBlog.isPublished ? 'PUBLISHED' : 'DRAFT'}</span></div>
                  </div>
                  <div className="mt-8 border-t-4 border-double border-stone-950 pt-4 flex flex-wrap justify-between items-center gap-4">
                    <span className="font-mono text-[9px] text-stone-500 font-bold uppercase">WIRE RECORDS SYSTEM CONTROL</span>
                    <div className="flex gap-3">
                      {(profile?.role === "admin" || profile?.role === "editor") && (
                        <>
                          <button onClick={() => handleTogglePublish(selectedBlog.id, selectedBlog.isPublished)} className="font-mono text-[10px] text-stone-900 border-2 border-stone-900 px-3 py-1 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
                            {selectedBlog.isPublished ? "PULL FROM PRINT" : "APPROVE FOR PRINT"}
                          </button>
                          <button onClick={() => setIsEditing(true)} className="font-mono text-[10px] text-blue-900 border-2 border-blue-900 px-3 py-1 hover:bg-blue-900 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
                            AMEND RECORD
                          </button>
                          <button onClick={() => handlePurge(selectedBlog.id)} className="font-mono text-[10px] text-stone-900 border-b border-stone-900 border-2 border-red-800 px-3 py-1 hover:bg-red-800 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
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
