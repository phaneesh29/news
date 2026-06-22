"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchSessionsList, revokeSessionApi, revokeOtherSessionsApi, fetchLikedNewsList } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  ArrowLeft, LogOut, Check, RefreshCw,
  Monitor, Smartphone, Laptop, Trash2, Lock, History,
  Terminal, Fingerprint, QrCode, AlertTriangle, Shield,
  KeyRound, Cpu, Activity
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
    <div className="min-h-screen flex flex-col selection:bg-[#cc785c]/20 selection:text-[#141413]">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <RefreshCw className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-sm font-mono uppercase tracking-widest">Deciphering credentials...</p>
          </div>
        ) : activeUser ? (
          <div className="space-y-12">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 border-b-4 border-double border-current pb-6">
              <div className="space-y-2 text-center md:text-left w-full">
                <div className="flex items-center gap-2 justify-center md:justify-start font-mono text-[10px] uppercase tracking-widest text-[#cc785c] font-bold">
                  <Fingerprint className="h-4 w-4" />
                  <span>IDENTITY CLEARANCE: LEVEL 5</span>
                </div>
                <h1 className="font-serif text-5xl md:text-7xl font-black uppercase font-blackletter tracking-tight">
                  Security Dossier
                </h1>
              </div>
              <div className="text-right font-mono text-xs opacity-70 hidden md:block space-y-1 shrink-0">
                <p>RECORD: {activeUser.id.split('-')[0].toUpperCase()}</p>
                <p>STATUS: <span className="text-emerald-600 font-bold">ACTIVE</span></p>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-10 items-start">
              
              {/* Left Column: Press Pass & Settings */}
              <div className="lg:col-span-5 space-y-8">
                
                {/* PRESS PASS ID CARD */}
                <div className="relative group perspective-1000">
                  {/* Card Background / Base */}
                  <div className="border-[3px] border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] vintage-shadow-lg p-6 pb-8 transition-transform duration-300 group-hover:-translate-y-1">
                    
                    <div className="text-center border-b-2 border-current pb-4 mb-6">
                      <h2 className="font-serif text-2xl font-black tracking-widest uppercase font-newspaper">PRESS CREDENTIAL</h2>
                      <p className="font-mono text-[9px] tracking-widest opacity-60">DEVBITS GLOBAL SYNDICATE</p>
                    </div>

                    <div className="flex gap-6 items-start">
                      {/* Photo Area */}
                      <div className="shrink-0 relative">
                        <Avatar className="!h-28 !w-28 border-[3px] border-[#111111] dark:border-[#e6dfd8] rounded-full shadow-inner grayscale contrast-125 sepia-[0.3]">
                          <AvatarImage src={activeUser.image || undefined} className="object-cover" />
                          <AvatarFallback className="bg-[#e6dfd8] dark:bg-[#252320] text-[#111111] dark:text-[#e6dfd8] text-5xl font-serif font-black rounded-full">
                            {activeUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 rotate-12">
                          <Badge className="bg-[#cc785c] text-white border-2 border-[#111111] font-mono text-[9px] font-black rounded-none shadow-sm uppercase py-1">
                            VERIFIED
                          </Badge>
                        </div>
                      </div>

                      {/* Details Area */}
                      <div className="space-y-4 flex-1">
                        <div>
                          <p className="font-mono text-[8px] opacity-60 uppercase mb-0.5">Operative Name</p>
                          <p className="font-serif text-xl font-black leading-none">{activeUser.name}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[8px] opacity-60 uppercase mb-0.5">Secure Comms (Email)</p>
                          <p className="font-mono text-xs break-all leading-tight">{activeUser.email}</p>
                        </div>
                        <div>
                          <p className="font-mono text-[8px] opacity-60 uppercase mb-0.5">Access Granted</p>
                          <p className="font-mono text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="h-3 w-3 stroke-[3px]" /> Full System
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Barcode & Fingerprint Footer */}
                    <div className="mt-8 pt-4 border-t-2 border-dashed border-current flex justify-between items-end opacity-80">
                      <div className="space-y-1">
                        <QrCode className="h-10 w-10" />
                        <p className="font-mono text-[7px] tracking-widest">{activeUser.id}</p>
                      </div>
                      <Button 
                        onClick={handleLogout}
                        className="bg-transparent hover:bg-[#c64545] text-[#c64545] hover:text-white border-2 border-[#c64545] text-[10px] font-bold py-2 px-4 rounded-none transition-colors h-auto"
                      >
                        <LogOut className="h-3 w-3 mr-2" />
                        SURRENDER ID
                      </Button>
                    </div>
                  </div>
                </div>

                {/* THE CURATOR'S DESK (Preferences) */}
                <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#f5f2e9] dark:bg-[#252320] p-6 vintage-shadow">
                  <div className="flex items-center justify-between border-b-2 border-[#111111] dark:border-[#e6dfd8] pb-3 mb-4">
                    <h3 className="font-serif text-xl font-bold uppercase font-newspaper flex items-center gap-2">
                      <History className="h-5 w-5 text-[#cc785c]" />
                      Curator's Desk
                    </h3>
                  </div>

                  <div className="font-mono text-[11px] space-y-4">
                    <div className="flex items-center justify-between p-2 bg-[#111111]/5 dark:bg-white/5 border border-current">
                      <span className="opacity-70 font-bold uppercase">Archived Dispatches</span>
                      <Link href="/liked" className="text-[#cc785c] font-black hover:underline flex items-center gap-1 text-sm">
                        {savedCount !== null ? savedCount : "..."} 
                        <ArrowLeft className="h-3 w-3 rotate-180" />
                      </Link>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center border-b border-dashed border-current/30 pb-1">
                        <span className="opacity-60">Visual Matrix</span>
                        <span className="font-bold">{settings.theme.replace('-', ' ').toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-dashed border-current/30 pb-1">
                        <span className="opacity-60">Typography Form</span>
                        <span className="font-bold">{settings.fontFamily.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-dashed border-current/30 pb-1">
                        <span className="opacity-60">Text Scale</span>
                        <span className="font-bold">SIZE {settings.fontSize.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Link href="/settings" className="block">
                        <Button className="w-full bg-[#111111] hover:bg-[#222] dark:bg-[#e6dfd8] dark:hover:bg-white text-white dark:text-[#111111] rounded-none font-mono text-[10px] font-bold h-10 vintage-shadow-sm">
                          RECALIBRATE SETTINGS
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Server Access Logs */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* ACTIVE AUTHORIZATION SESSIONS */}
                <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] vintage-shadow">
                  <div className="bg-[#efe9de] dark:bg-[#252320] border-b-2 border-[#111111] dark:border-[#e6dfd8] p-4 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-[#cc785c]" />
                      <h3 className="font-serif font-bold text-lg font-newspaper">Active Authorization Sessions</h3>
                    </div>
                    {sessions.length > 1 && (
                      <Button
                        onClick={handleRevokeOtherSessions}
                        className="border-2 border-[#c64545] hover:bg-[#c64545]/10 text-[#c64545] font-bold text-[10px] uppercase rounded-none h-7 px-2 bg-transparent"
                      >
                        Revoke other terminals
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {loadingSessions ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-xs font-mono opacity-80">
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
                            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-current/20 rounded-none bg-[#efe9de]/10 dark:bg-white/5 gap-4">
                              <div className="flex items-start gap-3">
                                <div className="p-2 border border-current text-[#cc785c] mt-0.5">
                                  {deviceType.includes("Phone") || deviceType.includes("Pad") ? (
                                    <Smartphone className="h-4.5 w-4.5" />
                                  ) : deviceType.includes("MacBook") || deviceType.includes("Laptop") ? (
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
                                  className="border-2 border-[#111111] hover:bg-[#efe9de] text-[#111111] dark:border-[#e6dfd8] dark:text-[#efe9de] dark:hover:bg-[#252320] text-[10px] font-bold h-8 px-3 rounded-none shrink-0 self-end sm:self-center bg-transparent uppercase"
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

              </div>
            </div>
          </div>
        ) : (
          /* Authentication Gate page */
          <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] max-w-md w-full p-8 text-center flex flex-col items-center gap-6 mx-auto vintage-shadow mt-20">
            <div className="h-16 w-16 rounded-none border-[3px] border-[#111111] dark:border-[#e6dfd8] text-[#cc785c] flex items-center justify-center vintage-shadow-sm bg-[#efe9de] dark:bg-[#252320]">
              <Lock className="h-8 w-8" />
            </div>
            
            <div className="space-y-3">
              <h2 className="font-serif text-3xl font-black uppercase font-newspaper">Restricted Area</h2>
              <p className="text-sm font-mono opacity-75 leading-relaxed px-4">
                This directory requires a verified identity module. Proceed via secure gateway below.
              </p>
            </div>

            <Button 
              onClick={triggerGoogleLogin}
              className="w-full bg-[#111111] hover:bg-[#333] dark:bg-[#e6dfd8] dark:hover:bg-white text-white dark:text-[#111111] border-2 border-transparent py-6 rounded-none font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 mt-4 transition-all vintage-shadow-sm"
            >
              Authenticate Identity
              <Fingerprint className="h-5 w-5" />
            </Button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 border-t-4 border-[#111111] mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-mono">
          <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>
          <p className="opacity-50">© {new Date().getFullYear()} Curation Newsroom. Dossiers.</p>
        </div>
      </footer>
    </div>
  );
}
