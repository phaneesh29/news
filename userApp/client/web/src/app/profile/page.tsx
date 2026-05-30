"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchProfile, ApiResponse, UserProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Clock, 
  RefreshCw, 
  Cpu, 
  LogOut, 
  Check, 
  Globe, 
  Terminal,
  Activity
} from "lucide-react";

export default function UserProfilePage() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;
  const activeSession = sessionData?.session;

  // State to fetch direct Express profile details
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  useEffect(() => {
    if (activeUser) {
      loadExpressProfile();
    }
  }, [activeUser]);

  const loadExpressProfile = async () => {
    setIsLoadingProfile(true);
    setErrorLog(null);
    try {
      const response = await fetchProfile();
      if (response.status === "success" && response.data) {
        setProfileData(response.data);
      } else {
        setErrorLog("Backend server responded but did not return profile metadata.");
      }
    } catch (err: any) {
      console.error("Error fetching Express profile:", err);
      setErrorLog(err.message || "Failed to establish database connection with server.");
    } finally {
      setIsLoadingProfile(false);
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
    setProfileData(null);
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
          
          <Link href="/">
            <Button variant="outline" size="sm" className="border-[#e6dfd8] text-xs flex items-center gap-1.5 hover:bg-[#efe9de]">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Curation
            </Button>
          </Link>
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
                Manage your authenticated connection, database settings, and active sessions.
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

                {/* Session Security Details */}
                {activeSession && (
                  <Card className="border border-[#e6dfd8] bg-[#faf9f5]">
                    <CardHeader className="bg-[#f5f0e8]/50 border-b border-[#e6dfd8] p-4.5">
                      <CardTitle className="font-serif text-lg font-normal text-[#141413] flex items-center gap-2">
                        <Shield className="h-4.5 w-4.5 text-[#cc785c]" />
                        Active Security Token
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 text-xs text-[#3d3d3a] space-y-4">
                      <div className="grid grid-cols-3 border-b border-[#e6dfd8]/50 pb-3">
                        <span className="text-[#6c6a64] font-medium">Session ID:</span>
                        <span className="col-span-2 font-mono text-[#141413] break-all">{activeSession.id}</span>
                      </div>
                      {activeSession.ipAddress && (
                        <div className="grid grid-cols-3 border-b border-[#e6dfd8]/50 pb-3">
                          <span className="text-[#6c6a64] font-medium">IP Address:</span>
                          <span className="col-span-2 font-mono text-[#141413]">{activeSession.ipAddress}</span>
                        </div>
                      )}
                      <div className="grid grid-cols-3">
                        <span className="text-[#6c6a64] font-medium">Token Expires:</span>
                        <span className="col-span-2 text-[#141413] font-mono">
                          {new Date(activeSession.expiresAt).toLocaleDateString(undefined, {
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
                )}

                {/* Secure DB Endpoint Response Payload */}
                <Card className="border border-[#e6dfd8] bg-[#faf9f5]">
                  <CardHeader className="bg-[#f5f0e8]/50 border-b border-[#e6dfd8] p-4.5 flex flex-row items-center justify-between">
                    <CardTitle className="font-serif text-lg font-normal text-[#141413] flex items-center gap-2">
                      <Terminal className="h-4.5 w-4.5 text-[#cc785c]" />
                      Express API Verification
                    </CardTitle>
                    <Button 
                      size="xs" 
                      variant="outline" 
                      onClick={loadExpressProfile} 
                      disabled={isLoadingProfile}
                      className="border-[#e6dfd8] text-[10px] h-6"
                    >
                      <RefreshCw className={`h-3 w-3 mr-1 ${isLoadingProfile ? "animate-spin" : ""}`} />
                      Sync
                    </Button>
                  </CardHeader>
                  <CardContent className="p-5">
                    {isLoadingProfile ? (
                      <div className="text-center py-6 text-xs text-[#6c6a64]">Querying Database...</div>
                    ) : errorLog ? (
                      <div className="p-4 rounded-lg bg-[#c64545]/5 border border-[#c64545]/10 text-xs text-[#c64545] flex items-start gap-2">
                        <Activity className="h-4 w-4 mt-0.5 shrink-0" />
                        <div>
                          <strong>Database Connection Issue:</strong>
                          <p className="mt-1 leading-relaxed">{errorLog}</p>
                        </div>
                      </div>
                    ) : profileData ? (
                      <div className="relative rounded-lg border border-[#e6dfd8] bg-[#181715] p-4 text-[#faf9f5] font-mono text-[10px] overflow-x-auto">
                        <pre className="max-h-56 overflow-y-auto">
                          {JSON.stringify(profileData, null, 2)}
                        </pre>
                        <span className="absolute top-2 right-2 rounded bg-neutral-800 text-[8px] text-neutral-400 px-1.5 py-0.5 uppercase tracking-wider">db payload</span>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

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
