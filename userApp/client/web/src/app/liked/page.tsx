"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchLikedNewsList, likeNewsApi, unlikeNewsApi, type NewsItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";
import { 
  Clock, 
  ChevronRight, 
  ArrowRight,
  ExternalLink,
  Loader2,
  Heart,
  Calendar,
  AlertCircle
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/components/SettingsProvider";

export default function LikedNewsPage() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;
  const { settings } = useSettings();

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

    // Determine dynamic font class based on current settings
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

    // Determine dynamic text scale class based on current settings
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

  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (!activeUser) return;

    async function loadLikedNews() {
      try {
        setLoading(true);
        const res = await fetchLikedNewsList();
        if (res.status === "success" && res.data) {
          setNews(res.data.news);
        }
      } catch (err) {
        console.error("Failed to load liked news:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLikedNews();
  }, [activeUser]);

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/liked"
      });
    } catch (err) {
      console.error("Authentication redirect error:", err);
    }
  };

  const handleLikeToggle = async (id: string) => {
    if (!activeUser) return;

    const newsItem = news.find(n => n.id === id);
    if (!newsItem) return;

    const previouslyLiked = newsItem.hasLiked;

    // Optimistic UI updates - since it's the liked page, we filter it out if unliked
    if (previouslyLiked) {
      setNews(prev => prev.filter(n => n.id !== id));
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle(null);
      }
    } else {
      setNews(prev => prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            hasLiked: true,
            likesCount: n.likesCount + 1
          };
        }
        return n;
      }));
    }

    try {
      if (previouslyLiked) {
        await unlikeNewsApi(id);
      } else {
        await likeNewsApi(id);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Re-fetch standard liked news list on error to be safe
      const res = await fetchLikedNewsList().catch(() => null);
      if (res && res.status === "success" && res.data) {
        setNews(res.data.news);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col paper-grain">
      <Navbar />

      {/* Retro Newspaper Masthead */}
      <header className="py-8 md:py-12 border-b-4 border-double border-current px-4 bg-transparent text-inherit text-center">
        <div className="mx-auto max-w-7xl flex flex-col items-center space-y-4">
          
          <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest border-b border-current pb-2 max-w-5xl">
            <span>SAVED REPOSITORY</span>
            <span>RECOMMENDED DOSSIERS</span>
            <span>SECTION D // SAVED WIRE</span>
          </div>

             {/* Gothic Masthead Title */}
             <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-inherit uppercase font-blackletter border-b border-current pb-4 w-full max-w-5xl whitespace-nowrap">
               Bulletins
             </h1>
 
             <div className="text-center font-serif italic text-sm border-t border-b border-current py-1 max-w-xl px-6 font-newspaper">
               "Your Personal Selection of Engineering Announcements & Intelligence Dispatches"
             </div></div>
      </header>

      {/* Main List */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        {isPending || (activeUser && loading) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs font-mono">Scanning saved catalog database...</p>
          </div>
        ) : !activeUser ? (
          <div className="border-2 border-dashed border-[#e6dfd8] rounded-none bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4 p-8 vintage-shadow text-center">
            <AlertCircle className="h-10 w-10 text-[#cc785c]" />
            <div>
              <h3 className="font-serif text-xl font-bold uppercase font-newspaper">Identity Verification Required</h3>
              <p className="text-xs opacity-75 mt-1.5 leading-relaxed max-w-md">
                Please log in to retrieve your personal dispatches storage record index.
              </p>
            </div>
            <Button 
              onClick={triggerGoogleLogin}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold px-6 py-2 h-9 rounded-none vintage-shadow transition-colors"
            >
              Sign In with Google
            </Button>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#e6dfd8] rounded-none bg-[#efe9de]/10 max-w-xl mx-auto p-8 vintage-shadow">
            <p className="text-sm font-serif italic mb-4">No dispatches have been saved to your records list.</p>
            <Link href="/news">
              <Button className="bg-[#111111] hover:bg-[#222222] text-white border-2 border-[#111111] text-xs font-bold rounded-none px-6 vintage-shadow-sm">
                Explore Broadcasts
              </Button>
            </Link>
          </div>
        ) : (
          <div className={
            settings.doubleColumn 
              ? "columns-1 md:columns-2 gap-8 space-y-8" 
              : "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          }>
            {news.map((item) => (
              <article 
                key={item.id} 
                className={`bg-[#fcfaf2] dark:bg-[#252320] border-2 border-[#111111] dark:border-[#e6dfd8] p-6 flex flex-col justify-between hover:-translate-y-0.5 transition-all vintage-shadow ${
                  settings.doubleColumn ? "inline-block w-full mb-8" : ""
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[#e6dfd8] pb-3 mb-4 text-[10px] font-mono uppercase tracking-wider">
                    <Badge className={`border-2 border-current text-[10px] font-bold py-0.5 px-2 bg-transparent rounded-none ${
                      item.priority === "critical"
                        ? "text-[#c64545]"
                        : item.priority === "high"
                        ? "text-[#cc785c]"
                        : item.priority === "medium"
                        ? "text-amber-600"
                        : "text-emerald-600"
                    }`}>
                      {item.priority}
                    </Badge>
                    <span className="opacity-75 font-mono">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  
                  <h3 
                    onClick={() => setSelectedArticle(item)}
                    className="font-serif text-xl sm:text-2xl font-black tracking-tight hover:text-[#cc785c] cursor-pointer transition-colors leading-tight font-newspaper"
                  >
                    {item.title}
                  </h3>

                  <p className="mt-4 text-xs md:text-sm leading-relaxed opacity-85 line-clamp-3">
                    {item.content}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-dashed border-[#e6dfd8]">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono opacity-65">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-[#111111]/15 dark:border-[#e6dfd8]/15 flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedArticle(item)}
                    className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[#cc785c]"
                  >
                    Read dispatch
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleLikeToggle(item.id)} 
                      className="flex items-center gap-1 text-xs hover:text-[#c64545] transition-colors p-1"
                      title="Unlike Dispatch"
                    >
                      <Heart className="h-4.5 w-4.5 fill-[#c64545] text-[#c64545] transition-transform active:scale-125" />
                      <span className="font-mono text-xs font-bold">{item.likesCount}</span>
                    </button>

                    {item.sourceUrl && (
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source Link" className="hover:text-[#cc785c] transition-colors p-1">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Article Detail Dialog Overlay - Made BIGGER & CLEANER */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
          <DialogContent className={`max-w-4xl w-[95vw] md:w-[85vw] lg:max-w-5xl border-4 rounded-none vintage-shadow-lg p-0 overflow-y-auto max-h-[90vh] ${getModalThemeClasses()}`}>
            
            {/* Unified sheet container */}
            <div className="p-6 md:p-10 space-y-8 max-w-3xl mx-auto">
              
              {/* Header Info */}
              <div className="space-y-4 border-b border-[#e6dfd8] pb-6">
                
                {/* Meta details */}
                <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#cc785c] flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    SAVED RECORD: {new Date(selectedArticle.createdAt).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                  
                  <Badge className={`border-2 border-current text-[9px] font-bold tracking-widest uppercase bg-transparent rounded-none px-2.5 py-0.5 ${
                    selectedArticle.priority === "critical"
                      ? "text-[#c64545]"
                      : selectedArticle.priority === "high"
                      ? "text-[#cc785c]"
                      : selectedArticle.priority === "medium"
                      ? "text-amber-600"
                      : "text-emerald-600"
                  }`}>
                    {selectedArticle.priority}
                  </Badge>
                </div>

                {/* Headline Title */}
                <DialogTitle className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-inherit uppercase font-newspaper">
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

              {/* Full Article Content */}
              <div className="text-base md:text-[18px] lg:text-[20px] leading-relaxed md:leading-[1.75] font-serif font-medium opacity-100 space-y-6 whitespace-pre-wrap py-4 selection:bg-[#cc785c]/35 newspaper-body">
                {selectedArticle.content}
              </div>

              {/* Tags */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-6 border-t border-[#e6dfd8]">
                  <span className="text-xs font-bold uppercase font-mono tracking-wider opacity-60">Index tags:</span>
                  {selectedArticle.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border border-current/30 rounded-none text-[10px] font-mono py-0.5 px-2">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="border-t border-[#e6dfd8] pt-6 flex flex-row items-center justify-between gap-4 font-mono">
                <button 
                  onClick={() => handleLikeToggle(selectedArticle.id)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider hover:text-[#c64545] p-1 transition-colors"
                  title="Unlike Dispatch"
                >
                  <Heart className="h-5 w-5 fill-[#c64545] text-[#c64545] transition-transform active:scale-125" />
                  <span>{selectedArticle.likesCount} Recommendations</span>
                </button>

                <Button 
                  onClick={() => setSelectedArticle(null)}
                  className="bg-transparent hover:bg-current/15 text-current border-2 border-current text-xs font-bold h-9 px-6 rounded-none vintage-shadow-sm transition-colors cursor-pointer"
                >
                  Close Dispatch
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
          <p className="opacity-50">© {new Date().getFullYear()} Curation Newsroom. Saved dispatches.</p>
        </div>
      </footer>
    </div>
  );
}
