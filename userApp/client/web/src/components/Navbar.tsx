"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import authClient, { useSession, signIn, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { LogOut, Loader2, MessageSquare, Menu, X } from "lucide-react";


export default function Navbar() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;
  const pathname = usePathname();

  // Mobile Menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);



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
              {/* DevBits Logo */}
              <div className="flex h-10 w-10 p-[2px] items-center justify-center border-2 border-current bg-transparent text-current transition-transform group-hover:scale-105 duration-200 rounded-md">
                <div className="relative w-full h-full">
                  <Image src="/devbits-logo.png" alt="DevBits Logo" fill sizes="36px" className="object-contain" />
                </div>
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

            {/* Playables Tab */}
            <Link 
              href="/playables" 
              className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider transition-colors border-l border-current/15 pl-4 ${
                pathname.startsWith("/playables") ? "text-current" : "text-current/60 hover:text-current"
              }`}
            >
              Playables
            </Link>

            {/* Docs Tab */}
            <Link 
              href="/docs" 
              className={`hidden sm:inline-block text-xs font-bold uppercase tracking-wider transition-colors border-l border-current/15 pl-4 ${
                pathname.startsWith("/docs") ? "text-current" : "text-current/60 hover:text-current"
              }`}
            >
              Docs
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
            
            {/* Mobile Menu Toggle */}
            <button 
              className="sm:hidden p-2 text-current cursor-pointer hover:bg-current/10 transition-colors rounded-md" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t-2 border-double border-current bg-background/95 backdrop-blur-xl px-4 py-4 space-y-4 shadow-md animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/news" 
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${pathname === "/news" ? "text-current" : "text-current/70"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                News
              </Link>
              <Link 
                href="/digest" 
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${pathname === "/digest" ? "text-current" : "text-current/70"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Briefs
              </Link>
              <Link 
                href="/blog" 
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${pathname.startsWith("/blog") && !pathname.startsWith("/blogs") ? "text-current" : "text-current/70"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/liked" 
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${pathname === "/liked" ? "text-current" : "text-current/70"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Liked News
              </Link>
              <Link 
                href="/playables" 
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${pathname.startsWith("/playables") ? "text-current" : "text-current/70"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Playables
              </Link>
              <Link 
                href="/docs" 
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${pathname.startsWith("/docs") ? "text-current" : "text-current/70"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Docs
              </Link>
              <Link 
                href="/settings" 
                className={`text-sm font-bold uppercase tracking-wider transition-colors ${pathname === "/settings" ? "text-current" : "text-current/70"}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Settings
              </Link>

            </nav>
          </div>
        )}
      </header>


    </>
  );
}
