"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../config";
import Header from "../../../components/Header";
import MarkdownRenderer from "../../../components/MarkdownRenderer";
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
  updatedAt: string;
  isPublished: boolean;
  authorEmail?: string;
}

export default function DocDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState<DocItem | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editParentId, setEditParentId] = useState<string | null>(null);
  const [editOrderIndex, setEditOrderIndex] = useState<number>(0);
  const [editIsPublished, setEditIsPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [parentOptions, setParentOptions] = useState<DocItem[]>([]);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleParent = (id: string) => {
    setExpandedParents(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [systemTime, setSystemTime] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "DESK_INIT: Opening documentation dossier...",
    "WIRE: Remote teletype connection active.",
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 10)]);
  };

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
        if (outputArgs.slug) setEditSlug(outputArgs.slug);
        if (outputArgs.parentId !== undefined) setEditParentId(outputArgs.parentId);
        if (outputArgs.orderIndex !== undefined) setEditOrderIndex(outputArgs.orderIndex);
        setAgentQuery("");
        addLog("WIRE: AI agent successfully updated edit draft fields");
      }
    }
  });

  const agentLoading = status === 'submitted' || status === 'streaming';

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
    const fetchProfileAndDoc = async () => {
      try {
        // Fetch User Profile
        const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, { credentials: "include" });
        if (!profileRes.ok) {
          router.push("/login");
          return;
        }
        const profileData = await profileRes.json();
        setProfile(profileData.user);
        addLog(`AUTH: Logged in as '${profileData.user.email}'`);

        // Fetch Doc details
        addLog(`WIRE: Fetching doc dossier for slug '${slug}'...`);
        const docRes = await fetch(`${API_BASE_URL}/docs/${slug}`, { credentials: "include" });
        if (!docRes.ok) {
          if (docRes.status === 404) {
            throw new Error("Documentation page not found in archives");
          }
          throw new Error("Failed to load doc dossier");
        }
        const docData = await docRes.json();
        setDoc(docData.doc);
        setEditTitle(docData.doc.title);
        setEditContent(docData.doc.content);
        setEditSlug(docData.doc.slug);
        setEditParentId(docData.doc.parentId);
        setEditOrderIndex(docData.doc.orderIndex);
        setEditIsPublished(docData.doc.isPublished);
        addLog(`WIRE: Loaded record '${docData.doc.title.slice(0, 20)}...'`);
        
        if (docData.doc.parentId) {
          setExpandedParents(prev => ({ ...prev, [docData.doc.parentId]: true }));
        } else {
          setExpandedParents(prev => ({ ...prev, [docData.doc.id]: true }));
        }
        
        fetchParentOptions();
      } catch (err: any) {
        console.error(err);
        setFetchError(err.message || "Failed to load documentation");
        addLog(`ERROR: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfileAndDoc();
    }
  }, [slug, router]);

  const handleUpdatePayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editContent || !doc) return;
    try {
      addLog(`WIRE: Dispatched update request for '${doc.slug}'`);
      const payload = {
        title: editTitle.toUpperCase(),
        content: editContent,
        slug: editSlug.toLowerCase(),
        parentId: editParentId || null,
        orderIndex: Number(editOrderIndex),
        isPublished: editIsPublished
      };
      const res = await fetch(`${API_BASE_URL}/docs/${doc.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update doc");
      const data = await res.json();
      setDoc(data.doc);
      setIsEditing(false);
      addLog(`WIRE: Record updated successfully`);
      
      if (payload.slug !== slug) {
        router.push(`/docs/${payload.slug}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      addLog("WARNING: Payload modification failed (Slug might not be unique)");
    }
  };

  const handleTogglePublish = async () => {
    if (!doc) return;
    try {
      addLog(`WIRE: Toggling publish status for record '${doc.slug}'`);
      const res = await fetch(`${API_BASE_URL}/docs/${doc.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !doc.isPublished }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
      const data = await res.json();
      setDoc(data.doc);
      setEditIsPublished(data.doc.isPublished);
      addLog(`WIRE: Record publish status updated to: ${data.doc.isPublished ? 'PUBLISHED' : 'DRAFT'}`);
    } catch (err) {
      console.error("Toggle publish error:", err);
      addLog("WARNING: Publish toggle operation failed");
    }
  };

  const handlePurge = async () => {
    if (!doc) return;
    if (!confirm("Are you sure you want to purge this record from archives?")) return;
    try {
      addLog(`WIRE: Issuing purge command for record '${doc.slug}'`);
      const res = await fetch(`${API_BASE_URL}/docs/${doc.slug}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete doc");
      addLog(`WIRE: Record '${doc.slug}' successfully deleted. Redirecting...`);
      setTimeout(() => {
        router.push("/docs");
      }, 1000);
    } catch (err) {
      console.error("Purge error:", err);
      addLog("WARNING: Purge operation denied");
    }
  };

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuery.trim()) return;

    let crossLinkContext = '';
    if (parentOptions.length > 0) {
      crossLinkContext = `\n\nHere are the existing documentation titles, IDs, and slugs in the system. Use this list to determine if the document should have a parent, to cross-link pages, or to select an orderIndex:\n` +
        parentOptions.map(p => `- "${p.title}" (ID: ${p.id}, slug: /docs/${p.slug})`).join('\n') +
        `\n\nIf this document belongs under one of the existing pages as a child, set the 'parentId' field to that page's ID. Otherwise set it to null.`;
    }

    const promptWithContext = `You are updating/revising an existing documentation post. 

Here is the current edit draft:
---
TITLE: ${editTitle || "(empty)"}
SLUG: ${editSlug || "(empty)"}
PARENT ID: ${editParentId || "(null)"}
ORDER INDEX: ${editOrderIndex || 0}
CONTENT:
${editContent || "(empty)"}
---

User Update Instructions:
"${agentQuery}"
${crossLinkContext}

Please modify or rewrite the documentation post according to the user instructions. Make sure to respond with the complete updated schema (title, slug, content, parentId, orderIndex).`;

    sendMessage({ content: promptWithContext, role: 'user' } as any);
  };

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

  if (fetchError || !doc) {
    return (
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col items-center justify-center font-serif text-stone-900 p-8">
        <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">DOSSIER CORRUPTED</h2>
        <p className="text-stone-700 font-mono text-sm border-2 border-stone-950 p-4 bg-[#fcfaf2] max-w-md text-center">{fetchError || "Doc dossier could not be opened."}</p>
        <Link href="/docs" className="mt-8 vintage-stamp py-2 px-6 text-xs font-bold font-mono tracking-widest bg-white">&lt; RETURN TO WIRE INDEX</Link>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const canManage = profile?.role === "admin" || profile?.role === "editor";
  const selectedParent = parentOptions.find(p => p.id === doc.parentId);

  return (
    <div className="min-h-screen w-full bg-[#f5f2e9] flex flex-col relative selection:bg-red-800/10 selection:text-stone-955 text-stone-900 font-serif">
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>

      <Header profile={profile} systemTime={systemTime} activeTab="docs" />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 max-w-6xl mx-auto w-full pb-12 items-start px-4 sm:px-6 md:px-8 pt-6">
        
        {/* Main Content Area */}
        <main className={`lg:col-span-8 bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-10 shadow-[4px_4px_0px_#111] flex flex-col relative rounded transition-all duration-300`}>
          {isEditing ? (
            <form onSubmit={handleUpdatePayload} className="flex flex-col gap-5 text-left">
              <div className="flex justify-between items-center border-b-[4px] border-double border-black pb-3 mb-2">
                <div>
                  <h3 className="font-['Playfair_Display',_Georgia,_serif] text-3xl font-black uppercase text-stone-955">AMEND DOC DOSSIER</h3>
                  <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block mt-1">Editing Draft: {doc.slug}</span>
                </div>
                <button type="button" onClick={() => setIsEditing(false)} className="font-mono text-xs border border-stone-400 px-3 py-1 hover:bg-stone-100 font-bold uppercase transition-colors">
                  Cancel
                </button>
              </div>

              <div className="flex flex-col border-b border-stone-400 pb-2 mt-2">
                <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">DOCUMENT HEADLINE</label>
                <input 
                  type="text" 
                  required 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  className="w-full bg-transparent border-none outline-none font-bold text-xl text-stone-955 placeholder-stone-600/40 font-serif" 
                />
              </div>

              <div className="flex flex-col border-b border-stone-400 pb-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">UNIQUE SLUG</label>
                  <button
                    type="button"
                    onClick={() => {
                      const generated = editTitle
                        .trim()
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "");
                      setEditSlug(generated);
                    }}
                    className="font-mono text-[9px] font-bold text-black hover:text-stone-700 uppercase border border-black px-2 py-0.5 rounded cursor-pointer transition-colors"
                    disabled={!editTitle.trim()}
                  >
                    Generate from Title
                  </button>
                </div>
                <input 
                  type="text" 
                  required 
                  value={editSlug} 
                  onChange={(e) => setEditSlug(e.target.value)} 
                  className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/40 font-mono" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-stone-400 pb-3">
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">PARENT CHRONICLE</label>
                  <select 
                    value={editParentId || ""} 
                    onChange={(e) => setEditParentId(e.target.value || null)} 
                    className="w-full bg-[#f5f2e9] border border-stone-950 p-2 font-mono text-xs outline-none rounded"
                  >
                    <option value="">-- No Parent (Root Level) --</option>
                    {parentOptions
                      .filter(p => p.id !== doc.id)
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">ORDER INDEX</label>
                  <input 
                    type="number" 
                    min={0}
                    value={editOrderIndex} 
                    onChange={(e) => setEditOrderIndex(Number(e.target.value))} 
                    className="w-full bg-[#f5f2e9] border border-stone-950 p-2 font-mono text-xs outline-none rounded"
                  />
                </div>
              </div>

              <div className="flex flex-col min-h-[300px] border-b border-stone-400 pb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">CHRONICLE DETAILS (MARKDOWN)</label>
                  <button 
                    type="button" 
                    onClick={() => setShowPreview(!showPreview)} 
                    className="font-mono text-[9px] font-bold text-black hover:text-stone-700 uppercase border border-black px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    {showPreview ? "Edit Mode" : "Preview"}
                  </button>
                </div>
                {showPreview ? (
                  <div 
                    className="w-full bg-transparent border-none outline-none text-sm text-stone-955 min-h-[300px] leading-relaxed prose prose-stone max-w-none overflow-y-auto custom-paper-scrollbar p-1"
                  >
                    <MarkdownRenderer content={editContent || "*No content*"} />
                  </div>
                ) : (
                  <textarea 
                    required 
                    value={editContent} 
                    onChange={(e) => setEditContent(e.target.value)} 
                    className="w-full bg-transparent border-none outline-none text-sm text-stone-955 placeholder-stone-600/40 resize-none flex-1 leading-relaxed custom-paper-scrollbar" 
                    rows={12} 
                  />
                )}
              </div>

              <div className="flex items-center justify-between border-b border-stone-400 pb-3 mt-1">
                <div className="flex flex-col">
                  <span className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">PUBLICATION STATUS</span>
                  <span className="font-serif text-xs text-stone-500">Toggle to publish or unpublish this documentation.</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setEditIsPublished(!editIsPublished)} 
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-2 ${editIsPublished ? 'bg-green-700 border-green-800' : 'bg-stone-300 border-stone-400'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editIsPublished ? 'translate-x-5' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="mt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-stone-950 text-white border-2 border-stone-950 font-mono font-bold text-xs py-3 rounded uppercase tracking-wider transition-all hover:bg-stone-850 cursor-pointer">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-stone-300 text-stone-900 border-2 border-stone-305 font-mono font-bold text-xs py-3 rounded uppercase tracking-wider transition-all hover:bg-stone-400 cursor-pointer">Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {/* Horizontal Control Board at the top of the main pane */}
              <div className="flex flex-wrap items-center gap-3 border-b-2 border-stone-300 pb-4 mb-6 text-left w-full">
                {canManage && (
                  <>
                    <button 
                      onClick={handleTogglePublish} 
                      className="font-mono text-[10px] sm:text-xs text-stone-900 border-2 border-stone-900 px-3.5 py-2 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider rounded"
                    >
                      {doc.isPublished ? "PULL FROM PRINT" : "APPROVE FOR PRINT"}
                    </button>
                    <button 
                      onClick={() => { setIsEditing(true); addLog("INSPECTOR: Dossier opened in editing mode"); }} 
                      className="font-mono text-[10px] sm:text-xs text-blue-900 border-2 border-blue-900 px-3.5 py-2 hover:bg-blue-900 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider rounded"
                    >
                      AMEND RECORD
                    </button>
                    <button 
                      onClick={handlePurge} 
                      className="font-mono text-[10px] sm:text-xs text-red-800 border-2 border-red-800 px-3.5 py-2 hover:bg-red-800 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider rounded"
                    >
                      PURGE RECORD
                    </button>
                  </>
                )}
                <Link 
                  href="/docs" 
                  className="font-mono text-[10px] sm:text-xs text-center text-stone-600 border-2 border-dashed border-stone-500 px-3.5 py-2 hover:bg-stone-100 transition-colors uppercase font-bold tracking-wider rounded sm:ml-auto"
                >
                  &lt; Return to Archives
                </Link>
              </div>

              <article className="text-left">
              {selectedParent && (
                <div className="mb-4">
                  <Link href={`/docs/${selectedParent.slug}`} className="text-xs font-mono font-bold text-red-900 hover:underline uppercase tracking-wide flex items-center gap-1">
                    &lt; Parent Chronicle: {selectedParent.title}
                  </Link>
                </div>
              )}
              <div className="border-b-4 border-double border-stone-950 pb-4 mb-6 text-center relative">
                <span className="font-mono text-[9px] text-stone-500 font-bold uppercase tracking-widest block mb-2">
                  DOCUMENTATION RECORD
                </span>
                
                <h1 className="font-['Playfair_Display',_Georgia,_serif] text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-stone-955">
                  {doc.title}
                </h1>
                
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-stone-600 mt-4 border-t border-stone-300 pt-3">
                  <span>DATE: {new Date(doc.createdAt).toLocaleString()}</span>
                  <span className="text-stone-300">•</span>
                  <span>SLUG: /docs/{doc.slug}</span>
                  {selectedParent && (
                    <>
                      <span className="text-stone-300">•</span>
                      <span>PARENT: {selectedParent.title}</span>
                    </>
                  )}
                  <span className="text-stone-300">•</span>
                  <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded tracking-wide uppercase font-bold ${doc.isPublished ? "border-green-600 text-green-700 bg-green-50" : "border-stone-400 text-stone-500 bg-stone-100"}`}>
                    {doc.isPublished ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
              </div>

              {/* Styled Newspaper Content */}
              <div className="font-serif text-[17px] leading-relaxed text-justify space-y-6 markdown-content text-stone-900 selection:bg-red-800/10">
                <MarkdownRenderer content={doc.content} />
              </div>

              {/* Sub-chronicles listed at the bottom of a parent */}
              {(() => {
                const subChronicles = parentOptions
                  .filter(p => p.parentId === doc.id)
                  .sort((a, b) => a.orderIndex - b.orderIndex);
                
                if (subChronicles.length === 0) return null;

                return (
                  <div className="mt-8 pt-6 border-t-4 border-double border-stone-950 text-left">
                    <h4 className="font-['Playfair_Display',_Georgia,_serif] text-lg font-black uppercase text-stone-955 mb-3">
                      📂 Sub-Chronicles in this dossier
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {subChronicles.map(child => (
                        <Link 
                          key={child.id} 
                          href={`/docs/${child.slug}`} 
                          className="bg-white border-2 border-stone-950 p-4 hover:shadow-[4px_4px_0px_#111] transition-all hover:bg-stone-50/50 flex flex-col gap-1 text-left rounded shadow-sm"
                        >
                          <span className="font-mono text-[9px] text-stone-500">ORDER: {child.orderIndex}</span>
                          <h5 className="font-serif font-black text-xs uppercase text-stone-900 line-clamp-1">{child.title}</h5>
                          <span className="font-mono text-[9px] text-stone-400 mt-1 truncate">/{child.slug}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <div className="mt-8 pt-4 border-t border-dashed border-stone-300 flex flex-wrap justify-between items-center text-xs text-stone-500 font-mono">
                <div>
                  <span className="uppercase block font-bold text-[9px] text-stone-400">AUTHOR ARCHIVE ID</span>
                  <span className="text-stone-855 font-bold">{doc.authorEmail || "STAFF WRITER"}</span>
                </div>
                <div>
                  <span className="uppercase block font-bold text-[9px] text-stone-400">ORDER INDEX</span>
                  <span className="font-bold text-stone-900">{doc.orderIndex}</span>
                </div>
              </div>
            </article>
            </>
          )}
        </main>

        {/* Sidebar Controls & AI Assistant */}
        <aside className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-8">

          {/* Table of Contents / Outline Tree Directory */}
          {(() => {
            const rootParents = parentOptions
              .filter(p => !p.parentId || !parentOptions.some(parent => parent.id === p.parentId))
              .sort((a, b) => a.orderIndex - b.orderIndex);

            const getChildren = (pId: string) => {
              return parentOptions.filter(p => p.parentId === pId).sort((a, b) => a.orderIndex - b.orderIndex);
            };

            return (
              <div className="bg-[#fcfaf2] border-4 border-stone-950 p-6 flex flex-col relative shadow-[4px_4px_0px_#111] rounded text-left">
                <h3 className="font-['Playfair_Display',_Georgia,_serif] text-base text-black uppercase tracking-wide font-black border-b-2 border-black pb-2 mb-4">
                  ARCHIVE OUTLINE DIRECTORY
                </h3>
                
                <div className="flex flex-col gap-1 overflow-y-auto max-h-[40vh] pr-2 custom-paper-scrollbar">
                  {rootParents.map((node) => {
                    const children = getChildren(node.id);
                    const isExpanded = !!expandedParents[node.id];
                    const hasChildren = children.length > 0;
                    const isActive = node.id === doc.id;

                    return (
                      <div key={node.id} className="flex flex-col border-b border-stone-300/30 py-1">
                        <div className={`flex items-center justify-between py-1 px-1.5 rounded transition-colors cursor-pointer group/node ${isActive ? 'bg-stone-200' : 'hover:bg-stone-200/50'}`}>
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
                              className={`text-xs font-mono font-bold truncate ${isActive ? 'text-red-900 font-black' : 'text-stone-850 hover:text-red-905'}`}
                            >
                              {node.title}
                            </Link>
                          </div>
                          {isActive && (
                            <span className="font-mono text-[8px] text-red-850 uppercase font-black tracking-wider">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        
                        {/* Nested Tree Children */}
                        {hasChildren && isExpanded && (
                          <div className="border-l border-stone-400/50 ml-3 pl-2 flex flex-col gap-1.5 mt-1 pb-1">
                            {children.map(child => {
                              const isChildActive = child.id === doc.id;
                              return (
                                <div key={child.id} className={`flex items-center justify-between py-0.5 px-1 rounded transition-colors group/subnode ${isChildActive ? 'bg-stone-200/80' : 'hover:bg-stone-200/50'}`}>
                                  <Link 
                                    href={`/docs/${child.slug}`}
                                    className={`text-[11px] font-mono truncate flex-1 ${isChildActive ? 'text-red-900 font-bold' : 'text-stone-600 hover:text-red-900'}`}
                                  >
                                    📄 {child.title}
                                  </Link>
                                  {isChildActive && (
                                    <span className="font-mono text-[7px] text-red-850 uppercase font-bold select-none">
                                      ACTIVE
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* AI Assistant (Only visible when editing) */}
          {isEditing && (
            <div className="bg-[#fcfaf2] border-4 border-black p-6 flex flex-col relative shadow-[4px_4px_0px_#111] rounded text-left">
              <div className="absolute top-4 right-4 border-2 border-black text-black border-b border-black font-black text-[9px] px-1.5 -rotate-[10deg] mix-blend-multiply select-none font-['Playfair_Display',_Georgia,_serif] uppercase">
                STAFF AI
              </div>
              <div className="border-b-2 border-black pb-3 mb-4">
                <h3 className="font-['Playfair_Display',_Georgia,_serif] text-base text-black uppercase tracking-wide font-black">EDITORIAL ASSISTANT</h3>
                <p className="font-mono text-[9px] text-stone-600 font-bold mt-1 tracking-wider uppercase">AUTOMATED WIRE DESPATCH</p>
              </div>
              
              <form onSubmit={handleAskAgent} className="flex flex-col gap-4 font-serif text-stone-900">
                <p className="font-serif text-xs text-stone-700 leading-relaxed">Provide instructions or revisions. The Staff Agent will update the draft fields directly.</p>
                <div className="flex flex-col border-[2px] border-black p-2 bg-[#fcfaf2]">
                  <label className="font-mono text-[9px] font-bold text-black uppercase tracking-widest mb-1.5">Enter Revisions:</label>
                  <textarea 
                    required 
                    placeholder="e.g. Update parent doc, restructure content, or add notes..." 
                    value={agentQuery} 
                    onChange={(e) => setAgentQuery(e.target.value)} 
                    className="w-full bg-transparent outline-none text-xs text-stone-955 placeholder-stone-400 font-serif leading-relaxed h-20 resize-none typewriter-field" 
                    disabled={agentLoading} 
                  />
                </div>
                <button 
                  type="submit" 
                  className="vintage-stamp w-full text-center py-2.5 bg-black text-[#fcfaf2] border-black hover:bg-stone-805 hover:text-[#fcfaf2] font-bold cursor-pointer text-xs" 
                  disabled={agentLoading || !agentQuery.trim()}
                >
                  {agentLoading ? "COMMISSIONING TELETYPES..." : "DISPATCH AGENT"}
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
          )}

          {/* Teletype Logs */}
          <div className="bg-[#fcfaf2] border-4 border-stone-950 p-6 flex flex-col relative shadow-[4px_4px_0px_#111] rounded text-left">
            <h3 className="font-mono text-[10px] font-bold text-stone-700 uppercase tracking-widest border-b border-stone-300 pb-1.5 mb-3">
              TELETYPE LOG MONITOR
            </h3>
            <div className="font-mono text-[9px] text-stone-700 space-y-1.5 max-h-40 overflow-y-auto custom-paper-scrollbar">
              {terminalLogs.map((log, i) => (
                <div key={i} className="leading-normal truncate">{log}</div>
              ))}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
