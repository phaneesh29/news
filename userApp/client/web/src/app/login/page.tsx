"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Info, ArrowLeft, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const { data: sessionData, isPending } = useSession();
  const activeUser = sessionData?.user;
  const router = useRouter();

  const [agreed, setAgreed] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  // Redirect to news if already logged in
  useEffect(() => {
    if (activeUser && !isPending) {
      router.push("/news");
    }
  }, [activeUser, isPending, router]);

  const handleGoogleLogin = async () => {
    if (!agreed) return;
    try {
      setSigningIn(true);
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/news"
      });
    } catch (err) {
      console.error("Google social authentication handshake failed:", err);
    } finally {
      setSigningIn(false);
    }
  };

  if (isPending || activeUser) {
    return (
      <div className="min-h-screen flex flex-col paper-grain justify-center items-center font-mono text-xs gap-3">
        <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
        <p>Connecting to secure grid database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col paper-grain selection:bg-[#cc785c]/20 selection:text-[#141413]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-6 sm:p-10 vintage-shadow-lg space-y-8 relative">
          
          <div className="text-center space-y-3 border-b-2 border-double border-current pb-6">
            <div className="h-14 w-14 rounded-none border-2 border-current text-[#cc785c] flex items-center justify-center vintage-shadow-sm bg-[#efe9de] dark:bg-[#252320] mx-auto">
              <Shield className="h-7 w-7 animate-pulse" />
            </div>
            <h2 className="font-serif text-2xl font-black uppercase font-newspaper tracking-wider">
              Identity Verification
            </h2>
            <p className="font-mono text-[9px] tracking-widest opacity-60">
              SECURE HANDSHAKE // GATEWAY LOGGED
            </p>
          </div>

          <div className="space-y-6">
            {/* Security memo */}
            <div className="border-2 border-current p-4 bg-current/5 font-mono text-[10px] md:text-xs leading-relaxed space-y-2">
              <p className="font-bold flex items-center gap-1.5 text-[#cc785c]">
                <Info className="h-4 w-4" /> DIRECTIVE 88-ALPHA
              </p>
              <p className="opacity-80">
                You are entering a monitored telemetry terminal. Secure authentication requires accepting platform operating directives.
              </p>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 select-none">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded-none border-2 border-current bg-[#fcfaf2] text-[#cc785c] accent-[#cc785c] cursor-pointer"
              />
              <label htmlFor="terms" className="font-mono text-[11px] leading-relaxed cursor-pointer opacity-90">
                I agree to the{" "}
                <Link href="/terms" className="text-[#cc785c] underline font-bold hover:opacity-80">
                  Terms of Service
                </Link>{" "}
                and acknowledge the{" "}
                <Link href="/privacy" className="text-[#cc785c] underline font-bold hover:opacity-80">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Google Sign In Button */}
            <div className="space-y-3 pt-2">
              <Button
                onClick={handleGoogleLogin}
                disabled={!agreed || signingIn}
                className={`w-full border-2 border-[#111111] dark:border-[#e6dfd8] text-xs font-bold py-6 rounded-none vintage-shadow flex items-center justify-center gap-3 transition-all ${
                  agreed && !signingIn
                    ? "bg-[#cc785c] hover:bg-[#a9583e] text-white cursor-pointer active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    : "bg-[#efe9de]/50 text-current/30 border-current/25 cursor-not-allowed shadow-none"
                }`}
              >
                {signingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    HANDSHAKING PROTOCOLS...
                  </>
                ) : (
                  <>
                    {/* Google Logo SVG */}
                    <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Sign In with Google Identity</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-dashed border-current flex justify-between items-center text-[10px] font-mono opacity-60">
            <Link href="/" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Return to lobby
            </Link>
            <span>SECURE GATEWAY v1.4 // SSL</span>
          </div>
        </div>
      </main>
    </div>
  );
}
