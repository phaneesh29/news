"use client";

import { API_BASE_URL } from "../config";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [isDecrypted, setIsDecrypted] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#060608] desk-mat flex flex-col p-4 sm:p-8 md:p-12 overflow-x-hidden relative selection:bg-emerald-500/30 selection:text-emerald-200 text-white font-mono">
      
      {/* Ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-red-950/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-cyan-950/15 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header - Holographic HUD overlay */}
      <div className="flex justify-between items-start border-b-2 border-zinc-800/80 pb-6 mb-12 relative z-10 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col">
          <h1 className="font-mono text-3xl sm:text-5xl font-black tracking-widest text-white leading-none mb-2 select-none">
            DEV<span className="text-red-600">.</span>NEWS
          </h1>
          <p className="font-mono text-[10px] sm:text-xs text-red-500/85 uppercase tracking-[0.35em] font-bold">
            [ CLASSIFIED BROADCAST PROTOCOL // OMEGA.V12 ]
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-[10px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-red-500 font-bold uppercase tracking-wider">SECURE GRID TRANSMISSION</span>
          </div>
          <span className="text-zinc-500 uppercase tracking-widest">MODE: TERMINAL_INTRUSION</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-12 lg:gap-16 min-h-0 relative z-10 max-w-[1400px] mx-auto w-full items-center justify-center">
            
        {/* LEFT COLUMN: The Physical Classified Dossier Folder */}
        <div className="flex-[1.2] flex flex-col relative w-full group transition-all duration-500">
          
          {/* Manila folder tab detailing operational ID */}
          <div className="absolute top-0 left-12 w-48 h-8 bg-[#e2c091] border-t border-l border-r border-[#b89b65] -translate-y-[99%] rounded-t-lg shadow-sm z-0 flex items-center px-4">
            <span className="text-[10px] text-stone-700 font-bold tracking-widest uppercase truncate">
              OP_FILE_0x89F.DAT
            </span>
          </div>

          {/* Dossier Folder Wrapper */}
          <div className="dossier-folder rounded-r-xl rounded-bl-xl p-3 sm:p-4 rotate-[-1deg] group-hover:rotate-0 transition-transform duration-700">
            
            {/* Folder spine seam */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/20 via-black/10 to-transparent border-r border-stone-800/10"></div>

            {/* The Vintage Paper Page */}
            <div className="parchment-sheet p-6 sm:p-10 md:p-12 flex flex-col rounded-sm overflow-hidden min-h-[500px]">
              
              {/* Coffee ring stain details */}
              <div className="coffee-stain top-10 left-12 opacity-80 rotate-12"></div>
              <div className="coffee-stain bottom-14 right-10 opacity-40 -rotate-[30deg]"></div>

              {/* Brass Paper Clip Overlay */}
              <div className="absolute -top-6 left-1/3 w-8 h-20 bg-gradient-to-b from-stone-400 via-stone-300 to-stone-500 rounded-full border-2 border-stone-600 shadow-md z-30 pointer-events-none transform -rotate-[12deg] flex items-center justify-center">
                <div className="w-1.5 h-16 border-r border-stone-300 rounded-full"></div>
              </div>

              {/* Red Confidential Ink Stamp */}
              <div className="absolute top-6 right-6 border-4 border-red-700/80 text-red-700/80 font-serif font-black text-2xl p-1.5 px-4 transform rotate-[16deg] uppercase tracking-widest select-none mix-blend-multiply opacity-85 z-20">
                CONFIDENTIAL
              </div>

              {/* Newspaper Header */}
              <div className="border-b-4 border-stone-900 pb-3 mb-6 relative z-10 text-center">
                <span className="font-mono text-[9px] text-stone-600 font-bold uppercase tracking-[0.25em]">
                  FIELD REPORT // BOMBAY INTELLIGENCE CELL
                </span>
                <h2 className="newspaper-headline mt-1 text-3xl sm:text-5xl">
                  MAINFRAME DISRUPTION
                </h2>
                <div className="flex justify-between items-center text-[10px] text-stone-700 font-bold uppercase tracking-wider mt-2 border-t border-stone-900 pt-1">
                  <span>VOL. LXIV // NO. 104</span>
                  <span>PRICE: REDACTED</span>
                  <span>DATE: 17.JUN.2026</span>
                </div>
              </div>
              
              {/* Main content body (Two column newspaper style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 flex-1">
                
                <div className="newspaper-column text-stone-900 font-serif text-[14px]">
                  The neural grid has encountered a critical anomaly. Operatives reported a sudden telemetry purge at approximately 23:00 hours. Real-time archives are currently undergoing local cryptographic storage to safeguard editorial reports against cybermatic wipeout sequences. 
                  <br/><br/>
                  Our remote servers in Bombay are capturing metadata logs on physical tape media, maintaining a strict air-gapped system. Operational protocol dictates an analog handshake must be established using client terminals immediately.
                </div>

                <div className="newspaper-column text-stone-900 font-serif text-[14px] md:border-l md:border-stone-400/80 md:pl-6">
                  To proceed, identify your operative signature on the right console interface. Ensure your local encryption deck is fully synchronized before broadcasting payload news. 
                  <br/><br/>
                  <span className="font-bold">DECRYPTED STATUS:</span>
                  <div className="mt-2 flex items-center gap-3">
                    <button 
                      onClick={() => setIsDecrypted(!isDecrypted)}
                      className="font-mono text-[10px] bg-stone-950 text-[#f4ecd8] px-3 py-1.5 uppercase font-bold hover:bg-red-800 transition-colors cursor-pointer border border-stone-950"
                    >
                      {isDecrypted ? "[ RE-ENCRYPT TEXT ]" : "[ DECRYPT PROTOCOL ]"}
                    </button>
                  </div>
                  
                  <div className="mt-4 font-mono text-[11px] bg-stone-300/60 p-2.5 border border-stone-400/80 rounded relative overflow-hidden">
                    <span className="text-[9px] text-stone-600 font-bold uppercase block mb-1">
                      [ CIPHER TEXT MATRIX ]
                    </span>
                    <span className={`transition-all duration-500 font-bold tracking-wider ${isDecrypted ? "text-stone-900" : "bg-stone-950 text-stone-950 select-none cursor-help"}`}>
                      {isDecrypted ? "PASSWORD CLEARANCE: KEY GRANTED" : "████████████████████████████████"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Footer margin details */}
              <div className="mt-8 pt-3 border-t border-dashed border-stone-600 flex justify-between items-center text-[10px] font-mono text-stone-600 relative z-10">
                <span>&gt;&gt; DOCUMENT SIGNATURE: OP_0442 // GRID</span>
                <span>SECURED TRANSIT</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: The Cyber CRT Terminal Interface */}
        <div className="flex-1 flex flex-col relative w-full group">
          
          {/* CRT Screen Frame */}
          <div className="cyber-console rounded-2xl p-6 sm:p-8 flex flex-col h-full min-h-[500px] border border-cyan-500/35 shadow-[0_0_35px_rgba(0,240,255,0.06)] transform rotate-[1deg] group-hover:rotate-0 transition-transform duration-700">
            
            {/* Dynamic scanline sweep animation */}
            <div className="scanline-sweep absolute top-0 left-0 right-0 pointer-events-none z-20"></div>

            {/* Glowing bezel title */}
            <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4 mb-8">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,1)] animate-pulse rounded-sm"></span>
                <h3 className="font-mono text-lg sm:text-xl text-white uppercase tracking-[0.2em] font-bold">
                  TELEMETRY DECK
                </h3>
              </div>
              <span className="font-mono text-[10px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
                SYS.ONLINE // ACTIVE
              </span>
            </div>

            {/* Telemetry metrics rows */}
            <div className="flex-1 flex flex-col gap-5 text-xs text-zinc-400">
              
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

            {/* Glowing Handshake Action Button */}
            <div className="mt-8 pt-4">
              <Link 
                href="/login"
                className="relative w-full flex items-center justify-center p-4 bg-transparent border-2 border-red-600/60 hover:border-red-500 transition-all duration-300 hover:shadow-[0_0_25px_rgba(239,68,68,0.3)] overflow-hidden group/btn"
              >
                {/* Button slide-in fill background */}
                <div className="absolute inset-0 bg-red-600/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500 ease-out"></div>
                
                <span className="relative z-10 text-red-500 group-hover/btn:text-white text-lg font-black uppercase tracking-[0.25em] transition-colors duration-300">
                  INIT HANDSHAKE
                </span>

                {/* Glitch style brackets in corner */}
                <span className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-red-500"></span>
                <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-red-500"></span>
                <span className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-red-500"></span>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-red-500"></span>
              </Link>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
}
