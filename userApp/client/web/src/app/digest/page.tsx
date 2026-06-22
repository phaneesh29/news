"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn } from "@/lib/auth-client";
import { fetchDigest, type DigestData, type DigestCategory, type DigestArticle } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { 
  Clock, 
  ChevronRight, 
  ExternalLink,
  Loader2,
  AlertCircle,
  Link2,
  Sliders
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/components/SettingsProvider";
import ShareBriefing from "@/components/ShareBriefing";

export default function DigestPage() {
  const { data: sessionData, isPending } = useSession();
  const activeUser = sessionData?.user;
  const { settings } = useSettings();

  const [digest, setDigest] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<DigestArticle | null>(null);

  const handleSelectArticle = (item: DigestArticle) => {
    setSelectedArticle(item);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("article", item.title);
      window.history.pushState({}, "", url.pathname + url.search);
    }
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("article");
      window.history.pushState({}, "", url.pathname + url.search);
    }
  };

  // Sync state with URL search params (handling page load & browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined" && digest) {
        const params = new URLSearchParams(window.location.search);
        const articleTitle = params.get("article");
        if (articleTitle) {
          for (const category of digest.categories) {
            const found = category.articles.find(a => a.title === articleTitle);
            if (found) {
              setSelectedArticle(found);
              return;
            }
          }
        }
        setSelectedArticle(null);
      }
    };

    if (digest) {
      handlePopState(); // run once when digest loads
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [digest]);

  useEffect(() => {
    if (!activeUser) return;

    async function loadDigest() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchDigest();
        if (res.status === "success" && res.data) {
          setDigest(res.data);
        } else {
          setError(res.message || "Failed to retrieve digest data.");
        }
      } catch (err: any) {
        console.error("Failed to load digest:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }
    loadDigest();
  }, [activeUser]);

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/digest"
      });
    } catch (err) {
      console.error("Authentication redirect error:", err);
    }
  };

  const getModalThemeClasses = () => {
    let baseTheme = "";
    switch (settings.theme) {
      case "aged-paper":
        baseTheme = "bg-[#f5f2e9] text-[#111111] --theme-aged-paper border-[#111111]";
        break;
      case "classic-white":
        baseTheme = "bg-[#fcfaf2] text-[#111111] --theme-classic-white border-[#111111]";
        break;
      case "ink-dark":
        baseTheme = "bg-[#181715] text-[#efe9de] --theme-ink-dark dark border-[#3d3b37]";
        break;
      case "amber-terminal":
        baseTheme = "bg-[#0a0400] text-[#ff9d3b] --theme-amber-terminal border-[#ff9d3b] shadow-[inset_0_0_15px_rgba(255,157,59,0.3)]";
        break;
      case "green-terminal":
        baseTheme = "bg-[#000902] text-[#44ee77] --theme-green-terminal border-[#44ee77] shadow-[inset_0_0_15px_rgba(68,238,119,0.3)]";
        break;
      default:
        baseTheme = "bg-[#f5f2e9] text-[#111111] border-[#111111]";
    }

    let fontClass = "font-newspaper";
    if (settings.theme === "amber-terminal" || settings.theme === "green-terminal") {
      fontClass = "font-mono";
    } else {
      switch (settings.fontFamily) {
        case "newspaper":
          fontClass = "font-newspaper";
          break;
        case "serif":
          fontClass = "font-serif";
          break;
        case "sans":
          fontClass = "font-sans";
          break;
      }
    }

    let sizeClass = "text-scale-md";
    switch (settings.fontSize) {
      case "sm":
        sizeClass = "text-scale-sm";
        break;
      case "md":
        sizeClass = "text-scale-md";
        break;
      case "lg":
        sizeClass = "text-scale-lg";
        break;
      case "xl":
        sizeClass = "text-scale-xl";
        break;
    }

    return `${baseTheme} ${fontClass} ${sizeClass}`;
  };

  return (
    <div className="flex-1 flex flex-col paper-grain">
      <Navbar />

      {/* Retro Newspaper Masthead */}
      <header className="py-8 md:py-12 border-b-4 border-double border-current px-4 bg-transparent text-inherit text-center">
        <div className="mx-auto max-w-7xl flex flex-col items-center space-y-4">
          <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest border-b border-current pb-2 max-w-5xl">
            <span>INTELLIGENCE SYNDICATE</span>
            <span>AUTO-PARSED REPORT</span>
            <span>SECTION A // DIGEST WIRE</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-inherit uppercase font-blackletter border-b border-current pb-4 w-full max-w-5xl whitespace-nowrap">
            {digest?.title?.includes("NewsFetch") ? "Intel Wire" : (digest?.title || "Intel Wire")}
          </h1>

          <div className="text-center font-serif italic text-sm border-t border-b border-current py-1 max-w-xl px-6 font-newspaper">
            "{digest?.subtitle || "Developer-Focused AI News"}"
          </div>
          
          {digest?.lastUpdated && (
            <div className="text-[10px] font-mono opacity-70 uppercase tracking-wider">
              ✦ Last updated: {digest.lastUpdated}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        {isPending || (activeUser && loading) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs font-mono">Running parser algorithms on master dispatches...</p>
          </div>
        ) : !activeUser ? (
          <div className="border-2 border-dashed border-[#e6dfd8] rounded-none bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4 p-8 vintage-shadow text-center">
            <AlertCircle className="h-10 w-10 text-[#cc785c]" />
            <div>
              <h3 className="font-serif text-xl font-bold uppercase font-newspaper">Identity Verification Required</h3>
              <p className="text-xs opacity-75 mt-1.5 leading-relaxed max-w-md">
                Please log in to synchronize secure node feeds and view parsed daily news digest.
              </p>
            </div>
            <Button 
              onClick={triggerGoogleLogin}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold px-6 py-2 h-9 rounded-none vintage-shadow transition-colors"
            >
              Sign In with Google
            </Button>
          </div>
        ) : error ? (
          <div className="border-2 border-[#c64545] rounded-none bg-[#c64545]/15 max-w-2xl mx-auto p-6 vintage-shadow text-center space-y-4">
            <AlertCircle className="h-10 w-10 text-[#c64545] mx-auto" />
            <div>
              <h3 className="font-serif text-lg font-bold uppercase text-[#c64545] font-newspaper">Digest Transmission Interrupted</h3>
              <p className="text-xs opacity-85 mt-1.5 leading-relaxed">
                {error}
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-transparent hover:bg-current/10 border-2 border-current text-xs font-bold rounded-none px-6"
            >
              Attempt Reconnection
            </Button>
          </div>
        ) : !digest ? (
          <div className="text-center py-20">
            <p className="text-sm font-serif italic">No digest reports compiled for today.</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Top row: Executive Summary & Pipeline Stats */}
            <div className="grid lg:grid-cols-3 gap-8">
              
              {/* Executive Summary */}
              <div className="lg:col-span-2 border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-6 vintage-shadow relative flex flex-col justify-between">
                <div className="space-y-3">
                  <h3 className="font-serif text-xl md:text-2xl font-black uppercase font-newspaper border-b border-current pb-2 flex items-center gap-2">
                    <span>📋</span> Executive Summary (TL;DR)
                  </h3>
                  <p className="text-xs md:text-sm leading-relaxed opacity-95 pt-2 whitespace-pre-line font-newspaper font-medium">
                    {digest.executiveSummary}
                  </p>
                </div>
              </div>

              {/* Pipeline Stats */}
              <div className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] p-6 vintage-shadow font-mono">
                <h3 className="font-serif text-lg font-bold uppercase font-newspaper border-b border-current pb-2 flex items-center gap-2 mb-4">
                  <span>📊</span> Pipeline Stats
                </h3>
                <div className="space-y-2.5 text-xs">
                  {Object.entries(digest.stats).map(([key, val]) => {
                    const niceKey = key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase());
                    
                    return (
                      <div key={key} className="flex justify-between border-b border-dashed border-current/10 pb-1.5">
                        <span className="opacity-70">{niceKey}:</span>
                        <span className="font-bold">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Key Industry Trends */}
            {digest.trends && digest.trends.length > 0 && (
              <div className="border-2 border-double border-[#111111] dark:border-[#e6dfd8] bg-[#efe9de]/15 dark:bg-[#1f1e1b]/40 p-6 vintage-shadow">
                <h3 className="font-serif text-xl font-black uppercase font-newspaper border-b border-current pb-2 flex items-center gap-2 mb-4">
                  <span>📈</span> Key Industry Trends
                </h3>
                <ul className="grid md:grid-cols-3 gap-6">
                  {digest.trends.map((item, idx) => (
                    <li key={idx} className="space-y-2 border-r last:border-r-0 border-dashed border-current/15 pr-4">
                      <div className="flex items-center gap-2 font-serif font-black text-sm uppercase font-newspaper">
                        <span className="text-[#cc785c] font-mono text-[10px] bg-current/5 border border-current px-1.5 py-0.5">0{idx + 1}</span>
                        {item.trend}
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-85">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Category Blocks */}
            <div className="space-y-12">
              <div className="text-center font-mono text-xs uppercase tracking-widest border-t-2 border-b-2 border-current py-2 max-w-5xl mx-auto my-8">
                CLASSIFIED EDITORIAL FEED CATEGORIES
              </div>

              {digest.categories.map((cat, catIdx) => (
                <div key={catIdx} className="space-y-6">
                  <h2 className="font-serif text-2xl sm:text-3xl font-black uppercase font-newspaper border-b-2 border-current pb-2 flex items-center gap-2">
                    <span>{cat.emoji}</span> {cat.name}
                  </h2>

                  <div className={`grid ${settings.doubleColumn ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} border-t border-l border-current`}>
                    {cat.articles.map((item, artIdx) => (
                      <article 
                        key={artIdx} 
                        className="border-b border-r border-current p-6 flex flex-col justify-between hover:bg-current/[0.015] dark:hover:bg-[#201f1c]/30 transition-colors relative group"
                      >
                        <div>
                          <div className="flex items-center justify-between pb-2 mb-3 text-[10px] font-mono uppercase tracking-wider opacity-75 border-b border-dashed border-current/15">
                            <span className="flex items-center gap-1.5 font-bold">
                              <span className={
                                item.type.toLowerCase().includes("breaking")
                                  ? "text-red-600 dark:text-red-400"
                                  : item.type.toLowerCase().includes("trending")
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-blue-600 dark:text-blue-400"
                              }>
                                ●
                              </span>
                              {item.type}
                            </span>
                            <span className="font-bold opacity-80">
                              Impact: {item.impact}/10
                            </span>
                          </div>

                          <h3 
                            onClick={() => handleSelectArticle(item)}
                            className="font-serif text-lg md:text-xl font-bold tracking-tight hover:text-[#cc785c] dark:hover:text-[#ff9d3b] cursor-pointer transition-colors leading-tight font-newspaper group-hover:underline decoration-1"
                          >
                            {item.title}
                          </h3>

                          <p className="mt-3 text-xs md:text-sm leading-relaxed opacity-85 font-serif font-medium line-clamp-4">
                            {item.summary}
                          </p>

                          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-dashed border-current/15 font-mono text-[9px] opacity-70">
                            <div>Confidence: <span className="font-bold text-[#cc785c] dark:text-[#ff9d3b]">{item.confidence}</span></div>
                            {item.score && <div>Metric Score: <span className="font-bold">{item.score}/10</span></div>}
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-current/10 flex items-center justify-between">
                          <button 
                            onClick={() => handleSelectArticle(item)}
                            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 group-hover:text-[#cc785c] dark:group-hover:text-[#ff9d3b] transition-colors font-mono"
                          >
                            Read dossier
                            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </button>
                          
                          {item.sourceUrl && (
                            <a 
                              href={item.sourceUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              title="View Source Link" 
                              className="opacity-60 hover:opacity-100 hover:text-[#cc785c] dark:hover:text-[#ff9d3b] transition-colors p-1"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Article Detail Dialog Overlay */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && handleCloseArticle()}>
          <DialogContent className={`max-w-4xl w-[95vw] md:w-[85vw] lg:max-w-5xl border-4 rounded-none vintage-shadow-lg p-0 overflow-y-auto max-h-[90vh] ${getModalThemeClasses()}`}>
            <div className="p-6 md:p-10 space-y-8 max-w-3xl mx-auto">
              
              {/* Header Info */}
              <div className="space-y-4 border-b border-[#e6dfd8] pb-6">
                <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#cc785c] flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    CONFIDENCE CLASSIFICATION: {selectedArticle.confidence}
                  </span>
                  
                  <Badge className="border-2 border-current text-[9px] font-bold tracking-widest uppercase bg-transparent rounded-none px-2.5 py-0.5 text-[#cc785c]">
                    {selectedArticle.emoji} {selectedArticle.type}
                  </Badge>

                  <span className="font-bold">
                    IMPACT SCORE: {selectedArticle.impact}/10
                  </span>
                </div>

                <DialogTitle className="font-serif text-2xl sm:text-3xl lg:text-4xl font-black leading-tight text-inherit uppercase font-newspaper">
                  {selectedArticle.title}
                </DialogTitle>
              </div>

              {/* Source Link */}
              {selectedArticle.sourceUrl && (
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] md:text-xs border-b border-[#e6dfd8] pb-4">
                  <span className="opacity-60">Source Link:</span>
                  <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#cc785c] hover:underline flex items-center gap-1 font-bold break-all">
                    {selectedArticle.sourceUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Share Briefing component */}
              <div className="border-b border-[#e6dfd8] pb-4">
                <ShareBriefing
                  url={typeof window !== "undefined" ? `${window.location.origin}/digest?article=${encodeURIComponent(selectedArticle.title)}` : ""}
                  title={selectedArticle.title}
                />
              </div>

              {/* Article Content / Summary */}
              <div className="space-y-6 py-2">
                <div className="text-base md:text-[18px] lg:text-[20px] leading-relaxed md:leading-[1.75] font-serif font-medium opacity-100 whitespace-pre-wrap newspaper-body">
                  {selectedArticle.summary}
                </div>

                {/* Scoring breakdown grid */}
                {selectedArticle.scoringBreakdown && Object.keys(selectedArticle.scoringBreakdown).length > 0 && (
                  <div className="border-2 border-current p-4 bg-current/5 font-mono text-xs space-y-3">
                    <div className="font-bold uppercase tracking-wider border-b border-current pb-1 flex items-center gap-1.5">
                      <Sliders className="h-4 w-4" /> Scoring Analysis Breakdown {selectedArticle.score && `(Total Score: ${selectedArticle.score}/10)`}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                      {Object.entries(selectedArticle.scoringBreakdown).map(([k, v]) => (
                        <div key={k} className="space-y-1">
                          <div className="opacity-70 uppercase text-[9px]">{k}:</div>
                          <div className="text-sm font-bold">{v}/10</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Verified Sources list */}
              {selectedArticle.sources && selectedArticle.sources.length > 0 && (
                <div className="flex flex-col gap-2 pt-6 border-t border-[#e6dfd8] font-mono text-xs">
                  <span className="font-bold uppercase tracking-wider opacity-60">CROSS-REFERENCED SOURCES:</span>
                  <ul className="space-y-1.5">
                    {selectedArticle.sources.map((src, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Link2 className="h-3.5 w-3.5 text-[#cc785c]" />
                        <a href={src.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#cc785c] underline font-bold">
                          {src.name}
                        </a>
                        <span className="opacity-50 text-[10px] font-normal">({src.url})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="border-t border-[#e6dfd8] pt-6 flex flex-row items-center justify-end font-mono">
                <Button 
                  onClick={handleCloseArticle}
                  className="bg-transparent hover:bg-current/15 text-current border-2 border-current text-xs font-bold h-9 px-6 rounded-none vintage-shadow-sm transition-colors cursor-pointer"
                >
                  Dismiss Dossier
                </Button>
              </div>

            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 border-t-4 border-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono">
          <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>
          <p className="opacity-50">© {new Date().getFullYear()} Curation Newsroom. Digest wire dispatches.</p>
        </div>
      </footer>
    </div>
  );
}
