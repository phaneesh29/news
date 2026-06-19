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
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#141413] text-[#faf9f5] transition-transform group-hover:rotate-45">
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-serif text-xl font-medium tracking-tight text-[#141413]">DevBits</span>
              <span className="rounded bg-[#cc785c]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#cc785c]">AI Curation</span>
            </Link>

            <Link 
              href="/blogs" 
              className={`hidden sm:inline-block text-xs font-semibold transition-colors border-l border-[#e6dfd8] pl-4 ${
                pathname.startsWith("/blogs") ? "text-[#141413]" : "text-[#6c6a64] hover:text-[#141413]"
              }`}
            >
              Blogs
            </Link>

            <Link 
              href="/liked" 
              className={`hidden sm:inline-block text-xs font-semibold transition-colors border-l border-[#e6dfd8] pl-4 ${
                pathname === "/liked" ? "text-[#141413]" : "text-[#6c6a64] hover:text-[#141413]"
              }`}
            >
              Liked News
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
          <DialogContent className="max-w-md bg-[#faf9f5] border-[#e6dfd8] text-[#141413]">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-normal text-[#141413]">
                Submit Feedback
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6c6a64]">
                We'd love to hear your thoughts, suggestions, or bug reports! You can submit feedback multiple times.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {error && (
                <div className="text-xs text-[#c64545] bg-[#c64545]/10 p-2.5 rounded-md font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-xs text-[#5db872] bg-[#5db872]/10 p-2.5 rounded-md font-medium">
                  Feedback submitted successfully! Thank you for sharing your thoughts.
                </div>
              )}
              
              <div className="space-y-1.5">
                <label htmlFor="feedback-message" className="text-xs font-semibold text-[#141413] uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  id="feedback-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think..."
                  disabled={submitting || success}
                  className="w-full rounded-lg border border-[#e6dfd8] bg-transparent p-3 text-sm transition-colors outline-none focus:border-[#cc785c] focus:ring-1 focus:ring-[#cc785c] disabled:opacity-50 resize-none text-[#141413] placeholder:text-[#8e8b82]"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 border-t border-[#e6dfd8] pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsFeedbackOpen(false);
                  setMessage("");
                  setError(null);
                  setSuccess(false);
                }}
                disabled={submitting}
                className="text-xs text-[#6c6a64] hover:text-[#141413]"
              >
                {success ? "Close" : "Cancel"}
              </Button>
              {!success && (
                <Button
                  onClick={handleSubmitFeedback}
                  disabled={submitting || !message.trim()}
                  className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-0 text-xs flex items-center gap-1.5 h-8 px-4"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
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
