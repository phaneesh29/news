"use client";

import { API_BASE_URL } from "../config";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [serverHealth, setServerHealth] = useState<any>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status
    fetch(`${API_BASE_URL}/auth/profile`, { credentials: "include" })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false));

    fetch(`${API_BASE_URL}/health`)
      .then((res) => res.json())
      .then((data) => {
        setServerHealth(data);
        if (data.ip) {
          setClientInfo((prev: any) => prev ? { ...prev, ip: data.ip } : { os: "Unknown", browser: "Unknown", ip: data.ip });
        }
      })
      .catch(() => setServerHealth({ status: "UNREACHABLE", timestamp: new Date() }));

    const ua = window.navigator.userAgent;
    const os = ua.indexOf("Win") !== -1 ? "Windows" 
      : ua.indexOf("Mac") !== -1 ? "MacOS" 
      : ua.indexOf("Linux") !== -1 ? "Linux" 
      : "Unknown";
    
    let browser = "Unknown";
    if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    setClientInfo({
      os,
      browser,
      ip: "Undisclosed"
    });
  }, []);

  // Today's Date formatted nicely
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen w-screen bg-[#f5f2e9] text-[#111111] font-serif p-4 sm:p-8 md:p-12 overflow-x-hidden selection:bg-black selection:text-white">
      <div className="max-w-[1200px] mx-auto bg-[#fcfaf2] border border-[#d3c7b3] shadow-xl p-6 sm:p-10 relative">
        
        {/* TOP METADATA ROW */}
        <div className="flex justify-between items-center text-xs sm:text-sm border-b-2 border-black pb-2 mb-4 font-bold uppercase tracking-widest">
          <span>"Internal Administrative Control"</span>
          <span className="hidden sm:inline bg-black text-white px-2 py-0.5">STAFF & EDITORS ONLY</span>
          <span>Clearance Level: Maximum</span>
        </div>

        {/* NEWSPAPER TITLE */}
        <header className="text-center border-b-[6px] border-double border-black pb-6 mb-2">
          <h1 className="font-['UnifrakturMaguntia',_Georgia,_serif] text-5xl sm:text-7xl md:text-8xl lg:text-[110px] leading-none mb-2 tracking-tight">
            Dev Bits
          </h1>
          <div className="flex justify-between items-center text-xs sm:text-sm font-bold uppercase border-y border-black py-1 px-2 mt-4 tracking-wider">
            <span>VOL. CLXV... No. 57,011</span>
            <span>{today}</span>
            <span>TWO CENTS</span>
          </div>
        </header>

        {/* MAIN CONTENT COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          
          {/* LEFT COLUMN: Main Articles */}
          <div className="md:col-span-8 flex flex-col gap-6 border-b md:border-b-0 md:border-r border-black pr-0 md:pr-6">
            
            {/* Lead Story */}
            <article>
              <h2 className="font-['Playfair_Display',_Georgia,_serif] text-3xl sm:text-5xl font-black uppercase leading-[0.95] mb-4 text-center tracking-tighter">
                CENTRAL EDITORIAL<br/> COMMAND & OVERSIGHT
              </h2>
              <div className="flex justify-center items-center gap-4 mb-4">
                <span className="h-[1px] bg-black flex-1"></span>
                <span className="font-bold text-sm uppercase tracking-widest">Administrator's Desk</span>
                <span className="h-[1px] bg-black flex-1"></span>
              </div>
              
              <div className="columns-1 sm:columns-2 gap-6 text-justify text-[15px] leading-relaxed">
                <p className="mb-4">
                  <span className="float-left text-6xl leading-[0.8] font-['Playfair_Display',_Georgia,_serif] font-black pr-2 pt-1">T</span>his secure terminal serves as the central administrative hub for the entire Dev Bits publication network. From this vantage point, managing editors and senior administrators wield absolute control over the flow of information, journalist assignments, and global content distribution.
                </p>
                <p className="mb-4">
                  The infrastructure currently routed through this node connects directly to the master database. Authorized personnel may review pending drafts, revoke journalistic credentials, and monitor live reader telemetry. Any modifications made from this terminal are final and immediately reflected in the public printing presses.
                </p>
                <p className="mb-4">
                  "Dev Bits is not merely a recorder of events, but the very engine that drives the public discourse," a memo from the Publisher reads. "It is the sworn duty of the Administration to ensure that this engine runs smoothly, accurately, and without interruption." 
                </p>
                <p className="mb-4">
                  Access to the inner sanctum is strictly regulated. If you are not a verified member of the editorial or administrative staff, you must disconnect immediately. All interactions with this console are logged, tracked, and subject to routine audit.
                </p>
              </div>
            </article>

            <hr className="border-t-[3px] border-black my-2" />

            {/* Secondary Story */}
            <article>
              <h3 className="font-['Playfair_Display',_Georgia,_serif] text-2xl font-bold uppercase mb-2">
                System Advisory
              </h3>
              <p className="text-justify text-[14px] leading-relaxed mb-4">
                Notice: The user telemetry and content distribution engines are currently running at full capacity. Administrators are reminded to file their daily moderation logs before the evening press run. Failure to do so may result in account suspension.
              </p>
            </article>

          </div>

          {/* RIGHT COLUMN: Sidebar, Telegraph Status & Login */}
          <div className="md:col-span-4 flex flex-col gap-6">
            
            {/* TELEGRAPH OFFICE / LOGIN BOX */}
            <div className="border-[3px] border-black p-4 bg-[#f4edd8]">
              <h3 className="font-['Playfair_Display',_Georgia,_serif] text-xl font-black uppercase text-center border-b-2 border-black pb-2 mb-4 tracking-wide">
                Staff Authentication
              </h3>
              
              <p className="text-sm text-center mb-6 italic leading-relaxed">
                To access the editorial dashboard and moderation tools, present your admin credentials below.
              </p>

              <Link 
                href={isAuthenticated ? "/dashboard" : "/login"}
                className="block w-full text-center border-2 border-black py-3 font-bold uppercase tracking-widest bg-black text-[#fcfaf2] hover:bg-transparent hover:text-black transition-colors duration-300"
              >
                {isAuthenticated === null ? "Verifying..." : isAuthenticated ? "Enter Dashboard" : "Admin Login"}
              </Link>
            </div>

            {/* TELEMETRY / METEOROLOGICAL REPORT (Client Info) */}
            <div>
              <h4 className="font-bold uppercase text-lg border-b border-black mb-3">
                Telegraph & Station Report
              </h4>
              <ul className="text-sm space-y-3 font-mono">
                <li className="flex justify-between border-b border-black/20 pb-1">
                  <strong>Wire Status:</strong> 
                  <span className={serverHealth?.status === "ok" ? "text-black" : "text-gray-500 italic"}>
                    {serverHealth ? (serverHealth.status === "ok" ? "OPERATIONAL" : "DISRUPTED") : "CHECKING..."}
                  </span>
                </li>
                <li className="flex justify-between border-b border-black/20 pb-1">
                  <strong>Origin Machine:</strong> 
                  <span>{clientInfo?.os || "Unknown"}</span>
                </li>
                <li className="flex justify-between border-b border-black/20 pb-1">
                  <strong>Viewing Glass:</strong> 
                  <span>{clientInfo?.browser || "Unknown"}</span>
                </li>
                <li className="flex justify-between border-b border-black/20 pb-1">
                  <strong>Station Code:</strong> 
                  <span>{clientInfo?.ip || "Pending"}</span>
                </li>
              </ul>
            </div>

            {/* ADVERTISEMENT PLACEHOLDER */}
            <div className="mt-auto border-2 border-dashed border-black p-4 text-center">
              <h5 className="font-['Playfair_Display',_Georgia,_serif] font-bold text-xl uppercase mb-2">
                Miracle Tonic!
              </h5>
              <p className="text-xs">
                Cures fatigue, lethargy, and modern nervous exhaustion. Available at all fine apothecaries. 
              </p>
              <p className="text-xs font-bold mt-2 uppercase">Only 5 Cents a Bottle!</p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
