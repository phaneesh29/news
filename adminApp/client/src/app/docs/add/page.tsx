"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../config";
import { marked } from "marked";
import { configureMermaidMarked, useMermaid } from "../../../lib/mermaid";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

configureMermaidMarked();

interface DocItem {
  id: string;
  title: string;
  slug: string;
}

export default function AddDocPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);
  const [orderIndex, setOrderIndex] = useState<number>(0);
  
  const [parentOptions, setParentOptions] = useState<DocItem[]>([]);
  const [injectionStatus, setInjectionStatus] = useState({ active: false, phase: "", progress: 0 });
  const [systemTime, setSystemTime] = useState("");

  const [agentQuery, setAgentQuery] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_BASE_URL}/agent/draft/doc`
    }),
    onFinish: (event) => {
      const message = event.message;
      const toolInvs = message.parts ? message.parts.filter((p: any) => p.type === 'tool-invocation' || p.type === 'dynamic-tool-invocation').map((p: any) => p.toolInvocation) : [];
      let outputArgs = toolInvs.find((t: any) => t.args && (t.args.title !== undefined || t.args.content !== undefined))?.args;

      if (!outputArgs) {
        const textParts = message.parts ? message.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text) : [];
        const fullText = textParts.join('');
        try {
          // Find the first { and last } to extract JSON from potential markdown text
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
        if (outputArgs.slug) setSlug(outputArgs.slug);
        if (outputArgs.parentId !== undefined) setParentId(outputArgs.parentId);
        if (outputArgs.orderIndex !== undefined) setOrderIndex(outputArgs.orderIndex);
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
        if (data.user.role !== "admin" && data.user.role !== "editor") {
          router.push("/docs");
          return;
        }
        
        // Fetch existing docs for parent dropdown selection
        const docsRes = await fetch(`${API_BASE_URL}/docs?limit=150`, { credentials: "include" });
        if (docsRes.ok) {
          const docsData = await docsRes.json();
          setParentOptions(docsData.docs || []);
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

  useMermaid([content, showPreview]);

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
    if (!title || !content || !slug) return;

    setInjectionStatus({ active: true, phase: "PREPARING TELETYPE WIRE...", progress: 10 });

    try {
      const payload = {
        title: title.toUpperCase(),
        content,
        slug: slug.toLowerCase(),
        parentId: parentId || null,
        orderIndex: Number(orderIndex)
      };

      const res = await fetch(`${API_BASE_URL}/docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to create doc. Check slug uniqueness.");
      
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
              router.push("/docs");
            }, 500);
          }
        }, p.delay);
      });
    } catch (err: any) {
      console.error(err);
      setInjectionStatus({ active: true, phase: "PUBLISHING INTERRUPTED! " + err.message, progress: 0 });
      setTimeout(() => {
        setInjectionStatus({ active: false, phase: "", progress: 0 });
      }, 3000);
    }
  };

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuery.trim()) return;

    let finalQuery = agentQuery;
    if (title || content) {
      finalQuery = `You are updating/revising an existing documentation draft. 

Here is the current draft:
---
TITLE: ${title || "(empty)"}
SLUG: ${slug || "(empty)"}
CONTENT:
${content || "(empty)"}
---

User Update Instructions:
"${agentQuery}"

Please modify or rewrite the documentation page according to the user instructions. Make sure to respond with the complete updated schema (title, slug, content, parentId, and orderIndex).`;
    }

    sendMessage({ content: finalQuery, role: 'user' } as any);
    setAgentQuery("");
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
    <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-red-800/10 selection:text-stone-955 text-stone-900 font-serif">
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
          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-[#dcd7c9]/50 px-4 py-2 border border-stone-400/50">
            <Link href="/dashboard" className="text-stone-700 hover:text-stone-955 transition-colors">&gt; News Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/blogs" className="text-stone-700 hover:text-stone-955 transition-colors">&gt; Blogs Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/docs" className="text-stone-750 hover:text-stone-955 transition-colors">&gt; Docs Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/digest" className="text-stone-750 hover:text-stone-955 transition-colors">&gt; Digest Wire</Link>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link href="/settings" className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-[#fcfaf2] px-3 py-1.5 hover:bg-black hover:text-[#fcfaf2] transition-all uppercase tracking-widest flex items-center font-bold">
                Oversight Board
              </Link>
            )}
            <button onClick={handleLogout} className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-[#fcfaf2] px-3 py-1.5 hover:bg-black hover:text-[#fcfaf2] transition-all uppercase tracking-widest flex items-center font-bold cursor-pointer">
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 max-w-6xl mx-auto w-full pb-8 items-start">
        <div className="w-full flex flex-col relative lg:col-span-2">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 flex flex-col relative z-10 vintage-shadow-lg rounded">
            <div className="w-full flex justify-between items-center border-b-[4px] border-double border-black pb-4 mb-6">
              <div>
                <h3 className="font-['Playfair_Display',_Georgia,_serif] text-4xl sm:text-5xl font-black drop-shadow-sm text-black tracking-tighter uppercase leading-none select-none text-left">CREATE DOC</h3>
                <p className="font-mono text-[10px] text-black font-bold mt-2 tracking-wider uppercase border-b border-black w-max pb-0.5">Teletype Draft Protocol</p>
              </div>
            </div>
            <div className="flex-1 bg-[#fcfaf2] border border-stone-300 flex flex-col p-6 sm:p-8 relative">
              <form onSubmit={handleInjectPayload} className="flex flex-col gap-6 pt-3 relative z-10 text-stone-900 font-serif text-left">
                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">TRANSMISSION HEADLINE</label>
                  <input type="text" required placeholder="e.g. SYSTEM INSTALLATION GUIDE..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold text-base text-stone-955 placeholder-stone-600/30 font-serif" />
                </div>
                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">UNIQUE SLUG</label>
                    <button
                      type="button"
                      onClick={() => {
                        const generated = title
                          .trim()
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "");
                        setSlug(generated);
                      }}
                      className="font-mono text-[9px] font-bold text-black hover:text-stone-700 uppercase border border-black px-2 py-0.5 rounded cursor-pointer transition-colors"
                      disabled={!title.trim()}
                    >
                      Generate from Title
                    </button>
                  </div>
                  <input type="text" required placeholder="url-friendly-slug-here" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/30 font-mono" />
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-stone-450 pb-3">
                  <div className="flex flex-col">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">PARENT CATEGORY</label>
                    <select 
                      value={parentId || ""} 
                      onChange={(e) => setParentId(e.target.value || null)} 
                      className="bg-transparent border-2 border-stone-400 p-1 font-mono text-xs outline-none"
                    >
                      <option value="">[ NONE - TOP LEVEL ]</option>
                      {parentOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">ORDER INDEX</label>
                    <input 
                      type="number" 
                      min="0"
                      value={orderIndex} 
                      onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 0)} 
                      className="bg-transparent border-2 border-stone-400 p-1 font-mono text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col min-h-[300px]">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">CHRONICLE DETAILS (Markdown)</label>
                    <button type="button" onClick={() => setShowPreview(!showPreview)} className="font-mono text-[9px] font-bold text-black hover:text-stone-700 uppercase border border-black px-2 py-0.5 rounded cursor-pointer transition-colors">
                      {showPreview ? "Edit Mode" : "Preview"}
                    </button>
                  </div>
                  {showPreview ? (
                    <div className="w-full bg-transparent border-2 border-stone-400 p-3 outline-none text-sm text-stone-950 flex-1 leading-relaxed prose prose-stone max-w-none overflow-y-auto" dangerouslySetInnerHTML={{ __html: marked.parse(content || "*No content*") as string }} />
                  ) : (
                    <textarea required placeholder="Write documentation here. Supporting full markdown styling..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-transparent border-2 border-stone-400 p-3 outline-none text-sm text-stone-950 placeholder-stone-605/30 resize-none flex-1 leading-relaxed custom-paper-scrollbar font-serif" rows={15} />
                  )}
                </div>
                <div className="mt-4">
                  <button type="submit" className="w-full bg-stone-950 text-[#fcfaf2] border-2 border-stone-950 font-mono font-bold text-sm py-3 hover:bg-transparent hover:text-black transition-all cursor-pointer uppercase tracking-widest rounded shadow-md">
                    INJECT INTO DOC WIRE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col relative sticky top-6">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 flex flex-col relative z-10 shadow-[6px_6px_0px_#111111] rounded">
            <div className="absolute top-4 right-4 border-2 border-black text-black border-b border-black font-black text-[9px] px-1.5 -rotate-[10deg] mix-blend-multiply select-none font-['Playfair_Display',_Georgia,_serif] uppercase">
              STAFF AI
            </div>
            <div className="border-b-2 border-black pb-3 mb-4 text-left">
              <h3 className="font-['Playfair_Display',_Georgia,_serif] text-base text-black uppercase tracking-wide font-black">EDITORIAL ASSISTANT</h3>
              <p className="font-mono text-[9px] text-stone-600 font-bold mt-1 tracking-wider uppercase">AUTOMATED WIRE DESPATCH</p>
            </div>
            <div className="flex-1 bg-[#fcfaf2] flex flex-col relative">
              <form onSubmit={handleAskAgent} className="flex flex-col gap-4 font-serif text-stone-900 text-left">
                <p className="font-serif text-xs text-stone-700 leading-relaxed">Provide instructions or a topic. The Staff Agent will search the web using <strong>Tavily Search</strong>, gather technical data, and draft the documentation block for you.</p>
                <div className="flex flex-col border-[2px] border-black p-2 bg-[#fcfaf2]">
                  <label className="font-mono text-[9px] font-bold text-black uppercase tracking-widest mb-1.5">Enter Topic or Wire Request:</label>
                  <textarea required placeholder="e.g. Draft an API documentation guide for Hono routing structures." value={agentQuery} onChange={(e) => setAgentQuery(e.target.value)} className="w-full bg-transparent outline-none text-xs text-stone-955 placeholder-stone-400 font-serif leading-relaxed h-24 resize-none typewriter-field" disabled={agentLoading} />
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
                                <br />
                                {t.toolName === 'tavilySearch' && t.args?.query && (
                                  <span className="text-stone-600">Searching for: "{t.args.query}"</span>
                                )}
                                {t.toolName === 'tavilyExtract' && t.args?.url && (
                                  <span className="text-stone-600">Extracting URL: {t.args.url}</span>
                                )}
                                {t.state === 'result' && (
                                  <div className="text-stone-500 italic mt-0.5">...tool finished.</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )})}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {injectionStatus.active && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#fcfaf2] border-4 border-stone-950 p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0px_#111] text-center rounded">
            <h3 className="font-['Playfair_Display',_Georgia,_serif] text-xl font-black uppercase text-stone-950 mb-4 tracking-tighter">BROADCAST TRANSMISSION STATUS</h3>
            <div className="w-full bg-stone-300 h-6 border-2 border-stone-950 mb-4 p-0.5 rounded overflow-hidden">
              <div className="bg-red-800 h-full transition-all duration-300" style={{ width: `${injectionStatus.progress}%` }}></div>
            </div>
            <p className="font-mono text-xs font-bold text-stone-850 animate-pulse">{injectionStatus.phase}</p>
          </div>
        </div>
      )}
    </div>
  );
}
