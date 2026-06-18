"use client";

import { API_BASE_URL } from "../config";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
 const [serverHealth, setServerHealth] = useState<any>(null);
 const [clientInfo, setClientInfo] = useState<any>(null);
 const [isDecrypted, setIsDecrypted] = useState(false);
 const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

 useEffect(() => {
 // Check authentication status
 fetch(`${API_BASE_URL}/auth/profile`, { credentials: "include" })
 .then(res => {
 if (res.ok) {
 setIsAuthenticated(true);
 } else {
 setIsAuthenticated(false);
 }
 })
 .catch(() => setIsAuthenticated(false));

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
 }, []);

 return (
 <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col p-4 sm:p-8 md:p-12 overflow-x-hidden relative selection:bg-red-800/10 selection:text-red-950 text-stone-900 font-serif">
 
 {/* Newspaper desk mat texture */}

 {/* Header - Newspaper style Banner */}
 <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-950 pb-4 mb-12 relative z-10 max-w-[1400px] mx-auto">
 <div className="w-full flex justify-between items-center mb-2">
 <div className="flex flex-col">
 <h1 className="font-playfair text-3xl sm:text-5xl font-black tracking-tight text-stone-950 uppercase select-none hover:text-red-800 transition-colors">
 THE DAILY <span className="text-red-800">NEXUS</span>
 </h1>
 <p className="font-mono text-[9px] sm:text-[10px] text-red-800 uppercase tracking-widest font-bold">
 [ OFFICIAL WIRE ARCHIVE // BROADCAST SYSTEM ]
 </p>
 </div>
 <div className="flex flex-col items-end gap-1 text-[10px] font-mono text-stone-600">
 <div className="flex items-center gap-1.5">
 <span className="w-2 h-2 rounded-full bg-red-800 animate-pulse"></span>
 <span className="text-stone-950 font-bold uppercase tracking-wider">WIRE FEED ONLINE</span>
 </div>
 <span className="uppercase tracking-widest">TRANSMISSION LEVEL: GENERAL</span>
 </div>
 </div>
 
 {/* Newspaper subheader line */}
 <div className="w-full flex justify-between items-center border-t border-stone-850 pt-2 text-[9px] font-mono uppercase text-stone-650 tracking-wider">
 <span>VOL. CXXVI... No. 47190</span>
 <span>SYSTEM READY FOR ACCESS</span>
 <span>PRICE: 10 CENTS</span>
 </div>
 </header>

 <div className="flex-1 flex flex-col lg:flex-row gap-12 lg:gap-16 min-h-0 relative z-10 max-w-[1400px] mx-auto w-full items-center justify-center">
 
 {/* LEFT COLUMN: Newspaper Article Block */}
 <div className="flex-[1.2] flex flex-col relative w-full group transition-all duration-500">
 
 <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 sm:p-10 md:p-12 flex flex-col relative">
 
 {/* Stamp */}
 <div className="absolute top-6 right-6 border-4 border-red-800 text-red-800 font-playfair font-black text-xl p-1 px-3.5 rotate-[14deg] uppercase tracking-widest select-none opacity-85 z-20">
 UNCLASSIFIED
 </div>

 {/* Headline */}
 <div className="border-b-4 border-double border-stone-950 pb-3 mb-6 relative z-10 text-center">
 <span className="font-mono text-[9px] text-stone-500 font-bold uppercase tracking-widest">
 ARCHIVE DISPATCH // METASPHERE EDITORIAL
 </span>
 <h2 className="font-playfair font-black text-2xl sm:text-4xl text-stone-950 uppercase tracking-tight leading-none mt-1">
 COGNITIVE NETWORK DEPLOYED
 </h2>
 </div>
 
 {/* Columns */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 flex-1">
 
 <div className="newspaper-column text-stone-900 font-serif text-sm leading-relaxed text-justify">
 The Metasphere Chronicles has successfully mounted a direct AI teletype connection. Using state-of-the-art LLM capabilities via Google Gemini, our news desk allows administrators to draft high-quality reports about global anomalies, compiler glitches, and cybermatic updates instantly.
 <br/><br/>
 All dispatches conform strictly to our digital database schema, preserving indexing coordinates and urgency levels for real-time synchronization.
 </div>

 <div className="newspaper-column text-stone-900 font-serif text-sm leading-relaxed text-justify md:border-l md:border-stone-400/80 md:pl-6">
 To access the news wire controls, authorize your operative credentials. Please use the secure override deck provided on the right panel.
 <br/><br/>
 <span className="font-bold">DECRYPTED TELEGRAPH:</span>
 <div className="mt-2 flex items-center gap-3">
 <button 
 onClick={() => setIsDecrypted(!isDecrypted)}
 className="vintage-stamp text-[10px] py-1.5 font-bold cursor-pointer"
 >
 {isDecrypted ? "HIDE TRANSIT KEY" : "DECRYPT SYSTEM KEY"}
 </button>
 </div>
 
 <div className="mt-4 font-mono text-[10px] bg-[#dcd7c9]/50 p-2.5 border border-stone-400 relative overflow-hidden text-left">
 <span className="text-[9px] text-stone-600 font-bold uppercase block mb-1">
 [ CRYPTOGRAPHIC CIPHER ]
 </span>
 <span className={`transition-all duration-500 font-bold tracking-wider ${isDecrypted ? "text-stone-950" : "bg-stone-950 text-stone-950 select-none cursor-help"}`}>
 {isDecrypted ? "SECURITY TOKEN: VERIFIED_GRID_ACCESS" : "████████████████████████████████"}
 </span>
 </div>
 </div>

 </div>

 {/* Footer */}
 <div className="mt-8 pt-3 border-t border-dashed border-stone-400 flex justify-between items-center text-[9px] font-mono text-stone-600 relative z-10">
 <span>WIRE SYSTEM IDENTITY: THE DAILY NEXUS</span>
 <span>SECURED STORAGE</span>
 </div>
 </div>
 </div>

 {/* RIGHT COLUMN: The Telemetry override box */}
 <div className="flex-1 flex flex-col relative w-full group">
 
 <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 sm:p-8 flex flex-col h-full min-h-[500px] scanline relative overflow-hidden">
 
 <div className="flex justify-between items-center border-b-2 border-stone-950 pb-3 mb-6">
 <div className="flex items-center gap-2">
 <span className="w-2.5 h-2.5 bg-red-800 rounded-full animate-pulse"></span>
 <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black">
 OPERATIVE ENTRY
 </h3>
 </div>
 <span className="font-mono text-[9px] text-stone-650 font-bold uppercase tracking-widest animate-pulse">
 SYS.ONLINE
 </span>
 </div>

 {/* Telemetry info */}
 <div className="flex-1 flex flex-col gap-4 text-xs text-stone-850 text-left">
 
 <div className="flex justify-between items-center border-b border-stone-300 pb-1.5">
 <span className="font-mono uppercase text-stone-500 font-bold">PRESS STATUS</span>
 <span className={`font-mono font-bold uppercase tracking-wider text-[10px] ${serverHealth?.status === "ok" ? "text-green-800" : "text-red-700 animate-pulse"}`}>
 {serverHealth ? `${serverHealth.status.toUpperCase()}` : "SCANNING..."}
 </span>
 </div>

 <div className="flex justify-between items-center border-b border-stone-300 pb-1.5">
 <span className="font-mono uppercase text-stone-500 font-bold">CLIENT SYSTEM</span>
 <span className="font-mono text-stone-900 font-bold">{clientInfo?.os || "DETERMINING..."}</span>
 </div>

 <div className="flex justify-between items-center border-b border-stone-300 pb-1.5">
 <span className="font-mono uppercase text-stone-500 font-bold">BROWSER</span>
 <span className="font-mono text-stone-800 tracking-wider truncate max-w-[130px]">{clientInfo?.browser || "EXTRACTING..."}</span>
 </div>

 <div className="flex justify-between items-center border-b border-stone-300 pb-1.5">
 <span className="font-mono uppercase text-stone-500 font-bold">OPERATIVE IP</span>
 <span className="font-mono text-red-900 font-bold tracking-wider">{clientInfo?.ip || "SCANNING..."}</span>
 </div>

 <div className="flex flex-col gap-1.5 mt-4 p-3 amber-terminal scanline relative overflow-hidden">
 <span className="text-[9px] font-mono uppercase tracking-widest font-bold">WIRE DESPATCH FEED LOG</span>
 <div className="font-mono text-[10px] leading-relaxed space-y-0.5">
 <div>&gt;&gt; TELETYPE DECK ONLINE... OK</div>
 <div>&gt;&gt; ESTABLISHING ACCESS CORRIDORS...</div>
 <div>&gt;&gt; ACCESS LOGS ARMED...</div>
 </div>
 </div>
 </div>

 {/* Glowing Handshake Action Button */}
 <div className="mt-8 pt-4 border-t border-stone-300">
 <Link 
 href={isAuthenticated ? "/dashboard" : "/login"}
 className="vintage-stamp w-full flex items-center justify-center py-4 bg-transparent border-2 border-stone-950 font-playfair font-black text-base uppercase tracking-widest text-center hover:bg-stone-950 hover:text-[#fcfaf2] transition-colors"
 >
 {isAuthenticated === null ? "CHECKING AUTHORIZATION..." : "ENTER WIRE CONSOLE"}
 </Link>
 </div>

 </div>
 </div>

 </div>
 
 </div>
 );
}








