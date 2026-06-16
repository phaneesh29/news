"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then(res => res.json())
      .then(data => setServerHealth(data))
      .catch(() => setServerHealth({ status: "UNREACHABLE" }));

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
  }, []);

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col p-4 sm:p-8 md:p-12 overflow-hidden relative selection:bg-red-500/30 selection:text-red-200 text-white font-sans">
      
      {/* Insane Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
      
      {/* Ambient glowing orbs in background for depth */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header - Now looks like a floating HUD over the desk */}
      <div className="flex justify-between items-start border-b border-white/10 pb-6 mb-12 relative z-10 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col">
          <h1 className="font-mono text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500 tracking-tighter leading-none mb-2">
            DEV<span className="text-red-600">.</span>NEWS
          </h1>
          <p className="font-mono text-xs sm:text-sm text-red-500/80 uppercase tracking-[0.3em] font-semibold">
            [ CLASSIFIED_PROTOCOL // V.CXXVI ]
          </p>
        </div>
        <div className="hidden sm:flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></div>
            <span className="font-mono text-xs text-red-500 tracking-widest uppercase">Live Link</span>
          </div>
          <span className="font-mono text-xs text-gray-500 tracking-widest">
            SECURE: ENCRYPTED
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 lg:gap-20 min-h-0 relative z-10 max-w-[1400px] mx-auto w-full items-center">
            
        {/* LEFT COLUMN: The Physical Dossier */}
        <div className="flex-[1.2] flex flex-col relative group perspective-[1000px] w-full">
          {/* The Manila Folder Backing */}
          <div className="absolute -inset-2 bg-[#d4b886] rounded-sm transform rotate-[-3deg] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-[#b89b65] pointer-events-none hidden lg:block transition-transform duration-700 group-hover:rotate-[-1deg]">
            <div className="absolute top-0 left-8 w-40 h-10 bg-[#d4b886] border-t border-l border-r border-[#b89b65] -translate-y-[99%] rounded-t-lg shadow-inner"></div>
          </div>

          {/* The Paper */}
          <div className="bg-[#f4ebd8] p-8 sm:p-12 shadow-[inset_0_0_60px_rgba(139,90,43,0.15),0_20px_40px_rgba(0,0,0,0.5)] border border-[#e3d3b6] transform rotate-1 transition-all duration-700 hover:rotate-0 hover:scale-[1.01] flex flex-col relative z-10 rounded-sm">
            
            {/* Paper Texture noise */}
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBoNHYxSDB6bTAgMmg0djFIMHoiIGZpbGw9IiNlNWU1ZTUiIGZpbGwtb3BhY2l0eT0iLjQiLz4KPC9zdmc+')]"></div>

            {/* Top Secret Stamp */}
            <div className="absolute top-6 right-6 border-[5px] border-red-700/80 text-red-700/80 font-serif font-black text-3xl sm:text-4xl p-2 px-4 transform rotate-[15deg] uppercase tracking-widest mix-blend-multiply pointer-events-none z-20 shadow-sm opacity-90 group-hover:scale-105 transition-transform duration-500">
              Top Secret
            </div>

            <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-black text-[#1a1a1a] leading-[0.9] mb-8 tracking-tighter border-b-2 border-[#1a1a1a] pb-6 relative z-10">
              MAINFRAME BREACH <br/><span className="text-red-800 italic font-normal text-3xl sm:text-5xl lg:text-6xl">Forces Analog Fallback</span>
            </h2>
            
            <div className="font-serif text-lg sm:text-xl lg:text-2xl text-justify leading-relaxed text-[#2a2a2a] relative z-10">
              <span className="float-left text-7xl sm:text-8xl lg:text-9xl leading-none pr-4 pt-2 font-black text-[#1a1a1a]">T</span>
              he millennium bug has triggered a localized memory wipe within the central grid. All editorial operatives must immediately initiate a secure handshake to preserve their dossier. <br/><br/>
              The telemetric data of your current session has been intercepted and logged on physical media to prevent digital degradation. Review the <span className="bg-black text-transparent hover:text-white transition-colors duration-300 selection:bg-transparent cursor-crosshair px-1 relative">clearance panel<span className="absolute inset-0 bg-black pointer-events-none hover:opacity-0 transition-opacity"></span></span> to the right. 
              <br/><br/>
              <span className="font-mono text-sm sm:text-base font-bold text-red-800 uppercase tracking-widest mt-4 block">&gt;&gt; End of Transmission</span>
            </div>

            {/* Paper clip */}
            <div className="absolute -top-4 left-12 w-6 h-20 border-[4px] border-gray-400/80 rounded-full transform -rotate-[15deg] shadow-lg z-30 bg-gradient-to-b from-gray-200 to-gray-500 hidden sm:block backdrop-blur-sm"></div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Modern Cyber Overlay */}
        <div className="flex-1 flex flex-col relative group perspective-[1000px] w-full">
          
          {/* Animated Glowing border effect behind the terminal */}
          <div className="absolute -inset-[2px] bg-gradient-to-br from-red-600 via-transparent to-emerald-500 rounded-2xl opacity-40 group-hover:opacity-100 blur-[3px] transition-opacity duration-700"></div>

          {/* The Glassmorphic Terminal */}
          <div className="bg-[#050505]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-[0_0_50px_rgba(0,255,100,0.05)] transform rotate-[1deg] flex flex-col relative z-20 transition-all duration-700 hover:rotate-0 hover:-translate-y-2 overflow-hidden w-full">
            
            {/* Terminal Grid & Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 animate-[scan_4s_ease-in-out_infinite] shadow-[0_0_15px_rgba(16,185,129,1)] pointer-events-none"></div>

            <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-4 relative z-10">
              <div>
                <h3 className="font-mono text-2xl sm:text-3xl text-white uppercase tracking-[0.2em] font-bold flex items-center gap-3">
                  <span className="w-3 h-3 bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-pulse"></span>
                  Telemetry
                </h3>
              </div>
              <div className="font-mono text-xs sm:text-sm text-emerald-400 animate-pulse tracking-widest font-bold">
                SYS.ONLINE
              </div>
            </div>

            <div className="flex flex-col gap-6 font-mono text-sm sm:text-base text-gray-400 relative z-10 mb-12">
              <div className="flex justify-between items-center group/item border-b border-white/5 pb-3">
                <span className="uppercase tracking-widest group-hover/item:text-white transition-colors">Server_Link</span>
                <span className={serverHealth?.status === "ok" ? "text-emerald-400 font-bold drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "text-red-500 animate-pulse font-bold"}>
                  {serverHealth ? `[${serverHealth.status.toUpperCase()}]` : "[SCANNING]"}
                </span>
              </div>
              
              <div className="flex justify-between items-center group/item border-b border-white/5 pb-3">
                <span className="uppercase tracking-widest group-hover/item:text-white transition-colors">Timestamp</span>
                <span className="text-gray-300 font-light tracking-wider">{serverHealth?.timestamp ? new Date(serverHealth.timestamp).toLocaleTimeString() : "N/A"}</span>
              </div>

              <div className="flex justify-between items-center group/item border-b border-white/5 pb-3">
                <span className="uppercase tracking-widest group-hover/item:text-white transition-colors">Request_ID</span>
                <span className="text-gray-300 font-light truncate max-w-[120px] sm:max-w-[200px] tracking-wider">{serverHealth?.requestId || "N/A"}</span>
              </div>

              <div className="flex justify-between items-center group/item border-b border-white/5 pb-3">
                <span className="uppercase tracking-widest group-hover/item:text-white transition-colors">Operative_OS</span>
                <span className="text-emerald-400 tracking-wider font-bold">{clientInfo?.os || "UNKNOWN"}</span>
              </div>

              <div className="flex justify-between items-center group/item border-b border-white/5 pb-3">
                <span className="uppercase tracking-widest group-hover/item:text-white transition-colors">Remote_IP</span>
                <span className="text-red-400 font-bold tracking-[0.2em] drop-shadow-[0_0_5px_rgba(248,113,113,0.8)]">{clientInfo?.ip || "MASKED"}</span>
              </div>

              <div className="flex justify-between items-center group/item pb-3">
                <span className="uppercase tracking-widest group-hover/item:text-white transition-colors">Browser_Sig</span>
                <span className="text-gray-300 font-light truncate max-w-[120px] sm:max-w-[200px] text-right tracking-wider">{clientInfo?.browser || "SECURE"}</span>
              </div>
            </div>

            <div className="mt-auto relative z-10 w-full">
              <Link 
                href="/dashboard"
                className="relative w-full group/btn flex items-center justify-center overflow-hidden bg-transparent border border-red-500/50 p-5 sm:p-6 transition-all duration-500 hover:border-red-500 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
              >
                {/* Button Background Fill Animation */}
                <div className="absolute inset-0 bg-red-500/10 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                
                <span className="relative z-10 font-mono text-xl sm:text-2xl text-red-500 group-hover/btn:text-red-100 uppercase tracking-[0.3em] font-bold transition-colors duration-300 group-hover/btn:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                  Init Handshake
                </span>
                
                {/* Glitchy crosshairs in corners */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500"></div>
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500"></div>
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500"></div>
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500"></div>
              </Link>
            </div>

          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
