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
    "TELETYPE_INIT: Mounting news wire...",
    "WIRE: Connection to Metasphere active.",
    "INK: Press calibration complete.",
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
        addLog(`AUTH: Operative logged in. Role: '${data.user.role}'`);

        // Fetch health status
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
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-red-800/10 selection:text-red-950 text-stone-900 font-serif">
      
      {/* Newspaper texture noise background */}
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>

      {/* Header HUD */}
      <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-950 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          
          <div className="flex flex-col text-center md:text-left">
            <Link href="/dashboard" className="font-playfair text-3xl sm:text-4xl font-black tracking-tight text-stone-950 uppercase select-none hover:text-red-800 transition-colors">
              THE DAILY <span className="text-red-800">NEXUS</span>
            </Link>
            <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-1 uppercase">
              WIRE SERVICE  •  OPERATIVE: <span className="font-bold text-stone-900">{profile?.email}</span> ({profile?.role?.toUpperCase()})
            </span>
          </div>

          {/* Navigation Deck Links */}
          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-stone-200/50 px-4 py-2 border border-stone-400/50 rounded">
            <Link href="/dashboard" className="text-red-800 hover:text-red-900 transition-colors font-black border-b-2 border-red-850 pb-0.5">&gt; Hub</Link>
            <span className="text-stone-400">|</span>
            <Link href="/news" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Wire Feed</Link>
            {canAdd && (
              <>
                <span className="text-stone-400">|</span>
                <Link href="/news/add" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Injector</Link>
              </>
            )}
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <Link 
                href="/settings"
                className="font-mono text-[10px] sm:text-xs border-2 border-stone-900 text-stone-900 bg-white px-3 py-1.5 hover:bg-stone-950 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5"
              >
                Security Deck
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="font-mono text-[10px] sm:text-xs border-2 border-red-950 text-red-900 bg-white px-3 py-1.5 hover:bg-red-950 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5 cursor-pointer"
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 md:gap-10 relative z-10 max-w-[1600px] mx-auto w-full pb-8">
        
        {/* LEFT PANEL: Wire Teletype Controls (2 Cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6 relative">
          
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 sm:p-8 flex flex-col h-full min-h-[400px] shadow-[4px_4px_0px_#111] rounded">
            
            <div className="flex justify-between items-center border-b-2 border-stone-950 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-red-800 rounded-full animate-pulse"></span>
                <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black">
                  SYSTEM OVERVIEW
                </h3>
              </div>
              <span className="font-mono text-[9px] text-stone-650 font-bold uppercase tracking-widest">
                SYS.ONLINE
              </span>
            </div>

            {/* Telemetry rows */}
            <div className="flex-1 flex flex-col gap-4 text-xs text-stone-850 text-left">
              
              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5">
                <span className="font-mono uppercase text-stone-500 font-bold">PRESS STATUS</span>
                <span className={`font-mono font-bold uppercase tracking-wider text-[10px] ${serverHealth?.status === "ok" ? "text-green-800" : "text-red-700 animate-pulse"}`}>
                  {serverHealth ? `${serverHealth.status.toUpperCase()}` : "SCANNING..."}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5">
                <span className="font-mono uppercase text-stone-500 font-bold">OPERATIVE OS</span>
                <span className="font-mono text-stone-900 font-bold">{clientInfo?.os || "DETERMINING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5">
                <span className="font-mono uppercase text-stone-500 font-bold">BROWSER</span>
                <span className="font-mono text-stone-850 tracking-wider truncate max-w-[150px]">{clientInfo?.browser || "EXTRACTING..."}</span>
              </div>

              <div className="flex justify-between items-center border-b border-stone-300 pb-1.5">
                <span className="font-mono uppercase text-stone-500 font-bold">OPERATIVE IP</span>
                <span className="font-mono text-red-900 font-bold tracking-wider">{clientInfo?.ip || "SCANNING..."}</span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2 bg-[#f5f2e9] border border-stone-400 p-3 rounded">
                <span className="text-[9px] font-mono text-stone-600 uppercase tracking-widest font-bold">GRID LOGS STREAM</span>
                <div className="font-mono text-[10px] text-stone-700 leading-relaxed space-y-0.5">
                  <div>&gt;&gt; TELETYPE DECK ONLINE... OK</div>
                  <div>&gt;&gt; SYSTEM INTEGRITY CLEARANCE: 100%</div>
                  <div>&gt;&gt; AUTH DECK CONFIGURED</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Command Center Deck Navigation (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6 relative">
          
          {/* Card 1: Chronicles Feed Deck */}
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 sm:p-8 flex flex-col shadow-[4px_4px_0px_#111] relative rounded text-left">
            
            <div className="flex justify-between items-center border-b-2 border-stone-950 pb-3 mb-4">
              <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black">
                WIRE REPORT ARCHIVES
              </h3>
              <span className="text-[10px] font-mono text-stone-700 bg-stone-200 border border-stone-400 px-2.5 py-0.5 tracking-widest font-bold">
                /news
              </span>
            </div>

            <p className="text-stone-800 text-sm leading-relaxed mb-6 font-serif">
              Access the main intelligence dispatch feeds broadcasting from nodes in real-time. View, inspect, filter, edit, or purge system records.
            </p>

            <Link 
              href="/news"
              className="vintage-stamp text-center py-4 text-sm font-black flex items-center justify-center bg-white"
            >
              ACCESS WIRE FEED
            </Link>
          </div>

          {/* Card 2: News Payload Injector */}
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 sm:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative rounded text-left">
            
            <div className="flex justify-between items-center border-b-2 border-stone-950 pb-3 mb-4 text-stone-900">
              <h3 className="font-playfair text-lg uppercase tracking-wide font-black">
                NEWS WIRE INJECTOR
              </h3>
              <span className="text-[10px] font-mono text-stone-750 bg-stone-200 border border-stone-400 px-2.5 py-0.5 uppercase tracking-widest font-bold">
                /news/add
              </span>
            </div>

            <p className="text-stone-800 text-sm leading-relaxed mb-6 font-serif">
              Initialize a teletype broadcast packet to draft and inject news payload dispatches onto the metagrid network. Requires admin or editor credentials.
            </p>

            {canAdd ? (
              <Link 
                href="/news/add"
                className="vintage-stamp text-center py-4 text-sm font-black flex items-center justify-center bg-red-800 text-white border-red-950 shadow-[3px_3px_0px_#801c1c] hover:bg-red-950 hover:text-white"
              >
                INITIALIZE PAYLOAD INJECTOR
              </Link>
            ) : (
              <div className="w-full text-center border-2 border-dashed border-stone-400 text-stone-600 font-mono font-bold text-xs py-4 uppercase tracking-wider select-none bg-stone-200/50 rounded">
                [ SECURITY LOCK: READ-ONLY ACCESS ]
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer HUD */}
      <footer className="w-full max-w-[1600px] mx-auto mt-6 pt-3 border-t-2 border-stone-950 flex flex-wrap justify-between items-center gap-4 text-[9px] font-mono text-stone-600 z-10 px-1">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border border-stone-950 flex items-center justify-center text-stone-950 font-bold bg-white">
            N
          </div>
          <div>
            <span className="text-stone-800 font-bold">THE DAILY NEXUS WIRE</span>
            <span className="mx-2 text-stone-400">|</span>
            <span>Printing Engine: <span className="text-red-800 font-bold uppercase">STANDBY</span></span>
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
    </div>
  );
}
