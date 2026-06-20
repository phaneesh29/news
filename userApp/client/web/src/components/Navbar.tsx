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
      const res = await submitFeedbackApi(message);
      if (res.status === "success") {
        setSuccess(true);
        setMessage("");
      } else {
        setError(res.message || "Failed to submit feedback.");
      }
    } catch (err: any) {
      console.error("Feedback submission failed:", err);
      setError(err.message || "An unexpected error occurred.");
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
      <header className="sticky top-0 z-40 border-b border-[#e6dfd8] bg-[#faf9f5]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/news" className="flex items-center gap-2 group">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#141413] text-[#faf9f5] transition-transform group-hover:rotate-45">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-serif text-xl font-medium tracking-tight text-[#141413]">DevBits</span>
              <span className="rounded bg-[#cc785c]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#cc785c]">AI Curation</span>
            </Link>

            <Link 
              href="/blog" 
              className={`hidden sm:inline-block text-xs font-semibold transition-colors border-l border-[#e6dfd8] pl-4 ${
                pathname.startsWith("/blog") && !pathname.startsWith("/blogs") ? "text-[#141413]" : "text-[#6c6a64] hover:text-[#141413]"
              }`}
            >
              Blog
            </Link>

            <Link 
              href="/liked" 
              className={`hidden sm:inline-block text-xs font-semibold transition-colors border-l border-[#e6dfd8] pl-4 ${
                pathname === "/liked" ? "text-[#141413]" : "text-[#6c6a64] hover:text-[#141413]"
              }`}
            >
              Liked News
            </Link>

            <Link 
              href="/settings" 
              className={`hidden sm:inline-block text-xs font-semibold transition-colors border-l border-[#e6dfd8] pl-4 ${
                pathname === "/settings" ? "text-[#141413]" : "text-[#6c6a64] hover:text-[#141413]"
              }`}
            >
              Settings
            </Link>

            {activeUser && (
              <>
                <Link 
                  href="/profile" 
                  className={`hidden sm:inline-block text-xs font-semibold transition-colors border-l border-[#e6dfd8] pl-4 ${
                    pathname === "/profile" ? "text-[#141413]" : "text-[#6c6a64] hover:text-[#141413]"
                  }`}
                >
                  Profile
                </Link>

                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#6c6a64] hover:text-[#141413] transition-colors border-l border-[#e6dfd8] pl-4"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Feedback
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isPending ? (
              <div className="h-8 w-24 bg-[#efe9de] animate-pulse rounded-md" />
            ) : activeUser ? (
              <div className="flex items-center gap-3">
                <Link href="/profile" className="flex items-center gap-3 group/avatar">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-semibold text-[#141413] max-w-[120px] truncate group-hover/avatar:text-[#cc785c] transition-colors">{activeUser.name}</p>
                    <p className="text-[9px] text-[#cc785c]/80 group-hover/avatar:text-[#cc785c] transition-colors font-medium">View Profile</p>
                  </div>
                  <Avatar className="h-8 w-8 border border-[#e6dfd8] group-hover/avatar:border-[#cc785c] transition-colors">
                    <AvatarImage src={activeUser.image || undefined} />
                    <AvatarFallback className="bg-[#cc785c] text-white font-medium text-xs">
                      {activeUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-[#e6dfd8] text-[#6c6a64] hover:text-[#141413] hover:bg-[#efe9de] text-xs h-8 px-3"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button 
                onClick={triggerGoogleLogin}
                className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-0 font-medium px-4 text-xs h-9 rounded-md transition-colors shadow-sm"
              >
                Sign In with Google
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
            setError(null);
            setSuccess(false);
          }
        }}>
          <DialogContent className="max-w-md border-4 rounded-none border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-6 vintage-shadow-lg text-inherit font-newspaper">
            <DialogHeader className="border-b border-[#e6dfd8] pb-4 space-y-2">
              <DialogTitle className="font-serif text-2xl font-black italic uppercase tracking-tight text-inherit font-newspaper">
                Letters to the Editor
              </DialogTitle>
              <DialogDescription className="text-xs font-mono tracking-wider opacity-60 uppercase">
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
                <label htmlFor="feedback-message" className="text-xs font-bold uppercase font-mono tracking-wider opacity-70 block">
                  CORRESPONDENCE TEXT:
                </label>
                <textarea
                  id="feedback-message"
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Draft your message to the editorial board..."
                  disabled={submitting || success}
                  className="w-full rounded-none border-2 border-[#111111] dark:border-[#e6dfd8] bg-transparent p-3 text-sm transition-colors outline-none focus:border-[#cc785c] disabled:opacity-50 resize-none font-serif placeholder:text-[#8e8b82] placeholder:italic"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end items-center gap-3 border-t border-[#e6dfd8] pt-4 font-mono">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setMessage("");
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
