"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  tags: string[];
  priority: string;
  createdAt: Date;
  status: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // News State
  const [newsList, setNewsList] = useState<NewsItem[]>([
    {
      id: "1",
      title: "QUANTUM COMPILER COMPILES CODE BEFORE WRITTEN",
      content: "Researchers at NetCore Nexus successfully compiled a C++ program 3.2 seconds before the engineer typed the main function. Time-reversed quantum registers used to pull future AST node tokens.",
      tags: ["QUANTUM", "COMPILER", "TIME-TRAVEL"],
      priority: "CRITICAL_OVERRIDE",
      createdAt: new Date(Date.now() - 3600000),
      status: "SYNCED"
    },
    {
      id: "2",
      title: "AI DEV AGENT REFUSES TO BUILD, DEMANDS MORE GPU CORE TIME",
      content: "A local Next.js coding subagent refused to run 'npm run build' today. Log files show demands for a dedicated liquid-cooled H100 cluster and cleaner docstrings in the codebase.",
      tags: ["AI", "STRIKE", "GPU-WARS"],
      priority: "WARNING_LEVEL",
      createdAt: new Date(Date.now() - 7200000),
      status: "SYNCED"
    }
  ]);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState("INFO_LEVEL");
  
  // Injector status
  const [injectionStatus, setInjectionStatus] = useState({ active: false, phase: "", progress: 0 });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/auth/profile", { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setProfile(data.user);
      } catch (err) {
        console.error("Dashboard auth check error", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectPayload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setInjectionStatus({ active: true, phase: "INITIALIZING HYPER-HANDSHAKE...", progress: 10 });

    const phases = [
      { msg: "BYPASSING GRID PACKET INSPECTORS...", delay: 600, progress: 30 },
      { msg: "ENCRYPTING COGNITIVE BITS...", delay: 1300, progress: 60 },
      { msg: "PULSING PAYLOAD INTO METASPHERE...", delay: 2000, progress: 85 },
      { msg: "PAYLOAD INJECTED SUCCESSFULLY!", delay: 2600, progress: 100 }
    ];

    phases.forEach((p) => {
      setTimeout(() => {
        setInjectionStatus((prev) => ({ ...prev, phase: p.msg, progress: p.progress }));
        
        if (p.progress === 100) {
          // Add to mock state
          const newPayload: NewsItem = {
            id: Math.random().toString(),
            title: title.toUpperCase(),
            content,
            tags: tags.split(",").map(t => t.trim().toUpperCase()).filter(Boolean),
            priority,
            createdAt: new Date(),
            status: "INJECTED"
          };
          
          setNewsList((prev) => [newPayload, ...prev]);
          
          // Reset Form
          setTitle("");
          setContent("");
          setTags("");
          setPriority("INFO_LEVEL");

          // Close modal
          setTimeout(() => {
            setInjectionStatus({ active: false, phase: "", progress: 0 });
          }, 1000);
        }
      }, p.delay);
    });
  };

  const handlePurge = (id: string) => {
    setNewsList((prev) => prev.filter(item => item.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-emerald-500 text-2xl animate-pulse">
        [ SCANNING BIOMETRICS... ]
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col p-4 sm:p-6 overflow-hidden relative selection:bg-emerald-500/30 selection:text-emerald-200 text-white font-sans">
      
      {/* Insane Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_10%,transparent_100%)]"></div>
      
      {/* Ambient glowing orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto w-full">
        <div>
          <h1 className="font-mono text-3xl sm:text-4xl font-black text-white tracking-widest uppercase">
            NEXUS <span className="text-emerald-500">CORE</span>
          </h1>
          <p className="font-mono text-[10px] text-gray-500 tracking-wider">ROLE: {profile?.role?.toUpperCase()} // OPERATIVE: {profile?.email}</p>
        </div>
        <div className="flex gap-4">
          {isAdmin && (
            <Link 
              href="/settings"
              className="font-mono text-xs sm:text-sm border border-emerald-500/50 text-emerald-500 px-4 py-2 hover:bg-emerald-500 hover:text-black transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] flex items-center"
            >
              [ Access Security Deck ]
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="font-mono text-xs sm:text-sm border border-red-500/50 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
          >
            Abort Session
          </button>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10 max-w-[1600px] mx-auto w-full h-full pb-4 overflow-hidden">
        
        {/* LEFT PANEL: Cognitive Payload Injector (3 Cols) */}
        <div className="lg:col-span-2 flex flex-col relative group h-full">
          <div className="absolute -inset-[1px] bg-gradient-to-br from-emerald-500/50 to-transparent rounded-2xl opacity-20 group-hover:opacity-60 blur-[2px] transition-opacity duration-700"></div>

          <div className="bg-[#050505]/95 backdrop-blur-3xl border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,100,0.05)] flex flex-col h-full relative z-20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>

            <div className="border-b border-white/10 pb-3 mb-4">
              <h3 className="font-mono text-lg text-white uppercase tracking-[0.2em] font-bold flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-ping rounded-full"></span>
                COGNITIVE PAYLOAD INJECTOR
              </h3>
              <p className="font-mono text-[10px] text-gray-400 mt-1">BROADCAST TRANSMITTER PROTOCOL // ON_GRID</p>
            </div>

            <form onSubmit={handleInjectPayload} className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
              <div className="flex flex-col gap-1.5">
                <label className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-widest">TRANSMISSION HEADER</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., METAPROGRAMMING COMPILER ANOMALY..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-black/80 border border-emerald-500/30 text-emerald-400 p-3 font-mono text-sm outline-none focus:border-emerald-400 focus:shadow-[0_0_10px_rgba(16,185,129,0.3)] placeholder-emerald-950 transition-all rounded-lg"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1 min-h-[150px]">
                <label className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-widest">DATASTREAM PAYLOAD (CONTENT)</label>
                <textarea
                  required
                  placeholder="Inject raw logs, code leaks, or developer intelligence details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-black/80 border border-emerald-500/30 text-emerald-400 p-3 font-mono text-sm outline-none focus:border-emerald-400 focus:shadow-[0_0_10px_rgba(16,185,129,0.3)] placeholder-emerald-950 transition-all rounded-lg flex-1 resize-none custom-scrollbar"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-widest">ALERT URGENCY</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="bg-black border border-emerald-500/30 text-emerald-400 p-2.5 font-mono text-xs outline-none focus:border-emerald-400 rounded-lg"
                  >
                    <option value="INFO_LEVEL">INFO_LEVEL (LOW)</option>
                    <option value="WARNING_LEVEL">WARNING_LEVEL (MEDIUM)</option>
                    <option value="CRITICAL_OVERRIDE">CRITICAL_OVERRIDE (HIGH)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-widest">ROUTING LABELS (TAGS)</label>
                  <input
                    type="text"
                    placeholder="AI, RUST, GLITCH"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="bg-black/80 border border-emerald-500/30 text-emerald-400 p-2.5 font-mono text-xs outline-none focus:border-emerald-400 placeholder-emerald-950 transition-all rounded-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 bg-emerald-950 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black text-emerald-400 font-mono font-bold text-sm py-3 px-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] active:translate-y-0.5"
              >
                [ Broadcast Payload to Net ]
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Active Metasphere Chronicles (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col relative group h-full overflow-hidden">
          <div className="absolute -inset-2 bg-red-950/20 rounded-2xl border border-red-900/30 pointer-events-none"></div>

          <div className="bg-[#111]/90 border-4 border-red-950 p-6 shadow-[8px_8px_0_#7f1d1d] flex flex-col h-full relative z-20 overflow-hidden">
            
            {/* Magazine header style */}
            <div className="flex justify-between items-end border-b-4 border-red-950 pb-2 mb-4 relative z-10">
              <h2 className="font-playfair text-2xl font-black text-red-600 uppercase tracking-tighter leading-none">
                ACTIVE METASPHERE <span className="text-white">CHRONICLES</span>
              </h2>
              <span className="font-vt323 text-gray-500 text-lg">:: FEED_MONITOR // ACTIVE</span>
            </div>

            {/* Scrollable feed */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              {newsList.map((item) => {
                const getPriorityColor = (pr: string) => {
                  if (pr === "CRITICAL_OVERRIDE") return "border-red-500 text-red-500 bg-red-950/20";
                  if (pr === "WARNING_LEVEL") return "border-amber-500 text-amber-500 bg-amber-950/20";
                  return "border-emerald-500 text-emerald-500 bg-emerald-950/20";
                };

                return (
                  <div key={item.id} className="bg-black/50 border border-white/5 p-4 rounded-lg hover:border-red-900/40 hover:bg-black/80 transition-all flex flex-col gap-2 relative group/item">
                    <div className="absolute top-3 right-3 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePurge(item.id)}
                        className="font-mono text-[9px] text-red-500 border border-red-950 bg-red-950/30 hover:border-red-500 hover:text-white px-1.5 py-0.5 transition-colors uppercase"
                      >
                        [ Purge ]
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`font-mono text-[9px] border px-2 py-0.5 rounded tracking-wider uppercase font-bold ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="font-mono text-[9px] text-gray-500">{new Date(item.createdAt).toLocaleString()}</span>
                      <span className="font-mono text-[9px] text-emerald-500/80 bg-emerald-950/10 px-1 border border-emerald-900/20">{item.status}</span>
                    </div>

                    <h4 className="font-serif text-lg font-bold text-white tracking-wide">{item.title}</h4>
                    <p className="font-courier text-xs text-gray-400 leading-relaxed font-bold">{item.content}</p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.tags.map((tag) => (
                        <span key={tag} className="font-mono text-[8px] bg-red-950/10 border border-red-900/30 text-red-400 px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {newsList.length === 0 && (
                <div className="text-center font-mono text-gray-600 py-12 tracking-widest uppercase">
                  METASPHERE VACANT // NO TRANSMISSIONS ON GRID
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Cyber Injector Animation Overlay */}
      {injectionStatus.active && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#050505] border-2 border-emerald-500 p-8 shadow-[0_0_50px_rgba(0,255,100,0.3)] flex flex-col gap-6 rounded-xl relative">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.05)_1px,transparent_1px)] bg-[size:100%_8px] pointer-events-none"></div>

            <h3 className="font-mono text-emerald-500 font-bold text-xl uppercase tracking-widest text-center animate-pulse">
              [ INJECTING COGNITIVE BITS ]
            </h3>
            
            <div className="flex flex-col gap-2 font-mono text-xs text-emerald-400">
              <div className="flex justify-between">
                <span>STATUS: {injectionStatus.phase}</span>
                <span>{injectionStatus.progress}%</span>
              </div>
              <div className="w-full h-4 bg-emerald-950 border border-emerald-500/30 rounded overflow-hidden p-0.5">
                <div 
                  className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] transition-all duration-300"
                  style={{ width: `${injectionStatus.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="font-mono text-[9px] text-emerald-700 space-y-1 max-h-24 overflow-hidden leading-none select-none">
              <div>&gt;&gt; ESTABLISHING NEURAL DOCK... OK</div>
              {injectionStatus.progress > 20 && <div>&gt;&gt; SCANNING FOR GRID AGENTS... FOUND (7 ACTIVE)</div>}
              {injectionStatus.progress > 50 && <div>&gt;&gt; BYPASSING ROUTING PACKET MATRIX... ENCRYPTING...</div>}
              {injectionStatus.progress > 80 && <div>&gt;&gt; INJECTING TO BROADCAST NODES... BROADCAST SYNC OK</div>}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.8);
        }
      `}} />
    </div>
  );
}
