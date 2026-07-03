"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../config";
import { marked } from "marked";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

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
 
 // Similarity Check State
 const [similarNews, setSimilarNews] = useState<any[]>([]);
 const [checkingSimilarity, setCheckingSimilarity] = useState(false);
 const [hasCheckedSimilarity, setHasCheckedSimilarity] = useState(false);
 const [similarityError, setSimilarityError] = useState("");

 const handleCheckSimilarity = async () => {
   if (!content.trim()) return;
   setCheckingSimilarity(true);
   setSimilarityError("");
   setSimilarNews([]);
   setHasCheckedSimilarity(false);
   try {
     const res = await fetch(`${API_BASE_URL}/news/check-similarity`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ content }),
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

 // Injector status
 const [injectionStatus, setInjectionStatus] = useState({ active: false, phase: "", progress: 0 });

 // Clock state
 const [systemTime, setSystemTime] = useState("");

  // Ask Agent State inside form
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
        if (outputArgs.title) setTitle(outputArgs.title);
        if (outputArgs.content) setContent(outputArgs.content);
        if (outputArgs.tags) setTags(outputArgs.tags);
        if (outputArgs.sourceUrl) setSourceUrl(outputArgs.sourceUrl);
        if (outputArgs.priority) {
          const pr = String(outputArgs.priority).toLowerCase();
          if (["low", "medium", "high", "critical"].includes(pr)) {
            setPriority(pr);
          } else {
            setPriority("low");
          }
        }
        setAgentQuery("");
      }
    }
  });

  const agentLoading = status === 'submitted' || status === 'streaming';

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

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuery.trim()) return;

    let finalQuery = agentQuery;
    if (title || content) {
      finalQuery = `You are updating/revising an existing news article draft. 

Here is the current draft:
---
TITLE: ${title || "(empty)"}
CONTENT:
${content || "(empty)"}
TAGS: ${tags || "(empty)"}
PRIORITY: ${priority || "(empty)"}
SOURCE LINK: ${sourceUrl || "(empty)"}
---

User Update Instructions:
"${agentQuery}"

Please modify or rewrite the news article according to the user instructions. Make sure to respond with the complete updated schema (title, content, tags, priority, and sourceUrl).`;
    }

    sendMessage({ content: finalQuery, role: 'user' } as any);
  };

  if (loading) {
  return (
  <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-['Playfair_Display',_Georgia,_serif] text-stone-900 text-2xl animate-pulse font-bold">
  [ RETRIEVING ARCHIVES & EDITORIAL FEED... ]
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
  <Link href="/dashboard" className="font-['UnifrakturMaguntia',_Georgia,_serif] text-6xl sm:text-7xl drop-shadow-sm tracking-tight text-black select-none hover:opacity-80 border-b-4 border-double border-black transition-opacity pb-1 leading-none">
  Dev Bits
  </Link>
  <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-2 uppercase font-bold">
  EDITORIAL DESK • STAFF ID: <span className="text-black">{profile?.email}</span> ({profile?.role?.toUpperCase()})
  </span>
  </div>

 {/* Navigation Deck Links */}
 <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-[#dcd7c9]/50 px-4 py-2 border border-stone-400/50">
 <Link href="/dashboard" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; News Feed</Link>
 <span className="text-stone-400">|</span>
 <Link href="/blogs" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Blogs Feed</Link>
 <span className="text-stone-400">|</span>
 <Link href="/digest" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Digest Wire</Link>
 </div>

  <div className="flex gap-3">
  {isAdmin && (
  <Link 
  href="/settings"
  className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-[#fcfaf2] px-3 py-1.5 hover:bg-black hover:text-[#fcfaf2] transition-all uppercase tracking-widest flex items-center font-bold"
  >
  Oversight Board
  </Link>
  )}
  <button 
  onClick={handleLogout}
  className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-[#fcfaf2] px-3 py-1.5 hover:bg-black hover:text-[#fcfaf2] transition-all uppercase tracking-widest flex items-center font-bold cursor-pointer"
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
  <div className="w-full flex justify-between items-center border-b-[4px] border-double border-black pb-4 mb-6">
  <div>
  <h3 className="font-['Playfair_Display',_Georgia,_serif] text-4xl sm:text-5xl font-black drop-shadow-sm text-black tracking-tighter uppercase leading-none select-none text-left">
  WRITE ARTICLE
  </h3>
  <p className="font-mono text-[10px] text-black font-bold mt-2 tracking-wider uppercase border-b border-black w-max pb-0.5">
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
  <div className="flex justify-between items-center mb-1">
    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">
      ARTICLE CONTENT
    </label>
    <button
      type="button"
      onClick={handleCheckSimilarity}
      disabled={checkingSimilarity || !content.trim()}
      className="font-mono text-[10px] border-2 border-black text-black bg-[#fcfaf2] px-3 py-1 hover:bg-black hover:text-[#fcfaf2] transition-all uppercase tracking-widest font-bold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
    >
      {checkingSimilarity ? "Checking..." : "[ Check Wire Similarity ]"}
    </button>
  </div>
  <textarea
    required
    placeholder="Write news content or dispatch records here..."
    value={content}
    onChange={(e) => {
      setContent(e.target.value);
      setSimilarNews([]);
      setHasCheckedSimilarity(false);
      setSimilarityError("");
    }}
    className="w-full bg-transparent border-none outline-none text-sm text-stone-950 placeholder-stone-600/30 min-h-[180px] leading-relaxed custom-paper-scrollbar"
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
  <div className="bg-[#fcfaf2] border-[3px] border-black p-6 flex flex-col relative z-10 shadow-[4px_4px_0px_#111111] rounded">
  
  {/* Stamp (visual aesthetic) */}
  <div className="absolute top-4 right-4 border-2 border-black text-black border-b border-black font-black text-[9px] px-1.5 -rotate-[10deg] mix-blend-multiply select-none font-['Playfair_Display',_Georgia,_serif] uppercase">
  STAFF AI
  </div>

  <div className="border-b-2 border-black pb-3 mb-5 text-left">
  <h3 className="font-['Playfair_Display',_Georgia,_serif] text-lg text-black uppercase tracking-wide font-black">
  EDITORIAL ASSISTANT
  </h3>
  <p className="font-mono text-[10px] text-stone-600 font-bold mt-1 tracking-wider uppercase">
  AUTOMATED WIRE DESPATCH
  </p>
  </div>

  <div className="flex-1 bg-[#fcfaf2] flex flex-col relative">
  <form onSubmit={handleAskAgent} className="flex flex-col gap-4 font-serif text-stone-900 text-left">
  <p className="font-serif text-xs text-stone-700 leading-relaxed">
  Provide instructions or a topic. The Staff Agent will search the web using <strong>Tavily Search & Extraction</strong>, synthesize the details, and return a print-ready news report draft matching the database schema.
  </p>

  <div className="flex flex-col border-[2px] border-black p-3 bg-[#fcfaf2]">
  <label className="font-mono text-[10px] font-bold text-black uppercase tracking-widest mb-1.5">
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
  className="vintage-stamp w-full text-center py-3 bg-black text-[#fcfaf2] border-black hover:bg-stone-800 hover:text-[#fcfaf2] font-bold cursor-pointer text-xs"
  disabled={agentLoading || !agentQuery.trim()}
  >
  {agentLoading ? "COMMISSIONING TELETYPES..." : "DISPATCH NEWS AGENT"}
  </button>

  {agentLoading && (
  <div className="mt-4 p-4 border border-stone-300 bg-[#e8e4d9]/60 text-center font-mono text-xs text-stone-700 flex flex-col gap-2">
  <div className="animate-pulse flex items-center justify-center gap-1.5">
  <span className="inline-block w-2.5 h-2.5 bg-black rounded-full animate-ping"></span>
  <span className="text-black font-bold">[ NEWS WIRE AGENT AT WORK ]</span>
  </div>
  <p className="text-[10px] text-stone-500 italic">
  Scanning teletypes, mapping wire feeds, and writing copy to print coordinates...
  </p>
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

 {/* Footer HUD */}
 

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










