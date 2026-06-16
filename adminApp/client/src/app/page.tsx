"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch Server Health
    fetch("http://localhost:8000/api/health")
      .then(res => res.json())
      .then(data => setServerHealth(data))
      .catch(() => setServerHealth({ status: "UNREACHABLE", timestamp: null, requestId: null }));

    // Extract Client Info
    const ua = window.navigator.userAgent;
    const os = ua.indexOf("Win") !== -1 ? "WINDOWS" 
             : ua.indexOf("Mac") !== -1 ? "MACOS" 
             : ua.indexOf("Linux") !== -1 ? "LINUX" 
             : "UNKNOWN_OS";
    
    let browser = "UNKNOWN_BROWSER";
    if (ua.includes("Firefox")) browser = "FIREFOX";
    else if (ua.includes("Chrome")) browser = "CHROME";
    else if (ua.includes("Safari")) browser = "SAFARI";
    else if (ua.includes("Edge")) browser = "EDGE";

    setClientInfo({
      os,
      browser,
      resolution: `${window.screen.width}x${window.screen.height}`,
      cores: navigator.hardwareConcurrency || "?",
      ip: "SCANNING..."
    });

    // Fetch Client IP
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setClientInfo((prev: any) => ({ ...prev, ip: data.ip })))
      .catch(() => setClientInfo((prev: any) => ({ ...prev, ip: "SECURE/MASKED" })));
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 cursor-crosshair">
      <div className="w-full max-w-4xl border-4 border-cyber-green bg-cyber-black shadow-[0_0_80px_rgba(0,255,65,0.4)] relative">
        {/* Terminal Header */}
        <div className="bg-cyber-green text-cyber-black px-4 py-1 font-vt323 text-xl tracking-widest flex justify-between">
          <span className="font-bold">SYSTEM BOOT :: CHIP_MAG_V1.9.9.8</span>
          <span className="animate-pulse">_REC</span>
        </div>

        <main className="p-10 relative overflow-hidden h-[600px] flex flex-col justify-between">
          {/* Background Matrix/Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

          {/* Top Info */}
          <div className="font-vt323 text-cyber-green-dim text-lg leading-tight space-y-1 z-10 w-2/3">
            <p>kernel loading... [OK]</p>
            <p>mounting neural link... [OK]</p>
            <p>decrypting classified archives... <span className="text-cyber-alert animate-pulse">[WARN]</span></p>
            <p className="mt-4 text-cyber-green">WARNING: Y2K COMPLIANCE COMPROMISED. ANALOG BACKUP ENGAGED.</p>
          </div>

          {/* Center Glitch Title and Action Button */}
          <div className="flex flex-col items-center justify-center flex-1 z-20 space-y-6">
            <div className="text-center mt-2">
              <h1 
                className="font-vt323 text-6xl md:text-8xl text-cyber-green glitch-text uppercase tracking-tighter"
                data-text="DEV.NEWS"
              >
                DEV.NEWS
              </h1>
              <div className="inline-block border-2 border-cyber-green px-3 py-1 mt-2 hud-brackets bg-cyber-black shadow-[0_0_15px_rgba(0,255,65,0.2)]">
                <h2 className="font-courier text-cyber-green text-lg md:text-xl font-bold uppercase">
                  Directorate of Intelligence
                </h2>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center z-30">
              <Link 
                href="/login"
                className="bg-cyber-alert text-black font-vt323 text-2xl md:text-3xl px-8 py-2 border-b-4 border-r-4 border-cyber-black hover:translate-y-1 hover:border-b-2 hover:border-r-2 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest hud-brackets shadow-[0_0_30px_rgba(255,0,60,0.5)]"
              >
                INITIALIZE CONNECTION
              </Link>
            </div>
          </div>

          {/* Bottom HUD - Dynamic Stats */}
          <div className="flex justify-between items-end z-10 font-vt323 text-sm md:text-lg">
            
            {/* Server Stats */}
            <div className="border border-cyber-green-dim p-2 text-cyber-green-dim w-1/3 bg-cyber-black/80">
              <span className="text-cyber-green font-bold border-b border-cyber-green-dim mb-1 block uppercase">SERVER_LINK</span>
              {serverHealth ? (
                <>
                  STATUS: <span className={serverHealth.status === 'ok' ? 'text-cyber-green' : 'text-cyber-alert'}>{serverHealth.status?.toUpperCase()}</span><br/>
                  PING: {serverHealth.timestamp ? new Date(serverHealth.timestamp).toLocaleTimeString() : 'OFFLINE'}<br/>
                  REQ_ID: {serverHealth.requestId ? serverHealth.requestId.substring(0, 8) + '...' : 'NONE'}
                </>
              ) : (
                <span className="animate-pulse">PINGING MAINFRAME...</span>
              )}
            </div>

            {/* Client Stats */}
            <div className="text-right border border-cyber-green-dim p-2 text-cyber-green-dim w-1/3 bg-cyber-black/80">
               <span className="text-cyber-green font-bold border-b border-cyber-green-dim mb-1 block uppercase text-right">LOCAL_SYS</span>
               {clientInfo ? (
                 <>
                   OS: {clientInfo.os} // {clientInfo.browser}<br/>
                   RES: {clientInfo.resolution} // CPU: {clientInfo.cores} CORE<br/>
                   IP: <span className={clientInfo.ip === 'SCANNING...' ? 'animate-pulse text-cyber-alert' : 'text-cyber-green'}>{clientInfo.ip}</span>
                 </>
               ) : (
                 <span className="animate-pulse">GATHERING TELEMETRY...</span>
               )}
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
