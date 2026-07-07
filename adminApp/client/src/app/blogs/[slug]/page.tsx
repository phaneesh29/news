"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../config";
import { marked } from "marked";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  authorEmail?: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editIsPublished, setEditIsPublished] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const [systemTime, setSystemTime] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "DESK_INIT: Opening blog dossier...",
    "WIRE: Remote teletype connection active.",
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 10)]);
  };

  const [agentQuery, setAgentQuery] = useState("");
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_BASE_URL}/agent/draft/blog`
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

  useEffect(() => {
    const fetchProfileAndBlog = async () => {
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

        // Fetch Blog details
        addLog(`WIRE: Fetching blog dossier for slug '${slug}'...`);
        const blogRes = await fetch(`${API_BASE_URL}/blogs/${slug}`, { credentials: "include" });
        if (!blogRes.ok) {
          if (blogRes.status === 404) {
            throw new Error("Blog post not found in archives");
          }
          throw new Error("Failed to load blog dossier");
        }
        const blogData = await blogRes.json();
        setBlog(blogData.blog);
        setEditTitle(blogData.blog.title);
        setEditContent(blogData.blog.content);
        setEditSlug(blogData.blog.slug);
        setEditIsPublished(blogData.blog.isPublished);
        addLog(`WIRE: Loaded record '${blogData.blog.title.slice(0, 20)}...'`);
      } catch (err: any) {
        console.error(err);
        setFetchError(err.message || "Failed to load blog");
        addLog(`ERROR: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProfileAndBlog();
    }
  }, [slug, router]);

  const handleUpdatePayload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editContent || !blog) return;
    try {
      addLog(`WIRE: Dispatched update request for '${blog.slug}'`);
      const payload = {
        title: editTitle.toUpperCase(),
        content: editContent,
        slug: editSlug.toLowerCase(),
        isPublished: editIsPublished
      };
      const res = await fetch(`${API_BASE_URL}/blogs/${blog.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to update blog");
      const data = await res.json();
      setBlog(data.blog);
      setIsEditing(false);
      addLog(`WIRE: Record updated successfully`);
      
      if (payload.slug !== slug) {
        router.push(`/blogs/${payload.slug}`);
      }
    } catch (err) {
      console.error("Update error:", err);
      addLog("WARNING: Payload modification failed (Slug might not be unique)");
    }
  };

  const handleTogglePublish = async () => {
    if (!blog) return;
    try {
      addLog(`WIRE: Toggling publish status for record '${blog.slug}'`);
      const res = await fetch(`${API_BASE_URL}/blogs/${blog.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !blog.isPublished }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to toggle publish status");
      const data = await res.json();
      setBlog(data.blog);
      setEditIsPublished(data.blog.isPublished);
      addLog(`WIRE: Record publish status updated to: ${data.blog.isPublished ? 'PUBLISHED' : 'DRAFT'}`);
    } catch (err) {
      console.error("Toggle publish error:", err);
      addLog("WARNING: Publish toggle operation failed");
    }
  };

  const handlePurge = async () => {
    if (!blog) return;
    if (!confirm("Are you sure you want to purge this record from archives?")) return;
    try {
      addLog(`WIRE: Issuing purge command for record '${blog.slug}'`);
      const res = await fetch(`${API_BASE_URL}/blogs/${blog.slug}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete blog");
      addLog(`WIRE: Record '${blog.slug}' successfully deleted. Redirecting...`);
      setTimeout(() => {
        router.push("/blogs");
      }, 1000);
    } catch (err) {
      console.error("Purge error:", err);
      addLog("WARNING: Purge operation denied");
    }
  };

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuery.trim()) return;

    const promptWithContext = `You are updating/revising an existing blog post. 

Here is the current edit draft:
---
TITLE: ${editTitle || "(empty)"}
SLUG: ${editSlug || "(empty)"}
CONTENT:
${editContent || "(empty)"}
---

User Update Instructions:
"${agentQuery}"

Please modify or rewrite the blog post according to the user instructions. Make sure to respond with the complete updated schema (title, slug, and content).`;

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

  if (fetchError || !blog) {
    return (
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col items-center justify-center font-serif text-stone-900 p-8">
        <h2 className="text-4xl font-black uppercase mb-4 tracking-tighter">DOSSIER CORRUPTED</h2>
        <p className="text-stone-700 font-mono text-sm border-2 border-stone-950 p-4 bg-[#fcfaf2] max-w-md text-center">{fetchError || "Blog dossier could not be opened."}</p>
        <Link href="/blogs" className="mt-8 vintage-stamp py-2 px-6 text-xs font-bold font-mono tracking-widest bg-white">&lt; RETURN TO WIRE INDEX</Link>
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const canManage = profile?.role === "admin" || profile?.role === "editor";

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
            <Link href="/dashboard" className="text-stone-700 hover:text-stone-955 transition-colors">&gt; News Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/blogs" className="text-stone-900 border-b border-stone-900 hover:text-red-900 transition-colors font-black border-b-2 border-red-850 pb-0.5">&gt; Blogs Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/docs" className="text-stone-700 hover:text-stone-955 transition-colors">&gt; Docs Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/digest" className="text-stone-700 hover:text-stone-955 transition-colors">&gt; Digest Wire</Link>
          </div>

          <div className="flex gap-3">
            <Link href="/blogs" className="font-mono text-[10px] sm:text-xs border-2 border-stone-500 text-stone-700 bg-white px-3 py-1.5 hover:bg-stone-100 transition-all uppercase tracking-widest flex items-center font-bold">
              &lt; Back to Feed
            </Link>
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 max-w-7xl mx-auto w-full pb-12 items-start">
        
        {/* Main Content Area */}
        <main className={`lg:col-span-8 bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-10 shadow-[4px_4px_0px_#111] flex flex-col relative rounded transition-all duration-300`}>
          {isEditing ? (
            <form onSubmit={handleUpdatePayload} className="flex flex-col gap-5 text-left">
              <div className="flex justify-between items-center border-b-[4px] border-double border-black pb-3 mb-2">
                <div>
                  <h3 className="font-['Playfair_Display',_Georgia,_serif] text-3xl font-black uppercase text-stone-955">AMEND WIRE DOSSIER</h3>
                  <span className="font-mono text-[9px] text-stone-500 uppercase tracking-widest block mt-1">Editing Draft: {blog.slug}</span>
                </div>
                <button type="button" onClick={() => setIsEditing(false)} className="font-mono text-xs border border-stone-400 px-3 py-1 hover:bg-stone-100 font-bold uppercase transition-colors">
                  Cancel
                </button>
              </div>

              <div className="flex flex-col border-b border-stone-400 pb-2 mt-2">
                <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">TRANSMISSION HEADLINE</label>
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

              <div className="flex flex-col min-h-[300px] border-b border-stone-400 pb-2">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">DRAFT CHRONICLE DETAILS (MARKDOWN)</label>
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
                    dangerouslySetInnerHTML={{ __html: marked.parse(editContent || "*No content*") as string }} 
                  />
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
                  <span className="font-serif text-xs text-stone-500">Toggle to publish or unpublish this report.</span>
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
                      {blog.isPublished ? "PULL FROM PRINT" : "APPROVE FOR PRINT"}
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
                  href="/blogs" 
                  className="font-mono text-[10px] sm:text-xs text-center text-stone-600 border-2 border-dashed border-stone-500 px-3.5 py-2 hover:bg-stone-100 transition-colors uppercase font-bold tracking-wider rounded sm:ml-auto"
                >
                  &lt; Return to Archives
                </Link>
              </div>

              <article className="text-left">
              <div className="border-b-4 border-double border-stone-950 pb-4 mb-6 text-center relative">
                <span className="font-mono text-[9px] text-stone-500 font-bold uppercase tracking-widest block mb-2">
                  DAILY DISPATCH WIRE LOG
                </span>
                
                <h1 className="font-['Playfair_Display',_Georgia,_serif] text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-stone-955">
                  {blog.title}
                </h1>
                
                <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-mono text-stone-600 mt-4 border-t border-stone-300 pt-3">
                  <span>DATE: {new Date(blog.createdAt).toLocaleString()}</span>
                  <span className="text-stone-300">•</span>
                  <span>SLUG: /{blog.slug}</span>
                  <span className="text-stone-300">•</span>
                  <span className={`font-mono text-[9px] border px-1.5 py-0.5 rounded tracking-wide uppercase font-bold ${blog.isPublished ? "border-green-600 text-green-700 bg-green-50" : "border-stone-400 text-stone-500 bg-stone-100"}`}>
                    {blog.isPublished ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                </div>
              </div>

              {/* Styled Newspaper Content */}
              <div 
                className="font-serif text-[17px] leading-relaxed text-justify space-y-6 markdown-content text-stone-900 selection:bg-red-800/10"
                dangerouslySetInnerHTML={{ __html: marked.parse(blog.content) as string }}
              />

              <div className="mt-8 pt-4 border-t border-dashed border-stone-300 flex flex-wrap justify-between items-center text-xs text-stone-500 font-mono">
                <div>
                  <span className="uppercase block font-bold text-[9px] text-stone-400">AUTHOR ARCHIVE ID</span>
                  <span className="text-stone-855 font-bold">{blog.authorEmail || "STAFF WRITER"}</span>
                </div>
                <div>
                  <span className="uppercase block font-bold text-[9px] text-stone-400">LAST SYNC</span>
                  <span>{new Date(blog.updatedAt).toLocaleString()}</span>
                </div>
              </div>
            </article>
            </>
          )}
        </main>

        {/* Sidebar Controls & AI Assistant */}
        <aside className="lg:col-span-4 flex flex-col gap-6 w-full lg:sticky lg:top-8">

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
                    placeholder="e.g. Add a concluding paragraph or check facts..." 
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
