"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchSessionsList, revokeSessionApi, revokeOtherSessionsApi, fetchLikedNewsList } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  LogOut, 
  Check, 
  RefreshCw,
  Monitor,
  Smartphone,
  Laptop,
  Trash2,
  Lock,
  History,
  Activity,
  HardDrive
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/components/SettingsProvider";

function parseUA(ua: string | null): string {
  if (!ua) return "Unknown Device";
  if (ua.includes("Windows")) return "Windows PC";
  if (ua.includes("Macintosh")) return "MacBook / iMac";
  if (ua.includes("iPhone")) return "iPhone";
  if (ua.includes("iPad")) return "iPad";
  if (ua.includes("Android")) return "Android Phone";
  if (ua.includes("Linux")) return "Linux PC";
  return "Mobile/Desktop Device";
}

function parseBrowser(ua: string | null): string {
  if (!ua) return "Unknown Browser";
  if (ua.includes("Edg/")) return "Microsoft Edge";
  if (ua.includes("Chrome/")) return "Google Chrome";
  if (ua.includes("Safari/")) return "Safari";
  if (ua.includes("Firefox/")) return "Mozilla Firefox";
  return "Web Browser";
}

export default function UserProfilePage() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;
  const activeSession = sessionData?.session;
  const { settings } = useSettings();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!activeUser) return;
    setLoadingSessions(true);
    try {
      const res = await fetchSessionsList();
      if (res.status === "success" && res.data) {
        setSessions(res.data);
      } else {
        console.error("Failed to fetch active sessions:", res.message);
      }
    } catch (err) {
      console.error("Failed to fetch active sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  }, [activeUser]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (!activeUser) return;
    async function loadSavedCount() {
      try {
        const res = await fetchLikedNewsList();
        if (res.status === "success" && res.data) {
          setSavedCount(res.data.news.length);
        }
      } catch (err) {
        console.error("Failed to load liked news count:", err);
      }
    }
    loadSavedCount();
  }, [activeUser]);

  const handleRevokeSession = async (token: string) => {
    try {
      const res = await revokeSessionApi(token);
      if (res.status === "success") {
        await fetchSessions();
      } else {
        console.error("Failed to revoke session:", res.message);
      }
    } catch (err) {
      console.error("Failed to revoke session:", err);
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      const res = await revokeOtherSessionsApi();
      if (res.status === "success") {
        await fetchSessions();
      } else {
        console.error("Failed to revoke other sessions:", res.message);
      }
    } catch (err) {
      console.error("Failed to revoke other sessions:", err);
    }
  };

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/profile"
      });
    } catch (err) {
      console.error("Google sign in redirect failed:", err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    refetch();
  };

  return (
    <div className="min-h-screen flex flex-col paper-grain selection:bg-[#cc785c]/20 selection:text-[#141413]">
      <Navbar />

      {/* Broadsheet Profile Header */}
      <header className="py-8 md:py-12 border-b-4 border-double border-current px-4 bg-transparent text-inherit text-center">
        <div className="mx-auto max-w-7xl flex flex-col items-center space-y-4">
          
          <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest border-b border-current pb-2 max-w-5xl">
            <span>DOSSIER CATALOG</span>
            <span>IDENTITY VERIFICATION RECORDS</span>
            <span>SECTION C // PROFILE</span>
          </div>

          {/* Gothic Masthead Title */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-inherit uppercase font-blackletter border-b border-current pb-4 w-full max-w-5xl whitespace-nowrap">
            Archival Identity
          </h1>

          <div className="text-center font-serif italic text-sm border-t border-b border-current py-1 max-w-xl px-6 font-newspaper">
            "Secure Credentials, Database Handshakes & Active Session Logs"
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-5xl w-full px-4 sm:px-6 lg:px-8 py-12">
        
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="h-6 w-6 text-[#cc785c] animate-spin" />
            <p className="text-xs font-mono">Verifying secure token handshakes...</p>
          </div>
        ) : activeUser ? (
          <div className="space-y-10 animate-fade-in">
            
            {/* Split layout: dossier details card + system logs / sessions */}
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Dossier card */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Dossier Card */}
                <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-6 text-center flex flex-col items-center gap-5 vintage-shadow relative overflow-hidden">
                  
                  {/* Top stamp border */}
                  <div className="absolute top-2 right-2 border border-current font-mono text-[8px] px-1.5 py-0.5 rounded-[2px] opacity-75 font-bold">
                    DEPT OF RECORDS
                  </div>

                  <Avatar className="h-24 w-24 border-2 border-[#111111] dark:border-[#e6dfd8] rounded-full shadow-sm mt-4">
                    <AvatarImage src={activeUser.image || undefined} />
                    <AvatarFallback className="bg-[#cc785c] text-white text-4xl font-bold font-serif rounded-full flex items-center justify-center">
                      {activeUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1">
                    <h2 className="font-serif text-2xl font-black font-newspaper">{activeUser.name}</h2>
                    <p className="text-xs font-mono opacity-70 break-all">{activeUser.email}</p>
                  </div>

                  <Badge className="bg-emerald-600/10 text-emerald-600 border border-emerald-600 font-mono text-[9px] font-bold py-0.5 px-3 rounded-none uppercase">
                    ACTIVE PROFILE SECURED
                  </Badge>

                  <div className="w-full h-px bg-current opacity-20 my-2" />

                  {/* Stamp button style */}
                  <Button 
                    onClick={handleLogout}
                    className="w-full bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold py-5 rounded-none vintage-shadow-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    DEAUTHORIZE SESSION
                  </Button>
                </div>

                {/* Reading Dashboard */}
                <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-6 space-y-4 vintage-shadow">
                  <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-[#cc785c] flex items-center gap-1.5 border-b border-[#e6dfd8] pb-3">
                    <History className="h-4 w-4" />
                    Reader Dashboard
                  </h4>
                  <div className="font-mono text-[10px] space-y-3.5 leading-relaxed">
                    <div className="flex justify-between items-center">
                      <span className="opacity-60">SAVED WIRE DISPATCHES:</span>
                      <Link href="/liked" className="font-bold text-[#cc785c] hover:underline flex items-center gap-1">
                        {savedCount !== null ? `${savedCount} Saved` : "Loading..."}
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                      </Link>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">READING THEME:</span>
                      <span className="font-bold uppercase">
                        {settings.theme === "aged-paper" ? "Aged Paper" :
                         settings.theme === "classic-white" ? "Plain Canvas" :
                         settings.theme === "ink-dark" ? "Ink Dark" : "Default"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">HEADLINE TYPOGRAPHY:</span>
                      <span className="font-bold uppercase">
                        {settings.fontFamily === "newspaper" ? "Broadsheet" :
                         settings.fontFamily === "serif" ? "Classic Serif" :
                         settings.fontFamily === "sans" ? "Modern Sans" : "Default"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">TEXT SCALING:</span>
                      <span className="font-bold uppercase">
                        {settings.fontSize === "sm" ? "Small" :
                         settings.fontSize === "md" ? "Default" :
                         settings.fontSize === "lg" ? "Large" :
                         settings.fontSize === "xl" ? "Extrabold" : "Default"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">LAYOUT FORMAT:</span>
                      <span className="font-bold uppercase">
                        {settings.doubleColumn ? "Dual Columns" : "Standard Grid"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Link href="/settings" className="block">
                      <Button className="w-full bg-transparent hover:bg-[#efe9de] dark:hover:bg-[#252320] text-[#141413] dark:text-[#faf9f5] border border-current text-[10px] font-bold py-3.5 rounded-none transition-colors">
                        Configure Reading Settings
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>

              {/* Right Column: Sessions, identity logs */}
              <div className="md:col-span-7 space-y-8">
                
                {/* Profile Identity Details */}
                <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] vintage-shadow">
                  <div className="bg-[#efe9de] dark:bg-[#252320] border-b-2 border-[#111111] dark:border-[#e6dfd8] p-4 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#cc785c]" />
                    <h3 className="font-serif font-bold text-lg font-newspaper">Security Identity Register</h3>
                  </div>
                  
                  <div className="p-6 text-xs md:text-sm space-y-4 font-serif">
                    <div className="grid grid-cols-3 border-b border-[#e6dfd8]/50 pb-3 font-mono text-[11px] items-center">
                      <span className="opacity-60 uppercase font-bold">Dossier ID:</span>
                      <span className="col-span-2 font-bold break-all opacity-85">{activeUser.id}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-[#e6dfd8]/50 pb-3 font-mono text-[11px] items-center">
                      <span className="opacity-60 uppercase font-bold">Mail Verified:</span>
                      <span className="col-span-2 flex items-center gap-1.5 font-bold text-emerald-600">
                        {activeUser.emailVerified ? (
                          <>
                            <Check className="h-4 w-4 stroke-[3px]" />
                            VERIFIED IDENTITY
                          </>
                        ) : (
                          "UNVERIFIED"
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 font-mono text-[11px] items-center">
                      <span className="opacity-60 uppercase font-bold">Registered on:</span>
                      <span className="col-span-2 font-bold opacity-85">
                        {new Date(activeUser.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Devices & Active Sessions */}
                {activeSession && (
                  <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] vintage-shadow">
                    <div className="bg-[#efe9de] dark:bg-[#252320] border-b-2 border-[#111111] dark:border-[#e6dfd8] p-4 flex flex-row items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-[#cc785c]" />
                        <h3 className="font-serif font-bold text-lg font-newspaper">Active Authorization Sessions</h3>
                      </div>
                      {sessions.length > 1 && (
                        <Button
                          onClick={handleRevokeOtherSessions}
                          className="border-2 border-[#c64545] hover:bg-[#c64545]/10 text-[#c64545] font-bold text-[10px] rounded-none h-7 px-2 bg-transparent"
                        >
                          Revoke other terminals
                        </Button>
                      )}
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {loadingSessions ? (
                        <div className="flex items-center justify-center py-4 gap-2 text-xs font-mono">
                          <RefreshCw className="h-4 w-4 animate-spin text-[#cc785c]" />
                          <span>Scanning terminals buffer...</span>
                        </div>
                      ) : sessions.length === 0 ? (
                        <p className="text-center italic opacity-60 py-2">No active terminals logged.</p>
                      ) : (
                        <div className="space-y-4">
                          {sessions.map((s) => {
                            const isCurrent = s.id === activeSession?.id;
                            const deviceType = parseUA(s.userAgent);
                            const browserName = parseBrowser(s.userAgent);

                            return (
                              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#e6dfd8] rounded-none bg-[#efe9de]/10 gap-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 border border-current text-[#cc785c] mt-0.5">
                                    {deviceType === "iPhone" || deviceType === "Android Phone" ? (
                                      <Smartphone className="h-4.5 w-4.5" />
                                    ) : deviceType === "MacBook / iMac" || deviceType === "Laptop" ? (
                                      <Laptop className="h-4.5 w-4.5" />
                                    ) : (
                                      <Monitor className="h-4.5 w-4.5" />
                                    )}
                                  </div>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs font-mono uppercase">
                                        {deviceType} // {browserName}
                                      </span>
                                      {isCurrent && (
                                        <Badge className="bg-[#cc785c]/10 text-[#cc785c] border border-[#cc785c] text-[8px] font-bold py-0 px-1 rounded-none uppercase">
                                          PRIMARY
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="text-[10px] font-mono opacity-70 space-y-0.5">
                                      {s.ipAddress && <p>IP: <span>{s.ipAddress}</span></p>}
                                      <p>LAST PING: {new Date(s.updatedAt || s.createdAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                </div>

                                {!isCurrent && s.token && (
                                  <Button
                                    onClick={() => handleRevokeSession(s.token)}
                                    className="border-2 border-[#111111] hover:bg-[#efe9de] text-[#111111] dark:border-[#e6dfd8] dark:text-[#efe9de] dark:hover:bg-[#252320] text-[10px] font-bold h-8 px-3 rounded-none shrink-0 self-end sm:self-center bg-transparent"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                    Revoke
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        ) : (
          /* Authentication Gate page */
          <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] max-w-md w-full p-8 text-center flex flex-col items-center gap-6 mx-auto vintage-shadow">
            <div className="h-14 w-14 rounded-none border-2 border-[#111111] dark:border-[#e6dfd8] text-[#cc785c] flex items-center justify-center vintage-shadow-sm bg-transparent">
              <Lock className="h-7 w-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-black uppercase font-newspaper">Security Identity Gate</h2>
              <p className="text-xs opacity-75 leading-relaxed">
                The requested directory contains database transactions. Access requires a signed TLS credential block from Google Social Identity.
              </p>
            </div>

            <Button 
              onClick={triggerGoogleLogin}
              className="w-full bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] py-5 rounded-none font-bold text-xs flex items-center justify-center gap-2 mt-2 transition-colors vintage-shadow-sm"
            >
              Sign In with Google Identity
            </Button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 border-t-4 border-[#111111] mt-12">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-mono">
          <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>
          <p className="opacity-50">© {new Date().getFullYear()} Curation Newsroom. Profiles.</p>
        </div>
      </footer>
    </div>
  );
}
