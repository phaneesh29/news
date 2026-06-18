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
    setWhitelistStatus({ type: "loading", msg: "REGISTERING CARD INDEX..." });

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
    setWhitelistStatus({ type: "loading", msg: "REVOKING CLEARANCE KEY..." });

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
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-playfair text-stone-900 text-2xl animate-pulse">
        [ CALIBRATING TELETYPES & FEEDING WIRE PRINT... ]
      </div>
    );
  }

  return (
    <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-red-800/10 selection:text-red-950 text-stone-900 font-serif">
      
      {/* Newspaper texture noise background */}
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>

      {/* Header HUD */}
      <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-950 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          
          <div className="flex flex-col text-center md:text-left">
            <Link href="/dashboard" className="font-playfair text-3xl sm:text-4xl font-black tracking-tight text-stone-950 uppercase select-none hover:text-red-800 transition-colors">
              THE DAILY <span className="text-red-800">NEXUS</span>
            </Link>
            <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-1 uppercase">
              WIRE SERVICE  •  OPERATIVE: <span className="font-bold text-stone-900">{profile?.email}</span> ({profile?.role?.toUpperCase()})
            </span>
          </div>

          {/* Navigation Deck Links */}
          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-stone-200/50 px-4 py-2 border border-stone-400/50 rounded">
            <Link href="/dashboard" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Wire Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/settings" className="text-red-800 hover:text-red-900 transition-colors font-black border-b-2 border-red-850 pb-0.5">&gt; Security</Link>
          </div>

          <div className="flex gap-3">
            <Link 
              href="/dashboard"
              className="font-mono text-[10px] sm:text-xs border-2 border-stone-900 text-stone-900 bg-white px-3 py-1.5 hover:bg-stone-950 hover:text-white transition-all uppercase tracking-widest flex items-center gap-1.5"
            >
              Back to Core
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
          <span>SECURITY DESK SYSTEM</span>
          <span>PRICE: 10 CENTS</span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 relative z-10 max-w-[1600px] mx-auto w-full pb-8">
        
        {/* TILE 1: Operative Dossier Binder (Left Column) */}
        <div className="lg:col-span-1 lg:row-span-2 flex flex-col relative">
          
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 text-stone-900 rounded text-left">
            
            {/* Stamp */}
            <div className="absolute top-4 right-4 border-2 border-red-800 text-red-800 font-bold text-xs px-2 transform -rotate-[10deg] mix-blend-multiply select-none font-playfair uppercase">
              VERIFIED
            </div>

            {/* Inner Parchment Sheet */}
            <div className="flex-1 bg-[#fcfaf2] border border-stone-300 rounded flex flex-col p-6 sm:p-8 font-serif">
              
              {/* Coffee Stain */}
              <div className="coffee-stain top-2 left-2 w-20 h-20 opacity-30"></div>

              <div className="border-b-2 border-stone-950 pb-3 mb-6">
                <h2 className="font-playfair text-xl sm:text-2xl font-black leading-tight uppercase">OPERATIVE DOSSIER</h2>
                <p className="font-mono text-[9px] font-bold text-stone-500 mt-2 truncate">DATABASE ID: {profile?.id || "UNKNOWN"}</p>
              </div>

              {/* Bio Grid */}
              <div className="space-y-6">
                
                {/* Visual placeholder for operative surveillance photo */}
                <div className="w-32 h-36 bg-stone-100 border-2 border-stone-950 p-1 mx-auto relative transform -rotate-1 shadow-sm">
                  <div className="w-full h-full bg-stone-200 flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="w-16 h-16 bg-stone-400 rounded-full absolute bottom-2"></div>
                    <div className="w-8 h-8 bg-stone-400 rounded-full absolute top-8"></div>
                    <div className="absolute top-1 right-2 text-[8px] font-mono text-stone-600 uppercase font-black">OP_PHOTO</div>
                  </div>
                </div>

                <div className="border-t border-dashed border-stone-450 pt-4 space-y-4 text-left">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-stone-500 font-mono tracking-widest">Operative Email ID</span>
                    <span className="text-base font-bold text-stone-950 pb-1 break-all font-serif">{profile?.email || "REDACTED"}</span>
                  </div>
                  
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-stone-500 font-mono tracking-widest">Mainframe clearance</span>
                    <span className="text-sm font-bold text-stone-950 uppercase font-serif">{profile?.role || "OPERATIVE"} (OMEGA LEVEL)</span>
                  </div>
                  
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-stone-500 font-mono tracking-widest">Handshake initialization</span>
                    <span className="text-xs text-stone-900 font-serif">{profile?.createdAt ? new Date(profile.createdAt).toLocaleString() : "UNKNOWN"}</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* TILE 2: Live Synapse Tethers (Sessions) */}
        <div className="lg:col-span-2 flex flex-col relative">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 rounded text-left">
            
            <div className="flex justify-between items-center mb-4 border-b-2 border-stone-950 pb-3">
              <h3 className="font-playfair text-lg text-stone-950 uppercase tracking-wide font-black flex items-center gap-2">
                ACTIVE DECK TETHERS
              </h3>
              <button 
                onClick={handleRevokeAll}
                className="vintage-stamp text-[9px] py-1 border-red-750 text-red-800 shadow-[2px_2px_0px_#801c1c] font-mono font-bold"
              >
                REVOKE LINKS
              </button>
            </div>

            {/* Sessions Tethers list */}
            <div className="space-y-3 pr-2">
              {sessions.map((session: any, idx: number) => (
                <div key={session.id} className="bg-white border-2 border-stone-950 p-3 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-stone-50 transition-all">
                  <div>
                    <div className="text-stone-950 text-xs font-bold tracking-widest flex items-center gap-2 font-mono">
                      NODE_TETHER_{idx + 1}
                      {session.isCurrent && (
                        <span className="text-[8px] bg-stone-950 text-white px-1.5 py-0.5 rounded uppercase font-mono">CURRENT</span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-600 mt-1 font-mono">IP ADDR: <span className="text-stone-900 font-bold">{session.ipAddress || "SECURE"}</span></div>
                  </div>
                  <div className="text-right text-[10px] font-mono">
                    <span className="text-stone-500 block">EXPIRES AT:</span>
                    <span className="text-stone-900 font-bold">{new Date(session.expiresAt).toLocaleDateString()} {new Date(session.expiresAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <div className="text-center font-mono text-stone-500 py-6 tracking-widest text-xs">NO ACTIVE DECK TETHERS FOUND</div>
              )}
            </div>
          </div>
        </div>

        {/* TILE 3: Mainframe Access Whitelist Registry */}
        <div className="lg:col-span-2 flex flex-col relative">
          <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] flex flex-col relative z-10 rounded text-left">
            
            <div className="flex justify-between items-end border-b-2 border-stone-950 pb-2.5 mb-4 relative z-10">
              <h2 className="font-playfair text-lg font-black text-stone-950 uppercase tracking-wide">
                OPERATIVE OVERRIDE REGISTRY
              </h2>
              <span className="font-mono text-stone-600 text-[10px]">&gt;&gt; AUTH_PROTOCOL</span>
            </div>

            <div className="flex flex-col gap-5 relative z-10">
              
              {/* Form details */}
              <div className="bg-white border-2 border-stone-950 p-4 rounded">
                <p className="font-serif text-xs text-stone-700 leading-normal mb-3 font-semibold">
                  Register new operative email addresses to grant access keys to the teletype feeds.
                </p>
                <form onSubmit={handleAddWhitelist} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="OPERATIVE@DEV.NEWS..."
                    className="flex-1 bg-transparent border-2 border-stone-950 px-3 py-2 text-xs outline-none focus:border-red-800 placeholder-stone-400 font-mono rounded"
                  />
                  <button 
                    type="submit"
                    disabled={whitelistStatus.type === "loading"}
                    className="vintage-stamp text-xs font-bold py-2 px-4 disabled:opacity-50"
                  >
                    AUTHORIZE ID
                  </button>
                </form>
                {whitelistStatus.msg && (
                  <div className={`font-mono text-[10px] uppercase text-center mt-2.5 font-bold ${whitelistStatus.type === "error" ? "text-red-750 animate-pulse" : "text-green-800"}`}>
                    &gt;&gt; {whitelistStatus.msg}
                  </div>
                )}
              </div>

              {/* whitelist entries */}
              <div className="bg-[#f5f2e9] border border-stone-300 rounded p-4 flex flex-col">
                <h4 className="font-mono text-stone-700 text-[10px] border-b border-stone-400 pb-1.5 mb-2.5 font-bold">
                  AUTHORIZED CLEARANCE LOGS
                </h4>
                <div className="space-y-2.5">
                  {whitelist.map((w) => (
                    <div key={w.id} className="font-mono text-[11px] text-stone-850 flex justify-between items-center group/wl hover:bg-white px-2 py-1.5 border border-stone-350 bg-white/40 rounded">
                      <span className="truncate flex-1 min-w-0 mr-2 font-bold">{w.email}</span>
                      <button
                        onClick={() => handleDeleteWhitelist(w.id)}
                        className="text-[9px] text-red-800 hover:text-red-950 font-bold opacity-0 group-hover/wl:opacity-100 transition-opacity border-2 border-red-800 px-1.5 py-0.5 bg-white rounded cursor-pointer"
                      >
                        REVOKE ID
                      </button>
                    </div>
                  ))}
                  {whitelist.length === 0 && (
                    <div className="text-stone-500 font-mono text-xs text-center py-6">NO ACTIVE CLEARANCE KEYS FOUND</div>
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
