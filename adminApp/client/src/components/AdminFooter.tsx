"use client";

import { useEffect, useState } from "react";
import UserIpDisplay from "./UserIpDisplay";

interface AdminFooterProps {
  statusLabel?: string;
  statusValue?: string;
}

export default function AdminFooter({ statusLabel = "Printing Engine", statusValue = "STANDBY" }: AdminFooterProps) {
  const [systemTime, setSystemTime] = useState("");

  useEffect(() => {
    setSystemTime(new Date().toLocaleTimeString("en-US", { hour12: false }) + " UTC" + (0 - new Date().getTimezoneOffset() / 60));
    const interval = setInterval(() => {
      setSystemTime(new Date().toLocaleTimeString("en-US", { hour12: false }) + " UTC" + (0 - new Date().getTimezoneOffset() / 60));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full max-w-[1600px] mx-auto mt-6 pt-3 border-t-2 border-black flex flex-wrap justify-between items-center gap-4 text-[10px] font-mono text-stone-800 z-10 px-1 font-bold">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-black font-black bg-[#fcfaf2]">
          D
        </div>
        <div>
          <span className="text-black font-black tracking-widest">DEV BITS PUBLISHING</span>
          <span className="mx-2 text-stone-400">|</span>
          <span>{statusLabel}: <span className="text-black border-b border-black font-black uppercase">{statusValue}</span></span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <span>STAFF CLEARANCE:</span>
        <span className="text-black font-black uppercase">VERIFIED ACTIVE</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span>STATION IP:</span>
        <UserIpDisplay />
      </div>

      <div className="flex items-center gap-1.5">
        <span>SYSTEM TIME:</span>
        <span className="text-black font-black">{systemTime || "[ SYSTEM STANDBY ]"}</span>
      </div>
    </footer>
  );
}
