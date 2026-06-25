"use client";

import React, { useEffect } from "react";
import { useSession, signIn } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, Lock, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending } = useSession();
  const activeUser = sessionData?.user;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isPending && !activeUser) {
      router.push("/login");
    }
  }, [activeUser, isPending, router]);

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + pathname
      });
    } catch (err) {
      console.error("Google sign in redirect failed:", err);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfaf2] dark:bg-[#141413] text-[#111111] dark:text-[#fcfaf2]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center font-mono text-xs gap-3">
          <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
          <p>Verifying identity clearance...</p>
        </div>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="min-h-screen flex flex-col bg-[#fcfaf2] dark:bg-[#141413] text-[#111111] dark:text-[#fcfaf2] selection:bg-[#cc785c]/30">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-white dark:bg-[#1f1e1b] max-w-md w-full p-8 text-center flex flex-col items-center gap-6 mx-auto vintage-shadow">
            <div className="h-16 w-16 rounded-none border-[3px] border-[#111111] dark:border-[#e6dfd8] text-[#cc785c] flex items-center justify-center vintage-shadow-sm bg-[#efe9de] dark:bg-[#252320]">
              <Lock className="h-8 w-8" />
            </div>
            
            <div className="space-y-3">
              <h2 className="font-serif text-3xl font-black uppercase font-newspaper">Restricted Area</h2>
              <p className="text-sm font-mono opacity-75 leading-relaxed px-4">
                The Tools Hub requires a verified identity module. Proceed via secure gateway below.
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
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
