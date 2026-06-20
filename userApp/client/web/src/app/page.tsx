"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Terminal, 
  Settings as SettingsIcon, 
  BookOpen, 
  FileText, 
  Tv, 
  Clock, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const { data: sessionData } = useSession();
  const activeUser = sessionData?.user;
  const [typedText, setTypedText] = useState("");
  const fullText = "INITIALIZING DEVBITS WIRE... INDEXING OPEN SOURCE STREAMS... READY.";

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.substring(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, []);

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/news"
      });
    } catch (err) {
      console.error("Google sign in redirect failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#cc785c]/20 selection:text-[#141413]">
      <Navbar />

      {/* Hero Section styled as a classical editorial layout */}
      <section className="relative flex-1 flex flex-col justify-center items-center py-16 md:py-24 px-4 bg-transparent text-center border-b-4 border-double border-current">
        <div className="mx-auto max-w-5xl flex flex-col items-center space-y-6 md:space-y-8">
          
          {/* Top category label */}
          <div className="inline-flex items-center gap-2 rounded-none border border-current px-3 py-1 text-[10px] font-mono uppercase tracking-widest font-bold">
            <Clock className="h-3.5 w-3.5 text-[#cc785c]" />
            Continuous Broadcast System v1.4
          </div>

          {/* DevBits main masthead banner */}
          <div className="space-y-2">
            <h1 className="font-serif text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight text-inherit uppercase font-blackletter select-none">
              DevBits
            </h1>
            <div className="text-center font-serif italic text-sm md:text-lg opacity-80 max-w-xl mx-auto font-newspaper pt-2">
              "Engineering analytics, migration risk alerts, and tactical bulletins parsed for builders."
            </div>
          </div>

          {/* Live terminal preview ribbon */}
          <div className="w-full max-w-2xl bg-[#0a0400] text-[#ff9d3b] border-2 border-[#111111] p-3 font-mono text-[10px] md:text-xs text-left vintage-shadow-sm flex items-center justify-between relative overflow-hidden select-none">
            <div className="absolute inset-0 pointer-events-none scanline-sweeper opacity-25" />
            <div className="flex items-center gap-2 z-10">
              <span className="h-2 w-2 rounded-full bg-[#ff9d3b] animate-ping" />
              <span>{typedText}</span>
            </div>
            <span className="opacity-60 hidden sm:inline-block z-10">BAUD 9600</span>
          </div>

          <p className="max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed opacity-85">
            DevBits continuously indexes framework releases, compiler bulletins, and strategic announcements to deliver structured dispatches. No fluff, just core indicators.
          </p>

          {/* Enter Newsroom buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md pt-4">
            <Link href="/news" className="flex-1">
              <Button className="w-full bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold py-6 rounded-none vintage-shadow flex items-center justify-center gap-1.5 transition-transform hover:-translate-y-0.5">
                Access Newsroom
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/blog" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent hover:bg-[#efe9de] dark:hover:bg-[#252320] border-2 border-[#111111] dark:border-[#e6dfd8] text-xs font-bold py-6 rounded-none vintage-shadow-sm">
                Read bulletins
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid & Tactile Dossiers */}
      <section className="py-16 md:py-24 px-4 bg-transparent">
        <div className="mx-auto max-w-6xl space-y-12">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-black uppercase font-newspaper">
              Classified Features Directory
            </h2>
            <p className="text-xs font-mono opacity-75">
              Readability custom-tuned for high-retention late night hacking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Display config */}
            <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-6 space-y-4 vintage-shadow relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 border border-current text-[#cc785c] flex items-center justify-center vintage-shadow-sm">
                  <Tv className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-bold uppercase font-newspaper">Cathode Display Tones</h3>
                <p className="text-xs leading-relaxed opacity-85">
                  Toggle between aged pulp paper, dark ink, amber console terminals, or green cathode rays. Full simulation of vintage scanlines and CRT vignettes.
                </p>
              </div>
              <Link href="/settings" className="pt-4 block">
                <span className="text-xs font-bold uppercase tracking-wider text-[#cc785c] flex items-center gap-1 hover:underline">
                  Configure display
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            {/* Readability & columns */}
            <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-6 space-y-4 vintage-shadow relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 border border-current text-[#cc785c] flex items-center justify-center vintage-shadow-sm">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-bold uppercase font-newspaper">Broadsheet Columns</h3>
                <p className="text-xs leading-relaxed opacity-85">
                  Split your news wire stream into classic newspaper double columns. Built-in warmth sliders filter orange hues directly in your viewport to prevent eye strain.
                </p>
              </div>
              <Link href="/settings" className="pt-4 block">
                <span className="text-xs font-bold uppercase tracking-wider text-[#cc785c] flex items-center gap-1 hover:underline">
                  Configure typography
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

            {/* Strategic dispatches outline */}
            <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-6 space-y-4 vintage-shadow relative flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-10 w-10 border border-current text-[#cc785c] flex items-center justify-center vintage-shadow-sm">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="font-serif text-xl font-bold uppercase font-newspaper">Scroll-Spy Chronicle Outline</h3>
                <p className="text-xs leading-relaxed opacity-85">
                  Read strategic technical blogs equipped with dynamic table of contents. Highlights headings automatically on scroll for quick layout scanning.
                </p>
              </div>
              <Link href="/blog" className="pt-4 block">
                <span className="text-xs font-bold uppercase tracking-wider text-[#cc785c] flex items-center gap-1 hover:underline">
                  Read dispatches
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Security Handshake banner */}
      <section className="bg-[#efe9de] dark:bg-[#252320] border-t-2 border-b-2 border-[#111111] dark:border-[#e6dfd8] py-8 px-4 text-center">
        <div className="mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <span>Secure session synchronization active</span>
          </div>
          {activeUser ? (
            <span className="opacity-75">Signed in securely as: {activeUser.email}</span>
          ) : (
            <button 
              onClick={triggerGoogleLogin}
              className="text-[#cc785c] hover:text-[#a9583e] font-bold underline flex items-center gap-1"
            >
              Sign In with Social Identity
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 border-t-4 border-[#111111]">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          </div>

          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>

          <p className="opacity-50">
            © {new Date().getFullYear()} DevBits Curation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
