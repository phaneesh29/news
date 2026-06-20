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
 const [priority, setPriority] = useState("low");
 const [sourceUrl, setSourceUrl] = useState("");
 
 // Injector status
 const [injectionStatus, setInjectionStatus] = useState({ active: false, phase: "", progress: 0 });

 // Clock state
 const [systemTime, setSystemTime] = useState("");

  // Ask Agent State inside form
  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

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
 router.push("/dashboard");
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

 // Load agent draft from URL/localStorage if requested
 useEffect(() => {
 const params = new URLSearchParams(window.location.search);
 if (params.get("useDraft") === "true") {
 const savedDraft = localStorage.getItem("news_agent_draft");
 if (savedDraft) {
 try {
 const draft = JSON.parse(savedDraft);
 setTitle(draft.title || "");
 setContent(draft.content || "");
 if (draft.tags) {
 setTags(draft.tags.join(", "));
 }
 if (draft.sourceUrl) {
 setSourceUrl(draft.sourceUrl);
 }
 if (draft.priority) {
 setPriority(draft.priority.toLowerCase());
 }
 // Remove draft so it isn't loaded again on refresh
 localStorage.removeItem("news_agent_draft");
 } catch (err) {
 console.error("Failed to parse agent draft:", err);
 }
 }
 }
 }, []);

 // Clock Update effect
 useEffect(() => {
 const updateTime = () => {
 const now = new Date();
 const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
 const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
 setSystemTime(`${dateStr} | ${timeStr}`);
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

 setInjectionStatus({ active: true, phase: "PREPARING TELETYPE WIRE...", progress: 10 });

 try {
 const payload = {
 title: title.toUpperCase(),
 content,
 priority: priority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
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
 { msg: "CALIBRATING LETTERPRESS DIES...", delay: 350, progress: 40 },
 { msg: "STAMPING TYPESET RECORD...", delay: 700, progress: 75 },
 { msg: "RECORD DEPLOYED TO TELEGRAPH STATION...", delay: 1050, progress: 95 },
 { msg: "PUBLISHED SUCCESSFULLY! REDIRECTING TO FEED...", delay: 1400, progress: 100 }
 ];

 phases.forEach((p) => {
 setTimeout(() => {
 setInjectionStatus((prev) => ({ ...prev, phase: p.msg, progress: p.progress }));
 
 if (p.progress === 100) {
 setTimeout(() => {
 setInjectionStatus({ active: false, phase: "", progress: 0 });
 router.push("/dashboard");
 }, 500);
 }
 }, p.delay);
 });
 } catch (err) {
 console.error(err);
 setInjectionStatus({ active: true, phase: "PUBLISHING INTERRUPTED!", progress: 0 });
 setTimeout(() => {
 setInjectionStatus({ active: false, phase: "", progress: 0 });
 }, 1500);
 }
 };

 // Ask AI Agent for draft from within form editor
  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuery.trim()) return;

    setAgentLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/agent/draft/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: agentQuery }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Agent failed to draft");
      const data = await res.json();
      if (data.success) {
        const draft = data.draft;
        setTitle(draft.title || "");
        setContent(draft.content || "");
        if (draft.tags) {
          setTags(draft.tags.join(", "));
        }
        if (draft.sourceUrl) {
          setSourceUrl(draft.sourceUrl);
        }
        if (draft.priority) {
          const pr = draft.priority.toLowerCase();
          if (["low", "medium", "high", "critical"].includes(pr)) {
            setPriority(pr);
          } else {
            setPriority("low");
          }
        }
        setAgentQuery("");
      } else {
        throw new Error(data.error?.message || "Failed to draft news");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error generating draft from agent");
    } finally {
      setAgentLoading(false);
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

 return (
 <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-red-800/10 selection:text-stone-950 text-stone-900 font-serif">
 
 {/* Newspaper texture noise background */}
 
 {/* Header HUD */}
 <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-950 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
 <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
 
 <div className="flex flex-col text-center md:text-left">
 <Link href="/dashboard" className="font-blackletter text-4xl sm:text-5xl font-normal drop-shadow-sm tracking-tight text-stone-950 uppercase select-none hover:text-stone-900 border-b border-stone-900 transition-colors">
 THE DAILY <span className="text-stone-900 border-b border-stone-900">NEXUS</span>
 </Link>
 <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-1 uppercase">
 WIRE SERVICE | OPERATIVE: <span className="font-bold text-stone-900">{profile?.email}</span> ({profile?.role?.toUpperCase()})
 </span>
 </div>

 {/* Navigation Deck Links */}
 <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-[#dcd7c9]/50 px-4 py-2 border border-stone-400/50">
 <Link href="/dashboard" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; News Feed</Link>
 <span className="text-stone-400">|</span>
 <Link href="/blogs" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Blogs Feed</Link>
 
 </div>

 <div className="flex gap-3">
 {isAdmin && (
 <Link 
 href="/settings"
 className="font-mono text-[10px] sm:text-xs border-2 border-stone-900 text-stone-900 bg-[#fcfaf2] px-3 py-1.5 hover:bg-stone-950 hover:text-[#fcfaf2] transition-all uppercase tracking-widest flex items-center gap-1.5"
 >
 Security Deck
 </Link>
 )}
 <button 
 onClick={handleLogout}
 className="font-mono text-[10px] sm:text-xs border-2 border-red-950 text-red-900 bg-[#fcfaf2] px-3 py-1.5 hover:bg-red-950 hover:text-[#fcfaf2] transition-all uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
 >
 Log Out
 </button>
 </div>
 </div>

 {/* Newspaper Subheader bar */}
 <div className="w-full flex justify-between items-center border-t border-stone-850 pt-2 text-[10px] font-mono uppercase text-stone-700 tracking-wider">
 <span>VOL. CXXVI... No. 47190</span>
 <span className="font-bold text-stone-950">{systemTime || "[ RETRIEVING TIME ]"}</span>
 <span>PRICE: 10 CENTS</span>
 </div>
 </header>

  {/* Main Workspace Layout */}
  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto w-full pb-8 items-start">
  
  {/* LEFT PANEL: Newspaper Article Editor Card */}
  <div className="w-full flex flex-col relative lg:col-span-2">
  <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 flex flex-col relative z-10 vintage-shadow-lg rounded">
  
  {/* Header info */}
  <div className="w-full flex justify-between items-center border-b-2 border-stone-950 pb-3 mb-5">
  <div>
  <h3 className="font-playfair text-xl text-stone-950 uppercase tracking-wide font-black">
  WRITE ARTICLE
  </h3>
  <p className="font-mono text-[9px] text-stone-500 font-bold mt-1 tracking-wider uppercase">
  Teletype Draft Protocol
  </p>
  </div>
  </div>

  {/* Visual Typewriter Paper visual wrapper */}
  <div className="flex-1 bg-[#fcfaf2] border border-stone-300 flex flex-col p-6 sm:p-8 relative">
  
  <form onSubmit={handleInjectPayload} className="flex flex-col gap-6 pt-3 relative z-10 text-stone-900 font-serif text-left">
  
  <div className="flex flex-col border-b border-stone-400 pb-2">
  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
  TRANSMISSION HEADLINE
  </label>
  <input
  type="text"
  required
  placeholder="e.g. BREAKING NEWS HEADLINE..."
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  className="w-full bg-transparent border-none outline-none font-bold text-base text-stone-950 placeholder-stone-600/30 font-serif"
  />
  </div>

  <div className="flex flex-col border-b border-stone-400 pb-2">
  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
  SOURCE LINK
  </label>
  <input
  type="url"
  placeholder="https://..."
  value={sourceUrl}
  onChange={(e) => setSourceUrl(e.target.value)}
  className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/30 font-mono"
  />
  </div>

  <div className="flex flex-col flex-1 min-h-[140px] border-b border-stone-400 pb-2">
  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
  ARTICLE CONTENT
  </label>
  <textarea
  required
  placeholder="Write news content or dispatch records here..."
  value={content}
  onChange={(e) => setContent(e.target.value)}
  className="w-full bg-transparent border-none outline-none text-sm text-stone-950 placeholder-stone-600/30 min-h-[180px] leading-relaxed custom-paper-scrollbar"
  />
  </div>

  {/* Priority Selection Bulb Controls */}
  <div className="flex flex-col gap-1.5">
  <span className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">
  ALERT URGENCY
  </span>
  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
  {[
  { key: "low", text: "LOW" },
  { key: "medium", text: "MEDIUM" },
  { key: "high", text: "HIGH" },
  { key: "critical", text: "CRITICAL" },
  ].map((pr) => (
  <button
  key={pr.key}
  type="button"
  onClick={() => setPriority(pr.key)}
  className={`py-1.5 border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 ${priority === pr.key ? "bg-stone-950 text-[#fcfaf2] border-stone-950 font-bold scale-[1.04]" : "bg-[#e8e4d9] text-stone-700 border-stone-300 hover:bg-[#dcd7c9]"} `}
  >
  <span>{pr.text}</span>
  </button>
  ))}
  </div>
  </div>

  <div className="flex flex-col border-b border-stone-400 pb-2">
  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
  ROUTING LABELS (COMMA SEPARATED)
  </label>
  <input
  type="text"
  placeholder="AI, WIRE, BREAKING..."
  value={tags}
  onChange={(e) => setTags(e.target.value)}
  className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/30 font-mono font-bold"
  />
  </div>

  {/* Actions */}
  <div className="flex gap-4 mt-2">
  <Link
  href="/dashboard"
  className="flex-1 bg-stone-300 text-stone-900 border-2 border-stone-300 font-mono font-bold text-xs py-3.5 uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-400"
  >
  Cancel
  </Link>

  <button
  type="submit"
  className="flex-[2] bg-red-800 text-[#fcfaf2] hover:bg-red-900 border-2 border-red-950 font-mono font-bold text-xs py-3.5 uppercase tracking-wider transition-all active:translate-y-0.5 active: flex items-center justify-center gap-2 cursor-pointer"
  >
  Add to Wire (Draft)
  </button>
  </div>

  </form>

  </div>
  </div>
  </div>

  <div className="hidden lg:flex lg:col-span-1 flex-col relative w-full lg:sticky lg:top-8">
  <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 flex flex-col relative z-10 vintage-shadow-lg rounded">
  
  {/* Stamp (visual aesthetic) */}
  <div className="absolute top-4 right-4 border-2 border-red-800 text-stone-900 border-b border-stone-900 font-bold text-[9px] px-1.5 -rotate-[10deg] mix-blend-multiply select-none font-playfair uppercase">
  COGNITIVE DECK
  </div>

  <div className="border-b-2 border-stone-950 pb-3 mb-5 text-left">
  <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black">
  COGNITIVE NEWS WIRE
  </h3>
  <p className="font-mono text-[9px] text-stone-500 font-bold mt-1 tracking-wider uppercase">
  AUTOMATED WIRE DESPATCH
  </p>
  </div>

  <div className="flex-1 bg-[#fcfaf2] border border-stone-300 flex flex-col p-5 relative">
  <form onSubmit={handleAskAgent} className="flex flex-col gap-4 font-serif text-stone-900 text-left">
  <p className="font-serif text-xs text-stone-700 leading-relaxed">
  Provide instructions or a topic. The Nexus Agent will search the web using <strong>Tavily Search & Extraction</strong>, synthesize the details, and return a print-ready news report draft matching the database schema.
  </p>

  <div className="flex flex-col border-2 border-stone-950 p-3 bg-[#fcfaf2]">
  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1.5">
  Enter Topic or Wire Request:
  </label>
  <textarea
  required
  placeholder="e.g. OpenAI releases a new reasoning model named o3. Include its features and pricing."
  value={agentQuery}
  onChange={(e) => setAgentQuery(e.target.value)}
  className="w-full bg-transparent outline-none text-xs text-stone-950 placeholder-stone-400 font-serif leading-relaxed h-24 resize-none typewriter-field"
  disabled={agentLoading}
  />
  </div>

  <button
  type="submit"
  className="vintage-stamp w-full text-center py-3 bg-red-800 text-[#fcfaf2] border-red-950 hover:bg-red-950 hover:text-[#fcfaf2] font-bold cursor-pointer text-xs"
  disabled={agentLoading || !agentQuery.trim()}
  >
  {agentLoading ? "COMMISSIONING TELETYPES..." : "DISPATCH NEWS AGENT"}
  </button>

  {agentLoading && (
  <div className="mt-4 p-4 border border-stone-300 bg-[#e8e4d9]/60 text-center font-mono text-xs text-stone-700 flex flex-col gap-2">
  <div className="animate-pulse flex items-center justify-center gap-1.5">
  <span className="inline-block w-2.5 h-2.5 bg-red-800 rounded-full animate-ping"></span>
  <span>[ NEWS WIRE AGENT AT WORK ]</span>
  </div>
  <p className="text-[10px] text-stone-500 italic">
  Scanning teletypes, mapping wire feeds, and writing copy to print coordinates...
  </p>
  </div>
  )}
  </form>
  </div>
  </div>
  </div>
  </div>

 {/* Footer HUD */}
 <footer className="w-full max-w-[1600px] mx-auto mt-6 pt-3 border-t-2 border-stone-950 flex flex-wrap justify-between items-center gap-4 text-[9px] font-mono text-stone-600 z-10 px-1">
 <div className="flex items-center gap-3">
 <div className="w-6 h-6 border border-stone-950 flex items-center justify-center text-stone-950 font-bold bg-[#fcfaf2]">
 N
 </div>
 <div>
 <span className="text-stone-800 font-bold">THE DAILY NEXUS WIRE</span>
 <span className="mx-2 text-stone-400">|</span>
 <span>Printing Engine: <span className="text-stone-900 border-b border-stone-900 font-bold uppercase">STANDBY</span></span>
 </div>
 </div>

 <div className="flex items-center gap-1.5">
 <span>DECK ENCRYPTION:</span>
 <span className="text-stone-800 font-bold">AES-256 / RSA-4096</span>
 </div>

 <div className="flex items-center gap-1.5">
 <span>SYSTEM TIME:</span>
 <span className="text-stone-850 font-bold">{systemTime || "[ SYSTEM STANDBY ]"}</span>
 </div>
 </footer>

 {/* Teletype Progress Overlay */}
 {injectionStatus.active && (
 <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-6">
 <div className="max-w-md w-full bg-[#fcfaf2] border-4 border-stone-950 p-8 flex flex-col gap-6 relative overflow-hidden">
 <h3 className="font-playfair text-stone-950 font-black text-xl uppercase tracking-widest text-center animate-pulse">
 PUBLISHING TO FEED
 </h3>
 
 <div className="flex flex-col gap-2 font-mono text-xs text-stone-800">
 <div className="flex justify-between">
 <span>STATUS: {injectionStatus.phase}</span>
 <span>{injectionStatus.progress}%</span>
 </div>
 <div className="w-full h-4 bg-[#dcd7c9] border-2 border-stone-950 overflow-hidden p-0.5">
 <div 
 className="h-full bg-stone-950 transition-all duration-300"
 style={{ width: `${injectionStatus.progress}%` }}
 ></div>
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}








