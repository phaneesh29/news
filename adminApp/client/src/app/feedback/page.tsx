"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";

interface FeedbackItem {
  id: string;
  email: string;
  message: string;
  createdAt: string;
}

export default function FeedbackPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [systemTime, setSystemTime] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "TELETYPE_INIT: Mounting feedback wire...",
    "WIRE: Awaiting secure feedback decryption...",
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setTerminalLogs((prev) => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const fetchFeedbacks = async () => {
    try {
      setFetchLoading(true);
      addLog("WIRE: Requesting secure feedback payload from main server...");
      const res = await fetch(`${API_BASE_URL}/feedback`, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 403) {
          addLog("SECURITY_ALERT: Unauthorized access attempt blocked");
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to fetch feedbacks");
      }
      const data = await res.json();
      setFeedbacks(data.feedbacks || []);
      addLog(`WIRE: Decrypted ${data.feedbacks?.length || 0} user feedback packets`);
    } catch (err) {
      console.error("Fetch feedbacks error:", err);
      addLog("WARNING: Feed decryption timed out or connection failed");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/profile`, { credentials: "include" });
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        if (data.user.role !== "admin") {
          router.push("/dashboard");
          return;
        }
        setProfile(data.user);
        addLog(`AUTH: Administrative clearance key: VERIFIED`);
        
        // Fetch feedbacks after validating admin status
        fetchFeedbacks();
      } catch (err) {
        console.error("Dashboard auth check error", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

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
      addLog("AUTH: Purging administrative session credentials...");
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-playfair text-stone-900 text-2xl animate-pulse">
        [ CALIBRATING TELETYPES & SHIELDING CORRIDORS... ]
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-red-800/10 selection:text-stone-950 text-stone-900 font-serif">
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>

      {/* Header HUD - Traditional Newspaper style Banner */}
      <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-950 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          
          <div className="flex flex-col text-center md:text-left">
            <Link href="/dashboard" className="font-blackletter text-4xl sm:text-5xl font-normal drop-shadow-sm tracking-tight text-stone-950 uppercase select-none hover:text-stone-900 border-b border-stone-900 transition-colors">
              THE DAILY <span className="text-stone-900 border-b border-stone-900">NEXUS</span>
            </Link>
            <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-1 uppercase">
              WIRE SERVICE  •  ADMINISTRATOR DECK: <span className="font-bold text-stone-900">{profile?.email}</span>
            </span>
          </div>

          {/* Nav Deck Links */}
          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-stone-200/50 px-4 py-2 border border-stone-400/50 rounded">
            <Link href="/dashboard" className="text-stone-750 hover:text-stone-950 transition-colors">&gt; News Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/blogs" className="text-stone-750 hover:text-stone-950 transition-colors">&gt; Blogs Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/feedback" className="text-stone-900 border-b-2 border-red-850 pb-0.5 font-black">&gt; User Feedback</Link>
          </div>

          <div className="flex gap-3">
            <Link 
              href="/settings"
              className="font-mono text-[10px] sm:text-xs border-2 border-stone-900 text-stone-900 bg-white px-3 py-1.5 hover:bg-stone-950 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5"
            >
              Security Deck
            </Link>
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
          <span> clearance level: admin </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 max-w-[1600px] mx-auto w-full pb-8">
        
        {/* Feedback List (Left 2 Columns) */}
        <div className="lg:col-span-2 flex flex-col relative w-full">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 rounded">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b-4 border-stone-950 pb-3 mb-6">
              <div>
                <h2 className="font-blackletter text-4xl sm:text-5xl font-normal text-stone-950 uppercase tracking-tighter leading-none select-none text-left">
                  USER <span className="text-stone-900 border-b border-stone-900">FEEDBACK</span>
                </h2>
                <div className="font-mono text-[10px] text-stone-600 tracking-wider mt-2 uppercase">
                  incoming dispatches & communications
                </div>
              </div>
              <button 
                onClick={fetchFeedbacks}
                className="vintage-stamp text-xs px-3.5 py-1.5 font-mono cursor-pointer"
                disabled={fetchLoading}
              >
                {fetchLoading ? "SYNCING..." : "POLL DISPATCHES"}
              </button>
            </div>

            {/* List */}
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {feedbacks.length > 0 ? (
                feedbacks.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white border-2 border-stone-950 p-5 shadow flex flex-col gap-3 relative text-left rounded hover:bg-stone-50 transition-colors"
                  >
                    {/* Top Row details */}
                    <div className="flex flex-wrap justify-between items-center border-b border-stone-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] bg-red-800 text-white px-2 py-0.5 rounded tracking-wide uppercase font-bold">
                          DISPATCH
                        </span>
                        <span className="font-mono text-xs text-stone-900 font-bold">
                          {item.email}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-stone-500">
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Feedback Message */}
                    <p className="font-serif text-stone-950 leading-relaxed whitespace-pre-wrap text-sm pt-1 italic">
                      "{item.message}"
                    </p>

                    {/* Metadata bottom row */}
                    <div className="text-[9px] font-mono text-stone-500 text-right mt-1 pt-1 border-t border-dashed border-stone-200">
                      ID: {item.id}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-12 h-12 text-stone-400 mb-4">
                    <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="font-playfair text-stone-800 text-lg font-black uppercase">
                    No Feedback Available
                  </h3>
                  <p className="font-serif text-sm text-stone-600 max-w-sm leading-relaxed mt-2">
                    There are no user feedback submissions registered on this system.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Live Logs & Telemetry panel (Right 1 Column) */}
        <div className="flex flex-col gap-6 relative w-full">
          {/* Telemetry log system */}
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 flex flex-col relative z-10 scanline overflow-hidden shadow-sm rounded">
            <div className="border-b-2 border-stone-950 pb-3 mb-5">
              <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black">
                FEEDBACK LOG STREAM
              </h3>
              <p className="font-mono text-[9px] text-stone-500 font-bold mt-1 tracking-wider uppercase">
                Teletype print activity
              </p>
            </div>

            <div className="green-terminal scanline relative overflow-hidden p-4 font-mono text-[11px] leading-relaxed flex flex-col vintage-shadow-sm min-h-[300px]">
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 max-h-[350px]">
                {terminalLogs.map((log, index) => (
                  <div key={index} className="opacity-90 hover:opacity-100 transition-opacity">
                    &gt;&gt; {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
