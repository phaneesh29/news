"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";

export default function SettingsPage() {
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
        const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, { credentials: "include" });
        
        if (!profileRes.ok) {
          router.push("/login");
          return;
        }

        const profileData = await profileRes.json();
        
        // Strict Admin Authorization Check
        if (profileData.user.role !== "admin") {
          router.push("/dashboard");
          return;
        }

        setProfile(profileData.user);

        // Fetch other configuration data only after verifying admin role
        const [sessionsRes, whitelistRes] = await Promise.all([
          fetch(`${API_BASE_URL}/auth/sessions`, { credentials: "include" }),
          fetch(`${API_BASE_URL}/whitelist`, { credentials: "include" })
        ]);

        const sessionsData = await sessionsRes.json();
        const whitelistData = whitelistRes.ok ? await whitelistRes.json() : { emails: [] };

        setSessions(sessionsData.sessions || []);
        setWhitelist(whitelistData.emails || []);
      } catch (err) {
        console.error("Settings fetch error", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/sessions/revoke-all`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setWhitelistStatus({ type: "loading", msg: "REGISTERING CARD INDICES..." });

    try {
      const res = await fetch(`${API_BASE_URL}/whitelist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setWhitelistStatus({ type: "success", msg: "CLEARANCE REGISTERED" });
        if (data.id) {
          setWhitelist((prev) => [...prev, { email: data.email, id: data.id, createdAt: data.createdAt }]);
        }
        setNewEmail("");
        setTimeout(() => setWhitelistStatus({ type: "", msg: "" }), 3000);
      } else {
        setWhitelistStatus({ type: "error", msg: data.error || "ACCESS REGISTRY REJECTED" });
      }
    } catch (err) {
      setWhitelistStatus({ type: "error", msg: "FATAL ERROR" });
    }
  };

  const handleDeleteWhitelist = async (id: string) => {
    setWhitelistStatus({ type: "loading", msg: "WIPING CLEARANCE KEY..." });

    try {
      const res = await fetch(`${API_BASE_URL}/whitelist/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        setWhitelistStatus({ type: "success", msg: "CLEARANCE REVOKED" });
        setWhitelist((prev) => prev.filter((item) => item.id !== id));
        setTimeout(() => setWhitelistStatus({ type: "", msg: "" }), 3000);
      } else {
        setWhitelistStatus({ type: "error", msg: data.error || "REVOCATION REJECTED" });
      }
    } catch (err) {
      setWhitelistStatus({ type: "error", msg: "FATAL ERROR" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#060608] flex items-center justify-center font-mono text-emerald-400 text-2xl animate-pulse">
        [ SYSTEM_SYNCHRONIZING_SECURITY_PROTOCOL... ]
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#060608] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-emerald-500/30 selection:text-emerald-200 text-white font-mono">
      
      {/* Desk surface grid */}
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>
      
      {/* Accent lighting */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-emerald-950/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-red-950/10 rounded-full blur-[130px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-800/80 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto w-full">
        <div>
          <h1 className="font-mono text-2xl sm:text-3xl font-black text-white tracking-widest uppercase select-none">
            SECURITY <span className="text-emerald-500">DECK</span>
          </h1>
          <p className="font-mono text-[9px] text-zinc-500 tracking-wider">MAINFRAME_CONFIG // LEVEL_OMEGA</p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="font-mono text-[10px] sm:text-xs border border-emerald-500/50 text-emerald-400 px-4 py-2.5 hover:bg-emerald-500/10 transition-all uppercase tracking-widest shadow-[0_0_12px_rgba(16,185,129,0.15)] flex items-center"
          >
            &lt;&lt; Retreat to Nexus Core
          </Link>
          <button 
            onClick={handleLogout}
            className="font-mono text-[10px] sm:text-xs border border-red-500/50 text-red-500 px-4 py-2.5 hover:bg-red-500/10 transition-all uppercase tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.15)]"
          >
            Abort Session
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10 max-w-[1600px] mx-auto w-full pb-8">
        
        {/* TILE 1: Operative Dossier Binder (Left Column) */}
        <div className="lg:col-span-1 lg:row-span-2 flex flex-col relative">
          <div className="absolute inset-0 bg-[#000]/65 rounded-2xl transform translate-x-1.5 translate-y-2 pointer-events-none z-0"></div>
          
          {/* Manila tab */}
          <div className="absolute top-0 right-12 w-36 h-5 bg-[#e2c091] border-t-2 border-l border-r border-[#b89b65] -mt-5 rounded-t-lg z-0"></div>

          {/* Dossier Body */}
          <div className="bg-[#e2c091] border-2 border-[#b89b65] rounded-2xl p-6 md:p-8 shadow-[0_15px_30px_rgba(0,0,0,0.6)] flex flex-col relative z-10 text-stone-900">
            
            {/* Spine seam */}
            <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/10 to-transparent border-r border-stone-800/10"></div>

            {/* Paper clip */}
            <div className="absolute -top-3 right-10 w-4 h-16 bg-gradient-to-b from-stone-400 to-stone-500 border border-stone-600 rounded-full transform rotate-[25deg] shadow z-30 pointer-events-none"></div>

            {/* Inner Parchment Sheet */}
            <div className="flex-1 bg-[#f4ecd8] border border-stone-300 rounded shadow-[inset_0_0_20px_rgba(139,90,43,0.15)] flex flex-col p-6 sm:p-8 font-serif">
              
              {/* Coffee Stain */}
              <div className="coffee-stain top-2 left-2 w-20 h-20 opacity-30"></div>
              
              <div className="absolute top-4 right-4 border-2 border-red-800 text-red-800 font-bold text-xs px-2 transform -rotate-[10deg] mix-blend-multiply select-none">
                VERIFIED ACCESS
              </div>

              <div className="mt-8 border-b-2 border-stone-900 pb-3 mb-6">
                <h2 className="font-playfair text-xl sm:text-2xl font-black leading-tight uppercase">OPERATIVE DOSSIER</h2>
                <p className="font-mono text-[9.5px] font-bold text-stone-600 mt-2 truncate">DATABASE ID: {profile?.id || "UNKNOWN"}</p>
              </div>

              {/* Bio Grid */}
              <div className="space-y-6">
                
                {/* Visual placeholder for operative surveillance photo */}
                <div className="w-32 h-36 bg-stone-300 border-2 border-stone-800/40 p-1 mx-auto relative transform -rotate-1 shadow-sm">
                  <div className="w-full h-full bg-stone-950/20 flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Visual silhouette */}
                    <div className="w-16 h-16 bg-stone-950/60 rounded-full absolute bottom-2"></div>
                    <div className="w-8 h-8 bg-stone-950/60 rounded-full absolute top-8"></div>
                    <div className="absolute top-1 right-2 text-[8px] font-mono text-stone-600 uppercase font-black">OP_PHOTO</div>
                  </div>
                </div>

                <div className="border-t border-dashed border-stone-400 pt-4 space-y-4">
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-stone-500 font-mono tracking-widest">Operative Email ID</span>
                    <span className="text-[14.5px] font-bold text-stone-950 pb-1 break-all font-serif">{profile?.email || "REDACTED"}</span>
                  </div>
                  
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-stone-500 font-mono tracking-widest">Mainframe clearance</span>
                    <span className="text-[13px] font-bold text-stone-950 uppercase font-serif">{profile?.role || "OPERATIVE"} (OMEGA LEVEL)</span>
                  </div>
                  
                  <div>
                    <span className="block text-[8px] uppercase font-bold text-stone-500 font-mono tracking-widest">Handshake initialization</span>
                    <span className="text-xs text-stone-900 font-serif">{profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : "UNKNOWN"}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* TILE 2: Live Synapse Tethers (Sessions) */}
        <div className="lg:col-span-2 flex flex-col relative">
          <div className="absolute inset-0 bg-[#000]/65 rounded-2xl transform translate-x-1.5 translate-y-2 pointer-events-none z-0"></div>

          <div className="bg-[#050508]/95 backdrop-blur-3xl border border-emerald-500/20 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(0,255,100,0.06)] flex flex-col relative z-10">
            
            {/* Dynamic Sweep Scanline */}
            <div className="scanline-sweep absolute top-0 left-0 right-0 pointer-events-none z-20"></div>

            <div className="flex justify-between items-center mb-4 border-b border-zinc-800/80 pb-3">
              <h3 className="font-mono text-sm sm:text-base text-white uppercase tracking-[0.15em] font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse rounded-sm"></span>
                ACTIVE SYNAPSE TETHERS
              </h3>
              <button 
                onClick={handleRevokeAll}
                className="font-mono text-[9px] border border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-2 py-1 transition-colors tracking-wider uppercase font-bold"
              >
                TERMINATE LINKS
              </button>
            </div>

            {/* Sessions Tethers feed list */}
            <div className="space-y-3 pr-2">
              {sessions.map((session: any, idx: number) => (
                <div key={session.id} className="bg-black/55 border border-zinc-850 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-emerald-500/30 transition-all">
                  <div>
                    <div className="text-emerald-400 text-xs font-bold tracking-widest flex items-center gap-2">
                      NODE_TETHER_{idx + 1}
                      {session.isCurrent && (
                        <span className="text-[8px] bg-emerald-950/60 text-emerald-300 px-1.5 py-0.5 border border-emerald-900/40 rounded uppercase">CURRENT</span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1">IP ADDR: <span className="text-zinc-200">{session.ipAddress || "SECURE"}</span></div>
                  </div>
                  <div className="text-right text-[10px]">
                    <span className="text-zinc-500 block">EXPIRES AT:</span>
                    <span className="text-zinc-300 font-bold">{new Date(session.expiresAt).toLocaleDateString()} {new Date(session.expiresAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center font-mono text-zinc-500 py-6 tracking-widest text-xs">NO SYNAPSE LINKS DETECTED</div>
              )}
            </div>
          </div>
        </div>

        {/* TILE 3: Mainframe Access Whitelist Registry */}
        <div className="lg:col-span-2 flex flex-col relative">
          <div className="absolute inset-0 bg-[#000]/65 rounded-2xl transform translate-x-1.5 translate-y-2 pointer-events-none z-0"></div>

          <div className="bg-[#111115] border-2 border-red-950 p-6 md:p-8 shadow-[8px_8px_0_#7f1d1d] flex flex-col relative z-10">
            
            {/* Scanlines visual */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.015)_1px,transparent_1px)] bg-[size:100%_5px] pointer-events-none z-0"></div>

            <div className="flex justify-between items-end border-b-2 border-red-900/60 pb-2 mb-4 relative z-10">
              <h2 className="font-mono text-sm sm:text-base font-black text-red-500 uppercase tracking-widest">
                MAINFRAME ACCESS DECK
              </h2>
              <span className="font-mono text-zinc-500 text-[10px]">&gt;&gt; AUTH_PROTOCOL_O9</span>
            </div>

            <div className="flex flex-col gap-5 relative z-10">
              
              {/* Form card details */}
              <div className="bg-black/45 border border-zinc-900 p-4 rounded-lg">
                <p className="font-mono text-[9.5px] text-zinc-400 leading-normal mb-3 font-semibold">
                  Input coordinates to authorize operative clearance key cards.
                </p>
                <form onSubmit={handleAddWhitelist} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="OPERATIVE@DEV.NEWS..."
                    className="flex-1 bg-black border border-red-900/40 text-red-500 px-3 py-2 text-xs outline-none focus:border-red-600 placeholder-red-950 font-mono"
                  />
                  <button 
                    type="submit"
                    disabled={whitelistStatus.type === "loading"}
                    className="bg-red-800 text-stone-200 font-mono text-[10.5px] uppercase font-bold py-2 px-4 hover:bg-red-700 transition-all border border-red-900 cursor-pointer disabled:opacity-50"
                  >
                    Authorize ID
                  </button>
                </form>
                {whitelistStatus.msg && (
                  <div className={`font-mono text-[10px] uppercase text-center mt-2.5 font-bold ${whitelistStatus.type === "error" ? "text-red-500 animate-pulse" : "text-emerald-400"}`}>
                    &gt;&gt; {whitelistStatus.msg}
                  </div>
                )}
              </div>

              {/* whitelist ID cards container */}
              <div className="bg-black/70 border border-zinc-900 rounded-lg p-4 flex flex-col">
                <h4 className="font-mono text-red-500 text-[10px] border-b border-red-950 pb-1.5 mb-2.5 font-bold">
                  AUTHORIZED CLEARANCE LOG
                </h4>
                <div className="space-y-2.5">
                  {whitelist.map((w) => (
                    <div key={w.id} className="font-mono text-[11px] text-zinc-300 flex justify-between items-center group/wl hover:bg-red-950/20 px-2 py-1.5 border border-zinc-900 rounded">
                      <span className="truncate flex-1 min-w-0 mr-2">{w.email}</span>
                      <button
                        onClick={() => handleDeleteWhitelist(w.id)}
                        className="text-[9px] text-red-500 hover:text-red-400 font-bold opacity-0 group-hover/wl:opacity-100 transition-opacity border border-red-900/45 px-1.5 py-0.5 bg-black"
                      >
                        REVOKE
                      </button>
                    </div>
                  ))}
                  {whitelist.length === 0 && (
                    <div className="text-zinc-600 font-mono text-xs text-center py-6">NO ACTIVE RECORDS FOUND</div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
