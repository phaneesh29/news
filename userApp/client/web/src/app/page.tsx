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
  Newspaper,
  Gamepad2,
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

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-3xl pt-6">
            <Link href="/news" className="flex-1">
              <Button className="w-full bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold py-7 rounded-none vintage-shadow flex items-center justify-center gap-2 transition-transform hover:-translate-y-1">
                Access Newsroom
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/blog" className="flex-1">
              <Button variant="outline" className="w-full bg-[#fcfaf2] text-[#111111] hover:bg-[#efe9de] dark:bg-[#1f1e1b] dark:text-[#e6dfd8] dark:hover:bg-[#252320] border-2 border-[#111111] dark:border-[#e6dfd8] text-xs font-bold py-7 rounded-none vintage-shadow-sm flex items-center justify-center gap-2 transition-transform hover:-translate-y-1">
                Read Bulletins
                <BookOpen className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/playables" className="flex-1">
              <Button className="w-full bg-[#111111] hover:bg-[#333333] text-white dark:bg-[#e6dfd8] dark:hover:bg-[#ffffff] dark:text-[#111111] border-2 border-[#111111] dark:border-[#e6dfd8] text-xs font-bold py-7 rounded-none vintage-shadow flex items-center justify-center gap-2 transition-transform hover:-translate-y-1">
                Playables Hub
                <Gamepad2 className="h-4 w-4" />
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
            
            {/* Short Bits */}
            <div className="group border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-8 space-y-6 vintage-shadow hover:vintage-shadow-lg transition-all duration-300 relative flex flex-col justify-between hover:-translate-y-1">
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-current opacity-30 group-hover:border-[#cc785c] group-hover:opacity-100 transition-colors"></div>
              <div className="space-y-4">
                <div className="h-12 w-12 border-2 border-current text-[#cc785c] flex items-center justify-center vintage-shadow-sm group-hover:bg-[#cc785c] group-hover:text-white transition-colors">
                  <Newspaper className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold uppercase font-newspaper">Tactical Short Bits</h3>
                <p className="text-sm leading-relaxed opacity-85">
                  A continuous wire of concise, high-signal engineering updates, framework releases, and migration alerts. No fluff, just the critical bits.
                </p>
              </div>
              <Link href="/news" className="pt-6 block">
                <span className="text-sm font-bold uppercase tracking-wider text-[#cc785c] flex items-center gap-2 group-hover:underline">
                  Enter Newsroom
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>

            {/* Blog & Docs */}
            <div className="group border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-8 space-y-6 vintage-shadow hover:vintage-shadow-lg transition-all duration-300 relative flex flex-col justify-between hover:-translate-y-1">
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-current opacity-30 group-hover:border-[#cc785c] group-hover:opacity-100 transition-colors"></div>
              <div className="space-y-4">
                <div className="h-12 w-12 border-2 border-current text-[#cc785c] flex items-center justify-center vintage-shadow-sm group-hover:bg-[#cc785c] group-hover:text-white transition-colors">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold uppercase font-newspaper">In-Depth Dispatches</h3>
                <p className="text-sm leading-relaxed opacity-85">
                  Comprehensive architectural deep dives, post-mortems, and technical documentation formatted for maximum retention and late-night hacking.
                </p>
              </div>
              <Link href="/blog" className="pt-6 block">
                <span className="text-sm font-bold uppercase tracking-wider text-[#cc785c] flex items-center gap-2 group-hover:underline">
                  Read Dispatches
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>

            {/* Playables */}
            <div className="group border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-8 space-y-6 vintage-shadow hover:vintage-shadow-lg transition-all duration-300 relative flex flex-col justify-between hover:-translate-y-1">
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-current opacity-30 group-hover:border-[#cc785c] group-hover:opacity-100 transition-colors"></div>
              <div className="space-y-4">
                <div className="h-12 w-12 border-2 border-current text-[#cc785c] flex items-center justify-center vintage-shadow-sm group-hover:bg-[#cc785c] group-hover:text-white transition-colors">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl font-bold uppercase font-newspaper">Full Play Time</h3>
                <p className="text-sm leading-relaxed opacity-85">
                  Interactive technical assessments and developer amusements. Challenge your backend, infrastructure, and DevOps knowledge with our endless quiz engine.
                </p>
              </div>
              <Link href="/playables" className="pt-6 block">
                <span className="text-sm font-bold uppercase tracking-wider text-[#cc785c] flex items-center gap-2 group-hover:underline">
                  Explore Playables
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
