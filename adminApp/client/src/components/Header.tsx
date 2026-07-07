"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../config";

interface HeaderProps {
  profile: {
    email: string;
    role: string;
  } | null;
  systemTime?: string;
  activeTab: "news" | "blogs" | "docs" | "digest" | "feedback" | "settings";
}

export default function Header({ profile, systemTime, activeTab }: HeaderProps) {
  const router = useRouter();
  const isAdmin = profile?.role === "admin";

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-955 pt-6 pb-4 mb-6 relative z-10">
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2 px-4 sm:px-6 md:px-8">
        <div className="flex flex-col text-center md:text-left">
          <Link href="/dashboard" className="font-['UnifrakturMaguntia',_Georgia,_serif] text-6xl sm:text-7xl drop-shadow-sm tracking-tight text-black select-none hover:opacity-80 border-b-4 border-double border-black transition-opacity pb-1 leading-none">
            Dev Bits
          </Link>
          <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-2 uppercase font-bold">
            EDITORIAL DESK • STAFF ID: <span className="text-black">{profile?.email}</span> ({profile?.role?.toUpperCase()})
          </span>
        </div>

        {/* Nav Deck Links */}
        <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-stone-200/50 px-4 py-2 border border-stone-400/50 rounded">
          <Link 
            href="/dashboard" 
            className={`transition-colors ${activeTab === "news" ? "text-stone-900 border-b border-stone-900 font-black border-b-2 border-red-850 pb-0.5" : "text-stone-700 hover:text-stone-955"}`}
          >
            &gt; News Feed
          </Link>
          <span className="text-stone-400">|</span>
          <Link 
            href="/blogs" 
            className={`transition-colors ${activeTab === "blogs" ? "text-stone-900 border-b border-stone-900 font-black border-b-2 border-red-850 pb-0.5" : "text-stone-750 hover:text-stone-955"}`}
          >
            &gt; Blogs Feed
          </Link>
          <span className="text-stone-400">|</span>
          <Link 
            href="/docs" 
            className={`transition-colors ${activeTab === "docs" ? "text-stone-900 border-b border-stone-900 font-black border-b-2 border-red-850 pb-0.5" : "text-stone-750 hover:text-stone-955"}`}
          >
            &gt; Docs Feed
          </Link>
          <span className="text-stone-400">|</span>
          <Link 
            href="/digest" 
            className={`transition-colors ${activeTab === "digest" ? "text-stone-900 border-b border-stone-900 font-black border-b-2 border-red-850 pb-0.5" : "text-stone-750 hover:text-stone-955"}`}
          >
            &gt; Digest Wire
          </Link>
          {isAdmin && (
            <>
              <span className="text-stone-400">|</span>
              <Link 
                href="/feedback" 
                className={`transition-colors ${activeTab === "feedback" ? "text-stone-900 border-b border-stone-900 font-black border-b-2 border-red-850 pb-0.5" : "text-stone-700 hover:text-stone-955"}`}
              >
                &gt; User Feedback
              </Link>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {isAdmin && (
            <Link 
              href="/settings"
              className={`font-mono text-[10px] sm:text-xs border-2 border-black px-3 py-1.5 transition-all uppercase tracking-widest flex items-center font-bold ${activeTab === "settings" ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"}`}
            >
              Oversight Board
            </Link>
          )}
          <button 
            onClick={handleLogout}
            className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-white px-3 py-1.5 hover:bg-black hover:text-white transition-all uppercase tracking-widest flex items-center font-bold cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Newspaper Subheader bar */}
      <div className="w-full flex justify-between items-center border-t border-stone-850 pt-2 text-[10px] font-mono uppercase text-stone-700 tracking-wider px-4 sm:px-6 md:px-8">
        <span>VOL. CXXVI... No. 47190</span>
        <span className="font-bold text-stone-955">{systemTime || "[ RETRIEVING TIME ]"}</span>
        <span>PRICE: 10 CENTS</span>
      </div>
    </header>
  );
}
