"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import authClient, { useSession, signIn, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, Loader2, MessageSquare } from "lucide-react";
import { submitFeedbackApi } from "@/lib/api";

export default function Navbar() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;
  const pathname = usePathname();

  // Feedback states
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [category, setCategory] = useState("other");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Google social login
  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: typeof window !== "undefined" ? window.location.href : "/"
      });
    } catch (err) {
      console.error("Authentication redirect error:", err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    refetch();
  };

  const handleSubmitFeedback = async () => {
    if (!message.trim()) return;
    try {
      setSubmitting(true);
      setError(null);
      const res = await submitFeedbackApi(category, message);
      if (res.status === "success") {
        setSuccess(true);
        setMessage("");
        setCategory("other");
      } else {
        setError(res.message || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error("Feedback submission failed:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Google One Tap init
  useEffect(() => {
    if (!activeUser && !isPending) {
      authClient.oneTap().catch((err) => {
        console.warn("Google One Tap automatic prompt failed to initialize:", err);
      });
    }
  }, [activeUser, isPending]);

  return (
    <>
      <header className="sticky top-0 z-[10000] border-b-2 border-double border-current bg-background/90 backdrop-blur-xl backdrop-saturate-150 text-foreground newspaper-theme-nav shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/news" className="flex items-center gap-2.5 group select-none">
              {/* Newspaper Metal Press Block Icon */}
              <div className="flex h-8 w-8 items-center justify-center border-2 border-current bg-current/5 text-current transition-transform group-hover:scale-105 duration-200">
                <span className="font-serif text-base font-black tracking-tighter uppercase font-blackletter">
                  DB
                </span>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="font-serif text-lg font-black tracking-tight text-current uppercase font-newspaper">
                  DevBits
                </span>
                <span className="text-[7.5px] font-mono tracking-widest uppercase opacity-60">
                  Daily Dispatch
                </span>
              </div>
            </Link>

            {/* News Tab */}
            <Link 
              href="/news" 
              className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider transition-colors border-l border-current/15 pl-4 ${
                pathname === "/news" ? "text-current" : "text-current/60 hover:text-current"
              }`}
            >
              News
            </Link>

            {/* Digest Tab */}
            <Link 
              href="/digest" 
              className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider transition-colors border-l border-current/15 pl-4 ${
                pathname === "/digest" ? "text-current" : "text-current/60 hover:text-current"
              }`}
            >
              Briefs
            </Link>

            {/* Blog Tab */}
            <Link 
              href="/blog" 
              className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider transition-colors border-l border-current/15 pl-4 ${
                pathname.startsWith("/blog") && !pathname.startsWith("/blogs") ? "text-current" : "text-current/60 hover:text-current"
              }`}
            >
              Blog
            </Link>

            {/* Liked News Tab */}
            <Link 
              href="/liked" 
              className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider transition-colors border-l border-current/15 pl-4 ${
                pathname === "/liked" ? "text-current" : "text-current/60 hover:text-current"
              }`}
            >
              Liked News
            </Link>

            {/* Settings Tab */}
            <Link 
              href="/settings" 
              className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider transition-colors border-l border-current/15 pl-4 ${
                pathname === "/settings" ? "text-current" : "text-current/60 hover:text-current"
              }`}
            >
              Settings
            </Link>

            {activeUser && (
              <>
                <Link 
                  href="/profile" 
                  className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider transition-colors border-l border-current/15 pl-4 ${
                    pathname === "/profile" ? "text-current" : "text-current/60 hover:text-current"
                  }`}
                >
                  Profile
                </Link>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-current/60 hover:text-current transition-colors border-l border-current/15 pl-4 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Feedback
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="h-8 w-24 bg-current/10 animate-pulse rounded-none" />
            ) : activeUser ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-3 group/avatar">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-current max-w-[120px] truncate group-hover/avatar:text-[#cc785c] transition-colors">{activeUser.name}</p>
                    <p className="text-[9px] text-[#cc785c] group-hover/avatar:text-[#cc785c] transition-colors font-bold uppercase tracking-wider">View Profile</p>
                  </div>
                  <Avatar className="h-8 w-8 border border-current/20 group-hover/avatar:border-[#cc785c] transition-colors rounded-full">
                    <AvatarImage src={activeUser.image || undefined} className="rounded-full" />
                    <AvatarFallback className="bg-[#cc785c] text-white font-bold text-xs rounded-full">
                      {activeUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-current/25 text-current hover:bg-current/10 text-xs h-8 px-3 rounded-none transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={triggerGoogleLogin}
                className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] font-bold uppercase tracking-wider px-4 text-xs h-9 rounded-none transition-colors shadow-sm cursor-pointer"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Feedback Modal Dialog */}
      {isFeedbackOpen && (
        <Dialog open={isFeedbackOpen} onOpenChange={(open) => {
          setIsFeedbackOpen(open);
          if (!open) {
            setMessage("");
            setCategory("other");
            setIsCategoryDropdownOpen(false);
            setError(null);
            setSuccess(false);
          }
        }}>
          <DialogContent className="max-w-md border-4 rounded-none border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-6 vintage-shadow-lg text-inherit font-newspaper">
            <DialogHeader className="border-b border-[#e6dfd8] pb-4 space-y-2">
              <DialogTitle className="text-3xl font-normal tracking-wide text-inherit font-blackletter border-b-2 border-[#111111] dark:border-[#e6dfd8] inline-block pb-1">
                Letters to the Editor
              </DialogTitle>
              <DialogDescription className="text-xs font-sans font-medium opacity-70 italic pt-1">
                Submit dispatches, commentaries, or telemetry bug reports.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {error && (
                <div className="text-xs text-[#c64545] bg-[#c64545]/10 border border-[#c64545] p-3 rounded-none font-mono">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-xs text-emerald-600 bg-emerald-600/10 border border-emerald-600 p-3 rounded-none font-mono">
                  DISPATCH SUBMITTED. Thank you for your correspondence.
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase font-sans tracking-[0.15em] opacity-80 block text-[#cc785c]">
                  CATEGORY:
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    disabled={submitting || success}
                    className="w-full flex items-center justify-between rounded-none border-2 border-[#111111] dark:border-[#e6dfd8] bg-transparent p-3 text-sm transition-colors outline-none focus:border-[#cc785c] hover:border-[#cc785c]/70 disabled:opacity-50 font-mono cursor-pointer"
                  >
                    <span>
                      {category === "feature" && "Feature Request"}
                      {category === "improvement" && "Improvement"}
                      {category === "bug" && "Bug Fix"}
                      {category === "other" && "Other"}
                    </span>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  
                  {isCategoryDropdownOpen && !submitting && !success && (
                    <div className="absolute z-10 w-full mt-1 border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] shadow-md animate-in fade-in zoom-in-95 duration-100">
                      {[
                        { value: "feature", label: "Feature Request" },
                        { value: "improvement", label: "Improvement" },
                        { value: "bug", label: "Bug Fix" },
                        { value: "other", label: "Other" }
                      ].map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => {
                            setCategory(c.value);
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-mono hover:bg-[#111111]/5 dark:hover:bg-[#e6dfd8]/5 transition-colors cursor-pointer border-b last:border-0 border-[#111111]/10 dark:border-[#e6dfd8]/10 ${category === c.value ? "bg-[#cc785c]/10 dark:bg-[#cc785c]/20 font-bold text-[#cc785c]" : ""}`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="feedback-message" className="text-[10px] font-bold uppercase font-sans tracking-[0.15em] opacity-80 block text-[#cc785c]">
                  CORRESPONDENCE TEXT:
                </label>
                <textarea
                  id="feedback-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Draft your message to the editorial board..."
                  disabled={submitting || success}
                  className="w-full rounded-none border-2 border-[#111111] dark:border-[#e6dfd8] bg-transparent p-3 text-sm transition-colors outline-none focus:border-[#cc785c] disabled:opacity-50 resize-none font-mono placeholder:text-[#8e8b82] placeholder:font-sans placeholder:italic"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end items-center gap-3 border-t border-[#e6dfd8] pt-4 font-mono">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setMessage("");
                  setCategory("other");
                  setIsCategoryDropdownOpen(false);
                  setError(null);
                  setSuccess(false);
                }}
                disabled={submitting}
                className="text-xs font-bold uppercase tracking-wider text-current hover:bg-current/10 rounded-none h-9 px-4 transition-colors cursor-pointer"
              >
                {success ? "Dismiss" : "Cancel"}
              </Button>
              {!success && (
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submitting || !message.trim()}
                  className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold uppercase tracking-wider h-9 px-4 rounded-none vintage-shadow-sm transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      TRANSMITTING...
                    </>
                  ) : (
                    "Send Dispatch"
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
