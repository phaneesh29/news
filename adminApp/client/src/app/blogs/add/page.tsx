"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../../config";

export default function AddBlogPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  
  const [injectionStatus, setInjectionStatus] = useState({ active: false, phase: "", progress: 0 });
  const [systemTime, setSystemTime] = useState("");

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
        if (data.user.role !== "admin" && data.user.role !== "editor") {
          router.push("/blogs");
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
    if (!title || !content || !slug) return;

    setInjectionStatus({ active: true, phase: "PREPARING TELETYPE WIRE...", progress: 10 });

    try {
      const payload = {
        title: title.toUpperCase(),
        content,
        slug: slug.toLowerCase()
      };

      const res = await fetch(`${API_BASE_URL}/blogs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to create blog. Check slug uniqueness.");
      
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
              router.push("/blogs");
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

    setAgentLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/agent/draft/blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: agentQuery }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Agent failed to draft blog");
      const data = await res.json();
      if (data.success) {
        const draft = data.draft;
        setTitle(draft.title || "");
        setContent(draft.content || "");
        if (draft.slug) {
          setSlug(draft.slug);
        }
        setAgentQuery("");
      } else {
        throw new Error(data.error?.message || "Failed to draft blog");
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
      <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-950 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          <div className="flex flex-col text-center md:text-left">
            <Link href="/blogs" className="font-blackletter text-4xl sm:text-5xl font-normal drop-shadow-sm tracking-tight text-stone-950 uppercase select-none hover:text-stone-900 border-b border-stone-900 transition-colors">
              THE DAILY <span className="text-stone-900 border-b border-stone-900">NEXUS</span>
            </Link>
            <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-1 uppercase">
              WIRE SERVICE | OPERATIVE: <span className="font-bold text-stone-900">{profile?.email}</span> ({profile?.role?.toUpperCase()})
            </span>
          </div>
          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-[#dcd7c9]/50 px-4 py-2 border border-stone-400/50">
            <Link href="/dashboard" className="text-stone-700 hover:text-stone-955 transition-colors">&gt; News Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/blogs" className="text-stone-700 hover:text-stone-955 transition-colors">&gt; Blogs Feed</Link>
          </div>
          <div className="flex gap-3">
            {isAdmin && (
              <Link href="/settings" className="font-mono text-[10px] sm:text-xs border-2 border-stone-900 text-stone-900 bg-[#fcfaf2] px-3 py-1.5 hover:bg-stone-950 hover:text-[#fcfaf2] transition-all uppercase tracking-widest flex items-center gap-1.5">
                Security Deck
              </Link>
            )}
            <button onClick={handleLogout} className="font-mono text-[10px] sm:text-xs border-2 border-red-950 text-red-900 bg-[#fcfaf2] px-3 py-1.5 hover:bg-red-950 hover:text-[#fcfaf2] transition-all uppercase tracking-widest flex items-center gap-1.5 cursor-pointer">
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
            <div className="w-full flex justify-between items-center border-b-2 border-stone-950 pb-3 mb-5">
              <div>
                <h3 className="font-playfair text-xl text-stone-950 uppercase tracking-wide font-black">WRITE BLOG</h3>
                <p className="font-mono text-[9px] text-stone-500 font-bold mt-1 tracking-wider uppercase">Teletype Draft Protocol</p>
              </div>
            </div>
            <div className="flex-1 bg-[#fcfaf2] border border-stone-300 flex flex-col p-6 sm:p-8 relative">
              <form onSubmit={handleInjectPayload} className="flex flex-col gap-6 pt-3 relative z-10 text-stone-900 font-serif text-left">
                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">TRANSMISSION HEADLINE</label>
                  <input type="text" required placeholder="e.g. BREAKING BLOG HEADLINE..." value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold text-base text-stone-950 placeholder-stone-600/30 font-serif" />
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
                      className="font-mono text-[9px] font-bold text-red-800 hover:text-red-955 uppercase border border-red-800/40 hover:border-red-800 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      disabled={!title.trim()}
                    >
                      Generate from Title
                    </button>
                  </div>
                  <input type="text" required placeholder="url-friendly-slug-here" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-transparent border-none outline-none text-xs text-stone-900 placeholder-stone-600/30 font-mono" />
                </div>
                <div className="flex flex-col flex-1 min-h-[140px] border-b border-stone-400 pb-2">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">BLOG CONTENT</label>
                  <textarea required placeholder="Write blog content or dispatch records here..." value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-transparent border-none outline-none text-sm text-stone-950 placeholder-stone-600/30 min-h-[180px] leading-relaxed custom-paper-scrollbar" />
                </div>
                <div className="flex gap-4 mt-2">
                  <Link href="/blogs" className="flex-1 bg-stone-300 text-stone-900 border-2 border-stone-300 font-mono font-bold text-xs py-3.5 uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-stone-400">Cancel</Link>
                  <button type="submit" className="flex-[2] bg-red-800 text-[#fcfaf2] hover:bg-red-900 border-2 border-red-950 font-mono font-bold text-xs py-3.5 uppercase tracking-wider transition-all active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer">Add to Wire (Draft)</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="hidden lg:flex lg:col-span-1 flex-col relative w-full lg:sticky lg:top-8">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 flex flex-col relative z-10 vintage-shadow-lg rounded">
            <div className="border-b-2 border-stone-950 pb-3 mb-5 text-left">
              <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black">COGNITIVE BLOG WIRE</h3>
              <p className="font-mono text-[9px] text-stone-500 font-bold mt-1 tracking-wider uppercase">AUTOMATED WIRE DESPATCH</p>
            </div>
            <div className="flex-1 bg-[#fcfaf2] border border-stone-300 flex flex-col p-5 relative">
              <form onSubmit={handleAskAgent} className="flex flex-col gap-4 font-serif text-stone-900 text-left">
                <p className="font-serif text-xs text-stone-700 leading-relaxed">Provide instructions or a topic. The Nexus Agent will search the web using <strong>Tavily Search</strong>, synthesize the details, and return a print-ready blog draft.</p>
                <div className="flex flex-col border-2 border-stone-950 p-3 bg-[#fcfaf2]">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1.5">Enter Topic or Wire Request:</label>
                  <textarea required placeholder="e.g. Write a blog about the evolution of JavaScript." value={agentQuery} onChange={(e) => setAgentQuery(e.target.value)} className="w-full bg-transparent outline-none text-xs text-stone-950 placeholder-stone-400 font-serif leading-relaxed h-24 resize-none typewriter-field" disabled={agentLoading} />
                </div>
                <button type="submit" className="vintage-stamp w-full text-center py-3 bg-red-800 text-[#fcfaf2] border-red-950 hover:bg-red-950 hover:text-[#fcfaf2] font-bold cursor-pointer text-xs" disabled={agentLoading || !agentQuery.trim()}>
                  {agentLoading ? "COMMISSIONING TELETYPES..." : "DISPATCH BLOG AGENT"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {injectionStatus.active && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#fcfaf2] border-4 border-stone-950 p-8 flex flex-col gap-6 relative overflow-hidden">
            <h3 className="font-playfair text-stone-950 font-black text-xl uppercase tracking-widest text-center animate-pulse">PUBLISHING TO FEED</h3>
            <div className="flex flex-col gap-2 font-mono text-xs text-stone-800">
              <div className="flex justify-between"><span>STATUS: {injectionStatus.phase}</span><span>{injectionStatus.progress}%</span></div>
              <div className="w-full h-4 bg-[#dcd7c9] border-2 border-stone-950 overflow-hidden p-0.5">
                <div className="h-full bg-stone-950 transition-all duration-300" style={{ width: `${injectionStatus.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
