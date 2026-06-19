"use client";

import React from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchSessionsList, revokeSessionApi, revokeOtherSessionsApi } from "@/lib/api";
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
  Trash2
} from "lucide-react";

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

  const [sessions, setSessions] = React.useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = React.useState(false);

  const fetchSessions = React.useCallback(async () => {
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

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

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
    <div className="min-h-screen flex flex-col bg-[#faf9f5] font-sans text-[#141413] selection:bg-[#cc785c]/20 selection:text-[#141413]">
      
      {/* Navigation Header */}
      <header className="border-b border-[#e6dfd8] bg-[#faf9f5]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#141413] text-[#faf9f5] transition-transform group-hover:rotate-45">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-serif text-xl font-medium tracking-tight text-[#141413]">DevBits</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Link href="/blogs">
              <Button variant="ghost" size="sm" className="text-[#6c6a64] hover:text-[#141413] text-xs">
                Blogs
              </Button>
            </Link>
            <Link href="/liked">
              <Button variant="ghost" size="sm" className="text-[#6c6a64] hover:text-[#141413] text-xs">
                Liked News
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="border-[#e6dfd8] text-xs flex items-center gap-1.5 hover:bg-[#efe9de]">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Curation
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-12 sm:py-16 flex flex-col items-center justify-center">
        
        {isPending ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <RefreshCw className="h-6 w-6 text-[#cc785c] animate-spin" />
            <p className="text-xs text-[#6c6a64] font-mono">Verifying secure session token...</p>
          </div>
        ) : activeUser ? (
          <div className="w-full space-y-8 animate-fade-in">
            
            {/* Header Title */}
            <div className="text-left space-y-2">
              <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#141413]">
                Your Developer Profile
              </h1>
              <p className="text-sm text-[#6c6a64]">
                Manage your authenticated connection and active sessions.
              </p>
            </div>

            <div className="h-px bg-[#e6dfd8]" />

            {/* Profile Overview Card */}
            <div className="grid md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column - User Avatar & Sign Out */}
              <Card className="border border-[#e6dfd8] bg-[#faf9f5] md:col-span-4 p-6 flex flex-col items-center text-center gap-4">
                <Avatar className="h-20 w-20 border border-[#e6dfd8] shadow-sm">
                  <AvatarImage src={activeUser.image || undefined} />
                  <AvatarFallback className="bg-[#cc785c] text-white text-3xl font-semibold">
                    {activeUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h2 className="text-base font-semibold text-[#141413]">{activeUser.name}</h2>
                  <p className="text-xs text-[#6c6a64] mt-0.5 break-all">{activeUser.email}</p>
                </div>

                <Badge className="bg-[#5db872]/10 text-[#5db872] text-[10px] font-semibold border-0 py-0.5 px-2">
                  Authenticated
                </Badge>

                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full mt-4 border-[#c64545]/20 text-[#c64545] hover:text-[#c64545] hover:bg-[#c64545]/10 text-xs h-9"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Sign Out Account
                </Button>
              </Card>

              {/* Right Column - System Metadata details */}
              <div className="md:col-span-8 space-y-6">
                
                {/* Account Details */}
                <Card className="border border-[#e6dfd8] bg-[#faf9f5]">
                  <CardHeader className="bg-[#f5f0e8]/50 border-b border-[#e6dfd8] p-4.5">
                    <CardTitle className="font-serif text-lg font-normal text-[#141413] flex items-center gap-2">
                      <User className="h-4.5 w-4.5 text-[#cc785c]" />
                      Account Identity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 text-xs text-[#3d3d3a] space-y-4">
                    <div className="grid grid-cols-3 border-b border-[#e6dfd8]/50 pb-3">
                      <span className="text-[#6c6a64] font-medium">User ID:</span>
                      <span className="col-span-2 font-mono text-[#141413] break-all">{activeUser.id}</span>
                    </div>
                    <div className="grid grid-cols-3 border-b border-[#e6dfd8]/50 pb-3">
                      <span className="text-[#6c6a64] font-medium">Email Verified:</span>
                      <span className="col-span-2 flex items-center gap-1 text-[#141413]">
                        {activeUser.emailVerified ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-[#5db872]" />
                            Yes
                          </>
                        ) : (
                          "No"
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-[#6c6a64] font-medium">Registered:</span>
                      <span className="col-span-2 text-[#141413]">
                        {new Date(activeUser.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Sessions & Devices */}
                {activeSession && (
                <Card className="border border-[#e6dfd8] bg-[#faf9f5]">
                  <CardHeader className="bg-[#f5f0e8]/50 border-b border-[#e6dfd8] p-4.5 flex flex-row items-center justify-between">
                    <CardTitle className="font-serif text-lg font-normal text-[#141413] flex items-center gap-2">
                      <Shield className="h-4.5 w-4.5 text-[#cc785c]" />
                      Active Sessions & Devices
                    </CardTitle>
                    {sessions.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRevokeOtherSessions}
                        className="border-[#c64545]/20 text-[#c64545] hover:bg-[#c64545]/10 text-[10px] h-7 px-2"
                      >
                        Revoke Other Sessions
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-5 text-xs text-[#3d3d3a] space-y-4">
                    {loadingSessions ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-[#6c6a64]">
                        <RefreshCw className="h-4 w-4 animate-spin text-[#cc785c]" />
                        <span>Loading active sessions...</span>
                      </div>
                    ) : sessions.length === 0 ? (
                      <p className="text-center text-[#6c6a64] py-2">No active sessions found.</p>
                    ) : (
                      <div className="space-y-4">
                        {sessions.map((s) => {
                          const isCurrent = s.id === activeSession?.id;
                          const deviceType = parseUA(s.userAgent);
                          const browserName = parseBrowser(s.userAgent);

                          return (
                            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border border-[#e6dfd8] rounded-lg bg-[#efe9de]/10 gap-3">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded bg-[#e6dfd8]/50 text-[#cc785c] mt-0.5">
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
                                    <span className="font-semibold text-[#141413]">
                                      {deviceType} • {browserName}
                                    </span>
                                    {isCurrent && (
                                      <Badge className="bg-[#5db872]/10 text-[#5db872] border-0 text-[9px] font-semibold py-0 px-1.5">
                                        Current Device
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#6c6a64] space-y-0.5">
                                    {s.ipAddress && <p>IP: <span className="font-mono">{s.ipAddress}</span></p>}
                                    <p>Last active: {new Date(s.updatedAt || s.createdAt).toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>

                              {!isCurrent && s.token && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRevokeSession(s.token)}
                                  className="border-[#c64545]/20 text-[#c64545] hover:bg-[#c64545]/10 text-[10px] h-7 px-2 shrink-0 self-end sm:self-center"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Log Out Device
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                )}

              </div>
            </div>

          </div>
        ) : (
          /* Authentication Gate page */
          <Card className="border border-[#e6dfd8] bg-[#faf9f5] max-w-md w-full p-8 text-center flex flex-col items-center gap-5">
            <div className="h-12 w-12 rounded-full bg-[#cc785c]/10 text-[#cc785c] flex items-center justify-center shadow-sm">
              <Shield className="h-6 w-6" />
            </div>
            
            <div>
              <h1 className="font-serif text-2xl font-normal text-[#141413]">Access Protected Profile</h1>
              <p className="text-xs text-[#6c6a64] mt-1.5 leading-relaxed">
                The profile directory requires an authenticated database session. Please sign in securely via Google OAuth.
              </p>
            </div>

            <Button 
              onClick={triggerGoogleLogin}
              className="w-full bg-[#cc785c] hover:bg-[#a9583e] text-white border-0 py-5 rounded-md font-medium text-xs flex items-center justify-center gap-2 mt-2 transition-colors shadow-sm"
            >
              Sign In with Google
            </Button>
          </Card>
        )}

      </main>

      {/* Clean Premium Footer */}
      <footer className="bg-[#181715] text-[#a09d96]/60 py-8 border-t border-[#252320]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} DevBits. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#faf9f5] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#faf9f5] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
