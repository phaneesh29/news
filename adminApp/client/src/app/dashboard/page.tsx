"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [whitelist, setWhitelist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState("");
  const [whitelistStatus, setWhitelistStatus] = useState({ type: "", msg: "" });
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, sessionsRes, whitelistRes] = await Promise.all([
          fetch("http://localhost:8000/api/auth/profile", { credentials: "include" }),
          fetch("http://localhost:8000/api/auth/sessions", { credentials: "include" }),
          fetch("http://localhost:8000/api/whitelist", { credentials: "include" })
        ]);

        if (!profileRes.ok) {
          router.push("/login");
          return;
        }

        const profileData = await profileRes.json();
        const sessionsData = await sessionsRes.json();
        const whitelistData = whitelistRes.ok ? await whitelistRes.json() : { emails: [] };

        setProfile(profileData.user);
        setSessions(sessionsData.sessions || []);
        setWhitelist(whitelistData.emails || []);
      } catch (err) {
        console.error("Dashboard fetch error", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/logout", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await fetch("http://localhost:8000/api/auth/sessions/revoke-all", { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setWhitelistStatus({ type: "loading", msg: "OVERRIDING MAINFRAME..." });

    try {
      const res = await fetch("http://localhost:8000/api/whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setWhitelistStatus({ type: "success", msg: "CLEARANCE GRANTED" });
        setWhitelist((prev) => [...prev, { email: data.email, id: Math.random(), createdAt: new Date() }]);
        setNewEmail("");
        setTimeout(() => setWhitelistStatus({ type: "", msg: "" }), 3000);
      } else {
        setWhitelistStatus({ type: "error", msg: data.error || "ACCESS DENIED" });
      }
    } catch (err) {
      setWhitelistStatus({ type: "error", msg: "FATAL ERROR" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#0a0a0a] flex items-center justify-center font-mono text-emerald-500 text-2xl animate-pulse">
        [ DECRYPTING_DOSSIER... ]
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col p-4 sm:p-6 overflow-hidden relative selection:bg-emerald-500/30 selection:text-emerald-200 text-white font-sans">
      
      {/* Insane Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_10%,transparent_100%)]"></div>
      
      {/* Ambient glowing orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto w-full">
        <div>
          <h1 className="font-mono text-3xl sm:text-4xl font-black text-white tracking-widest uppercase">
            CENTRAL <span className="text-emerald-500">COMMAND</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleLogout}
            className="font-mono text-xs sm:text-sm border border-red-500/50 text-red-500 px-4 py-2 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]"
          >
            Abort Session
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10 max-w-[1600px] mx-auto w-full h-full pb-4">
        
        {/* TILE 1: Agent Dossier (Analog Feel) */}
        <div className="lg:col-span-1 lg:row-span-2 flex flex-col relative group perspective-[1000px] h-full">
          <div className="absolute -inset-2 bg-[#d4b886] rounded-sm transform rotate-[-1deg] shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-[#b89b65] pointer-events-none transition-transform duration-700">
            <div className="absolute top-0 right-8 w-32 h-8 bg-[#d4b886] border-t border-l border-r border-[#b89b65] -translate-y-[99%] rounded-t-md shadow-inner"></div>
          </div>

          <div className="bg-[#f4ebd8] p-6 sm:p-8 shadow-[inset_0_0_40px_rgba(139,90,43,0.1)] border border-[#e3d3b6] transform rotate-1 transition-all duration-700 hover:rotate-0 flex flex-col h-full relative z-10 overflow-y-auto custom-scrollbar">
            <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+CjxwYXRoIGQ9Ik0wIDBoNHYxSDB6bTAgMmg0djFIMHoiIGZpbGw9IiNlNWU1ZTUiIGZpbGwtb3BhY2l0eT0iLjQiLz4KPC9zdmc+')]"></div>
            
            <div className="absolute top-4 left-4 border-4 border-red-800 text-red-800 font-serif font-bold text-lg px-2 transform -rotate-[10deg] mix-blend-multiply">
              VERIFIED
            </div>

            <div className="mt-10 border-b-2 border-black pb-4 mb-6">
              <h2 className="font-serif text-3xl font-black text-black leading-none uppercase">Agent Profile</h2>
              <p className="font-mono text-xs font-bold text-gray-600 mt-2 truncate">ID: {profile?.id || "UNKNOWN"}</p>
            </div>

            <div className="space-y-6 font-serif text-lg text-black">
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 font-mono tracking-widest">Operative Email</p>
                <p className="text-xl font-black border-b border-dashed border-gray-400 pb-1 break-all">{profile?.email || "REDACTED"}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 font-mono tracking-widest">Clearance Level</p>
                <p className="text-lg font-bold border-b border-dashed border-gray-400 pb-1">OMEGA (Full Access)</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-gray-500 font-mono tracking-widest">Account Created</p>
                <p className="text-base border-b border-dashed border-gray-400 pb-1">{profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : "UNKNOWN"}</p>
              </div>
            </div>

            {/* Paper clip */}
            <div className="absolute -top-3 right-12 w-4 h-16 border-[3px] border-gray-400 rounded-full transform rotate-[25deg] shadow-md z-30 bg-gradient-to-b from-gray-300 to-gray-500 hidden sm:block"></div>
          </div>
        </div>

        {/* TILE 2: Active Links Terminal (Cyber Feel) */}
        <div className="lg:col-span-2 lg:row-span-1 flex flex-col relative group min-h-[250px] lg:min-h-0">
          <div className="absolute -inset-[1px] bg-gradient-to-br from-emerald-500/50 to-transparent rounded-2xl opacity-30 group-hover:opacity-100 blur-[2px] transition-opacity duration-700"></div>

          <div className="bg-[#050505]/95 backdrop-blur-3xl border border-emerald-500/20 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,255,100,0.05)] flex flex-col h-full relative z-20 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 animate-[scan_3s_ease-in-out_infinite] shadow-[0_0_15px_rgba(16,185,129,1)] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
              <h3 className="font-mono text-xl text-white uppercase tracking-[0.2em] font-bold flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-pulse"></span>
                Active Neural Links
              </h3>
              <button 
                onClick={handleRevokeAll}
                className="font-mono text-xs border border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-2 py-1 transition-colors tracking-widest uppercase"
              >
                EXECUTE GLOBAL PURGE
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {sessions.map((session: any, idx: number) => (
                <div key={session.id} className="bg-white/5 border border-white/10 p-3 rounded-lg flex flex-col sm:flex-row justify-between gap-4 hover:border-emerald-500/50 hover:bg-white/10 transition-all group/sess">
                  <div className="font-mono text-sm">
                    <div className="text-emerald-400 font-bold mb-1 tracking-widest">
                      SESSION_{idx + 1} {session.isCurrent && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 ml-2 border border-emerald-500/30">CURRENT</span>}
                    </div>
                    <div className="text-gray-400 text-xs">IP: <span className="text-gray-200">{session.ipAddress || "UNKNOWN"}</span></div>
                  </div>
                  <div className="font-mono text-xs text-right flex flex-col justify-between">
                    <div className="text-gray-500">EXPIRES: {new Date(session.expiresAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center font-mono text-gray-500 py-6 tracking-widest">NO ACTIVE LINKS DETECTED</div>
              )}
            </div>
            
          </div>
        </div>

        {/* TILE 3: Whitelist Manager (Hacker Cybermag Vibes) */}
        <div className="lg:col-span-2 lg:row-span-1 flex flex-col relative group min-h-[300px] lg:min-h-0">
          {/* Cybermag brutalist background */}
          <div className="bg-[#111] border-4 border-red-800 p-6 shadow-[8px_8px_0_#7f1d1d] transform rotate-[-0.5deg] flex flex-col h-full relative z-20 overflow-hidden transition-transform duration-500 hover:rotate-0">
            
            {/* Magazine header style */}
            <div className="flex justify-between items-end border-b-4 border-red-800 pb-2 mb-4 relative z-10">
              <h2 className="font-playfair text-3xl font-black text-red-600 uppercase tracking-tighter leading-none">
                Clearance <span className="text-white">Registry</span>
              </h2>
              <span className="font-vt323 text-gray-400 text-lg">:: AUTH_PROTOCOL_99</span>
            </div>

            <div className="flex-1 flex flex-col sm:flex-row gap-6 relative z-10 min-h-0">
              
              {/* Add Email Form */}
              <div className="w-full sm:w-1/2 flex flex-col">
                <p className="font-courier text-sm text-gray-300 mb-4 font-bold">
                  Enter operative email to grant localized mainframe access. Once added, target may initialize handshake.
                </p>
                <form onSubmit={handleAddWhitelist} className="flex flex-col gap-4 mt-auto">
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="OPERATIVE@..."
                    className="bg-black border-2 border-red-800/50 text-red-500 p-3 font-mono text-lg outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.5)] placeholder-red-900 transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={whitelistStatus.type === "loading"}
                    className="bg-red-800 text-white font-old-standard font-black text-xl uppercase py-2 hover:bg-red-600 shadow-[4px_4px_0_#000] active:shadow-[0_0_0_#000] active:translate-y-1 active:translate-x-1 transition-all disabled:opacity-50"
                  >
                    Authorize Identity
                  </button>
                  {whitelistStatus.msg && (
                    <div className={`font-mono text-xs uppercase text-center font-bold ${whitelistStatus.type === "error" ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                      &gt;&gt; {whitelistStatus.msg}
                    </div>
                  )}
                </form>
              </div>

              {/* Whitelisted Emails List */}
              <div className="w-full sm:w-1/2 bg-black border border-red-900/50 p-4 flex flex-col overflow-hidden relative">
                {/* Scanline over the list */}
                <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
                
                <h4 className="font-vt323 text-red-600 text-xl border-b border-red-900/50 pb-1 mb-3">AUTHORIZED_IDENTITIES</h4>
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2 relative z-10">
                  {whitelist.map((w) => (
                    <div key={w.id} className="font-mono text-sm text-gray-300 flex justify-between items-center group/wl hover:bg-red-900/20 px-2 py-1">
                      <span className="truncate">{w.email}</span>
                      <span className="text-[10px] text-red-700 opacity-0 group-hover/wl:opacity-100 transition-opacity">OK</span>
                    </div>
                  ))}
                  {whitelist.length === 0 && (
                    <div className="text-gray-600 font-mono text-sm">NO IDENTITIES FOUND</div>
                  )}
                </div>
              </div>

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
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.8);
        }
      `}} />
    </div>
  );
}
