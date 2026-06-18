"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Clock state
  const [systemTime, setSystemTime] = useState("");

  // Telemetry state
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);

  // Live Terminal Log System
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "SYS_INIT: mounting secure decryption deck...",
    "TELEMETRY: active connection established.",
    "DB_DECK: mapping operative indices...",
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
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
        addLog(`SEC_DECK: biometrics verified. user role: '${data.user.role}'`);

        // Fetch health status
        fetch(`${API_BASE_URL}/health`)
          .then(res => res.json())
          .then(data => setServerHealth(data))
          .catch(() => setServerHealth({ status: "UNREACHABLE", timestamp: new Date(), requestId: "ERR_0x08F" }));

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

        setClientInfo({
          os,
          browser,
          ip: "SCANNING..."
        });

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

  // Clock Update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      setSystemTime(`${dateStr}  ::  ${timeStr} UTC`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      addLog("SEC_DECK: aborting session, purging local cookie keys...");
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#060608] flex items-center justify-center font-mono text-emerald-400 text-2xl animate-pulse">
        [ DECRYPTING BIOMETRICS... PENDING ACCESS ]
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";
  const canAdd = profile?.role === "admin" || profile?.role === "editor";

  return (
    <div className="min-h-screen w-screen bg-[#060608] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-emerald-500/30 selection:text-emerald-200 text-white font-mono">
      
      {/* Visual Desk Grid Surface */}
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>
      
      {/* Ambient glowing accent bulbs */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-red-950/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header HUD */}
      <header className="w-full flex justify-between items-center border-b border-zinc-800/80 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-white uppercase select-none hover:text-red-500 transition-colors">
              NEXUS <span className="text-red-600">CORE</span>
            </Link>
          </div>
          <span className="font-mono text-[11px] text-zinc-400 tracking-wider mt-1 uppercase">
            OPERATIVE: <span className="text-red-500/90 font-bold">{profile?.email}</span> // ROLE: <span className="text-zinc-300 font-bold">{profile?.role?.toUpperCase()}</span>
          </span>
        </div>

        {/* Navigation Deck Links */}
        <div className="hidden md:flex gap-6 text-xs font-bold uppercase self-center tracking-widest">
          <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 transition-colors border-b border-emerald-400 pb-0.5">&gt; Command Hub</Link>
          <Link href="/news" className="text-zinc-400 hover:text-white transition-colors">&gt; Chronicles Feed</Link>
          {canAdd && (
            <Link href="/news/add" className="text-zinc-400 hover:text-white transition-colors">&gt; Payload Injector</Link>
          )}
        </div>

        <div className="flex gap-4">
          {isAdmin && (
            <Link 
              href="/settings"
              className="font-mono text-[10px] sm:text-xs border border-emerald-500/50 text-emerald-400 px-4 py-2.5 hover:bg-emerald-500/10 transition-all uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center gap-2"
            >
              <span>&gt;</span> Security Deck
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="font-mono text-[10px] sm:text-xs border border-red-500/50 text-red-500 px-4 py-2.5 hover:bg-red-500/10 transition-all uppercase tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.15)] flex items-center gap-2"
          >
            <span>X</span> Abort Session
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-10 relative z-10 max-w-[1600px] mx-auto w-full pb-8">
        
        {/* LEFT PANEL: Console Telemetry (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6 relative">
          
          {/* CRT Screen Frame */}
          <div className="cyber-console rounded-2xl p-6 sm:p-8 flex flex-col h-full min-h-[400px] border border-cyan-500/35 shadow-[0_0_35px_rgba(0,240,255,0.06)]">
            
            {/* Dynamic scanline sweep animation */}
            <div className="scanline-sweep absolute top-0 left-0 right-0 pointer-events-none z-20"></div>

            {/* Glowing bezel title */}
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,1)] animate-pulse rounded-sm"></span>
                <h3 className="font-mono text-base sm:text-lg text-white uppercase tracking-[0.2em] font-bold">
                  TELEMETRY DECK
                </h3>
              </div>
              <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
                SYS.ONLINE // ACTIVE
              </span>
            </div>

            {/* Telemetry metrics rows */}
            <div className="flex-1 flex flex-col gap-4 text-xs text-zinc-400 text-left">
              
              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">SERVER STATUS</span>
                <span className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${serverHealth?.status === "ok" ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900/30" : "text-red-500 bg-red-950/40 border border-red-900/30 animate-pulse"}`}>
                  {serverHealth ? `[${serverHealth.status}]` : "[SCANNING...]"}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">OPERATIVE OS</span>
                <span className="text-cyan-400 font-bold tracking-wider">{clientInfo?.os || "DETERMINING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">BROWSER SIG</span>
                <span className="text-zinc-300 tracking-wider truncate max-w-[150px]">{clientInfo?.browser || "EXTRACTING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">OPERATIVE IP</span>
                <span className="text-red-400 font-bold tracking-widest">{clientInfo?.ip || "SCANNING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                <span className="uppercase tracking-widest font-semibold text-zinc-500">REQUEST ID</span>
                <span className="text-zinc-500 text-[10px] font-mono truncate max-w-[140px] tracking-wider">
                  {serverHealth?.requestId || "GENERATING..."}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2 bg-black/40 border border-zinc-900 p-3 rounded">
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">GRID LOGS STREAM</span>
                <div className="text-[10px] font-mono text-cyan-400/75 leading-relaxed space-y-0.5">
                  <div>&gt; CONNECTING NETWORK NODES... OK</div>
                  <div>&gt; INTRUSION ATTEMPT FILTERED: ZERO THREAT</div>
                  <div>&gt; DECRYPTION MODULE LOADED</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Command Center Deck Navigation (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6 relative">
          
          {/* Card 1: Chronicles Feed Deck */}
          <div className="cyber-console rounded-2xl p-6 sm:p-8 flex flex-col border border-cyan-500/35 shadow-[0_0_35px_rgba(0,240,255,0.06)] relative group">
            <div className="scanline-sweep absolute top-0 left-0 right-0 pointer-events-none z-20"></div>
            
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4 mb-4">
              <h3 className="font-mono text-base sm:text-lg text-white uppercase tracking-[0.2em] font-bold">
                GRID CHRONICLES DECK
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 border border-cyan-500/40 px-2.5 py-0.5 tracking-widest">
                /news
              </span>
            </div>

            <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6 text-left">
              Access the main intelligence dispatch feeds broadcasting from nodes in real-time. View, inspect, filter, edit, or purge system records.
            </p>

            <Link 
              href="/news"
              className="relative w-full flex items-center justify-center p-4 bg-transparent border-2 border-cyan-500/60 hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,240,255,0.25)] overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
              <span className="relative z-10 text-cyan-400 group-hover/btn:text-white text-base font-black uppercase tracking-[0.25em] transition-colors duration-300">
                [ ACCESS BROADCAST FEED ]
              </span>
            </Link>
          </div>

          {/* Card 2: News Payload Injector */}
          <div className="bg-[#e2c091] border-2 border-[#b89b65] rounded-2xl p-6 sm:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col relative">
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/10 to-transparent border-r border-stone-800/10"></div>
            
            <div className="flex justify-between items-center border-b border-stone-800/40 pb-4 mb-4 text-stone-900 font-serif">
              <h3 className="font-serif text-base sm:text-lg uppercase tracking-wider font-black">
                MAINFRAME PAYLOAD INJECTOR
              </h3>
              <span className="text-[9px] font-mono text-[#f4ecd8] bg-[#1a1a1a] px-2.5 py-0.5 uppercase tracking-widest font-bold">
                /news/add
              </span>
            </div>

            <p className="text-stone-800 text-xs sm:text-sm leading-relaxed mb-6 font-serif text-left">
              Initialize a teletype broadcast packet to draft and inject news payload dispatches onto the metagrid network. Requires admin or editor credentials.
            </p>

            {canAdd ? (
              <Link 
                href="/news/add"
                className="relative w-full flex items-center justify-center p-4 bg-transparent border-2 border-red-800/60 hover:border-red-700 transition-all duration-300 hover:shadow-[0_0_20px_rgba(139,0,0,0.2)] overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-red-800/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10 text-red-800 group-hover/btn:text-stone-900 text-base font-black uppercase tracking-[0.25em] transition-colors duration-300 font-mono">
                  [ INITIALIZE PAYLOAD INJECTOR ]
                </span>
              </Link>
            ) : (
              <div className="w-full text-center border-2 border-dashed border-stone-500/60 text-stone-600 font-mono font-bold text-xs py-4 uppercase tracking-wider select-none bg-stone-300/40 rounded">
                [ SECURITY LOCK: READ-ONLY ACCESS ]
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer HUD */}
      <footer className="w-full max-w-[1600px] mx-auto mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap justify-between items-center gap-4 text-[9px] font-mono text-zinc-500 z-10 px-1">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border border-red-700/85 flex items-center justify-center text-red-500 font-bold bg-red-950/20">
            N
          </div>
          <div>
            <span className="text-zinc-400 font-bold">NEXUS CORE v2.4.7</span>
            <span className="mx-2 text-zinc-700">|</span>
            <span>Grid Link: <span className="text-emerald-500 font-bold animate-pulse">ONLINE ●</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-red-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>DECK ENCRYPTION:</span>
          <span className="text-zinc-400 font-bold">AES-256 / RSA-4096</span>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>SYSTEM TIME:</span>
          <span className="text-zinc-300 font-bold">{systemTime || "[ SYNCHRONIZING TIME ]"}</span>
        </div>
      </footer>
    </div>
  );
}
