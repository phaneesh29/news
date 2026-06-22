"use client";

import React, { useState, useEffect } from "react";
import authClient, { useSession, signIn, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Clock, 
  ChevronRight, 
  Check, 
  ArrowRight,
  LogOut,
  ExternalLink,
  Loader2,
  Heart,
  Sliders,
  Settings as SettingsIcon,
  BookOpen,
  Calendar,
  AlertCircle
} from "lucide-react";
import { fetchNewsList, searchNewsList, likeNewsApi, unlikeNewsApi, type NewsItem } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/components/SettingsProvider";
import ShareBriefing from "@/components/ShareBriefing";

export default function NewsBroadcastsPage() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;
  const { settings } = useSettings();
  const router = useRouter();

  // Redirect to login if user is logged out
  useEffect(() => {
    if (!isPending && !activeUser) {
      router.push("/login");
    }
  }, [activeUser, isPending, router]);

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

  // News States
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  const handleSelectArticle = (item: NewsItem) => {
    setSelectedArticle(item);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("article", item.id);
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
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const articleId = params.get("article");
        if (articleId) {
          const found = news.find(n => n.id === articleId);
          if (found) {
            setSelectedArticle(found);
            return;
          }
        }
        setSelectedArticle(null);
      }
    };

    if (news.length > 0) {
      handlePopState(); // run once when news loads
    }

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [news]);

  // Fetch & search news effect
  useEffect(() => {
    if (!activeUser) {
      setNews([]);
      setNextCursor(null);
      if (!isPending) {
        setLoadingNews(false);
      }
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setLoadingNews(true);
        if (searchQuery.trim() === "" && priorityFilter === "") {
          const res = await fetchNewsList();
          if (res.status === "success" && res.data) {
            setNews(res.data.news);
            setNextCursor(res.data.nextCursor);
          }
        } else {
          const res = await searchNewsList(searchQuery, priorityFilter || undefined);
          if (res.status === "success" && res.data) {
            setNews(res.data.news);
            setNextCursor(null);
          }
        }
      } catch (err) {
        console.error("Failed to load or search news articles:", err);
      } finally {
        setLoadingNews(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, priorityFilter, activeUser, isPending]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore || !activeUser) return;
    try {
      setLoadingMore(true);
      const res = await fetchNewsList(nextCursor);
      if (res.status === "success" && res.data) {
        const data = res.data;
        setNews(prev => [...prev, ...data.news]);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load more dispatches:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!activeUser && !isPending) {
      authClient.oneTap().catch((err) => {
        console.warn("Google One Tap automatic prompt failed to initialize:", err);
      });
    }
  }, [activeUser, isPending]);

  const handleLikeToggle = async (id: string) => {
    if (!activeUser) return;
    
    const newsItem = news.find(n => n.id === id);
    if (!newsItem) return;

    const previouslyLiked = newsItem.hasLiked;
    
    // Optimistic UI updates
    setNews(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          hasLiked: !previouslyLiked,
          likesCount: previouslyLiked ? Math.max(0, n.likesCount - 1) : n.likesCount + 1
        };
      }
      return n;
    }));

    if (selectedArticle && selectedArticle.id === id) {
      setSelectedArticle(prev => prev ? {
        ...prev,
        hasLiked: !previouslyLiked,
        likesCount: previouslyLiked ? Math.max(0, prev.likesCount - 1) : prev.likesCount + 1
      } : null);
    }

    try {
      if (previouslyLiked) {
        await unlikeNewsApi(id);
      } else {
        await likeNewsApi(id);
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
      // Revert state
      setNews(prev => prev.map(n => {
        if (n.id === id) {
          return {
            ...n,
            hasLiked: previouslyLiked,
            likesCount: previouslyLiked ? n.likesCount + 1 : Math.max(0, n.likesCount - 1)
          };
        }
        return n;
      }));
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle(prev => prev ? {
          ...prev,
          hasLiked: previouslyLiked,
          likesCount: previouslyLiked ? prev.likesCount + 1 : Math.max(0, prev.likesCount - 1)
        } : null);
      }
    }
  };

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/news"
      });
    } catch (err) {
      console.error("Authentication redirect error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col paper-grain">
      <Navbar />

      {/* Retro Newspaper Masthead */}
      <header className="py-8 md:py-12 border-b-4 border-double border-current px-4 bg-transparent text-inherit">
        <div className="mx-auto max-w-7xl flex flex-col items-center text-center space-y-4">
          
          {/* Header metadata row */}
          <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest border-b border-current pb-2 max-w-6xl">
            <span>Vol. XCVII // No. 3409</span>
            <span className="hidden sm:inline-block">Global Intelligence Wire</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}
            </span>
          </div>

             {/* Gothic Masthead Title */}
             <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-inherit select-none uppercase font-blackletter border-b border-current pb-4 w-full max-w-6xl whitespace-nowrap">
               Newsroom
             </h1>
             
             <div className="text-center font-serif italic text-sm md:text-base border-t border-b border-current py-1 max-w-2xl px-6 font-newspaper">
               "AI-Enriched Engineering Dispatches & Acquisitions Every 60 Minutes"
             </div>

          {!activeUser && !loadingNews && (
            <div className="pt-4 animate-bounce">
              <Button 
                onClick={triggerGoogleLogin}
                className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-6 py-5.5 text-xs font-bold rounded-none vintage-shadow flex items-center gap-2 border-2 border-[#111111]"
              >
                Sign In with Google Identity
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {activeUser && (
          <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto sm:mx-0">
            {/* Search Input */}
            <div className="flex-1 flex items-center gap-2 bg-[#fcfaf2] dark:bg-[#1f1e1b] border-2 border-[#111111] dark:border-[#e6dfd8] px-3 py-3 font-mono text-xs shadow-[2px_2px_0px_#111111] dark:shadow-[2px_2px_0px_#e6dfd8] focus-within:shadow-none transition-all">
              <span className="text-[#cc785c] font-bold uppercase shrink-0">// SEARCH:</span>
              <input 
                type="text" 
                placeholder="Search dispatches (title, content, sourceUrl)..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-transparent outline-none border-none p-0 text-inherit text-xs font-mono"
              />
            </div>
            {/* Custom Priority Dropdown Selector */}
            <div className="relative shrink-0 font-mono text-xs z-20">
              <button 
                type="button"
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className="w-full sm:w-auto flex items-center justify-between gap-3 bg-[#fcfaf2] dark:bg-[#1f1e1b] border-2 border-[#111111] dark:border-[#e6dfd8] px-3 py-3 shadow-[2px_2px_0px_#111111] dark:shadow-[2px_2px_0px_#e6dfd8] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-current/5 transition-all cursor-pointer select-none font-bold"
              >
                <span className="text-[#cc785c] font-black uppercase tracking-wider">// PRIORITY:</span>
                <span className="opacity-90">{priorityFilter ? priorityFilter.toUpperCase() : "ALL DISPATCHES"}</span>
                <svg className={`h-3 w-3 fill-none stroke-current transition-transform duration-200 ${isPriorityOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isPriorityOpen && (
                <>
                  {/* Click outside overlay backdrop */}
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsPriorityOpen(false)} />
                  
                  {/* Custom List dropdown */}
                  <ul className="absolute top-[calc(100%+6px)] right-0 left-0 sm:left-auto sm:w-48 bg-[#fcfaf2] dark:bg-[#181715] border-2 border-[#111111] dark:border-[#e6dfd8] shadow-[4px_4px_0px_#111111] dark:shadow-[4px_4px_0px_#e6dfd8] z-50 rounded-none overflow-hidden select-none animate-in fade-in slide-in-from-top-1 duration-150">
                    {[
                      { value: "", label: "ALL DISPATCHES" },
                      { value: "low", label: "LOW" },
                      { value: "medium", label: "MEDIUM" },
                      { value: "high", label: "HIGH" },
                      { value: "critical", label: "CRITICAL" }
                    ].map((opt) => (
                      <li key={opt.value}>
                        <button
                          type="button"
                          onClick={() => {
                            setPriorityFilter(opt.value);
                            setIsPriorityOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-[#cc785c]/10 dark:hover:bg-[#cc785c]/20 hover:text-[#cc785c] transition-colors cursor-pointer font-bold ${
                            priorityFilter === opt.value 
                              ? "bg-[#cc785c]/15 text-[#cc785c] border-l-4 border-[#cc785c]" 
                              : "border-l-4 border-transparent text-inherit"
                          }`}
                        >
                          {opt.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {loadingNews ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs font-mono">Fetching latest broadsheet broadcasts...</p>
          </div>
        ) : !activeUser ? (
          <div className="text-center py-20 border-2 border-dashed border-[#e6dfd8] rounded-none bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-5 p-8 vintage-shadow">
            <AlertCircle className="h-10 w-10 text-[#cc785c]" />
            <div>
              <h3 className="font-serif text-xl font-bold uppercase font-newspaper">Identity Authentication Required</h3>
              <p className="text-xs opacity-75 mt-1.5 leading-relaxed max-w-md">
                This broadcast archive stores classified developer analytics. Secure Google sign-in is required to sync intelligence indexes.
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
            <p className="text-sm font-serif italic">
              {searchQuery || priorityFilter
                ? "No wire dispatches match your search query or priority filters."
                : "No announcements have been compiled for this wire cycle yet."}
            </p>
            {(searchQuery || priorityFilter) && (
              <Button 
                onClick={() => {
                  setSearchQuery("");
                  setPriorityFilter("");
                }}
                className="mt-4 bg-[#111111] hover:bg-[#222222] text-white border-2 border-[#111111] text-xs font-bold rounded-none px-6 vintage-shadow-sm cursor-pointer"
              >
                Clear Search Filters
              </Button>
            )}
          </div>
        ) : (
          <>
          <div className={
            settings.doubleColumn 
              ? "columns-1 md:columns-2 gap-8 space-y-8" 
              : "grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          }>
            {news.map((item) => (
              <article 
                key={item.id} 
                className={`bg-[#fcfaf2] dark:bg-[#252320] border-2 border-[#111111] dark:border-[#e6dfd8] p-6 flex flex-col justify-between transition-all hover:bg-[#fcfaf2]/60 dark:hover:bg-[#252320]/60 hover:-translate-y-0.5 vintage-shadow ${
                  settings.doubleColumn ? "inline-block w-full mb-8" : ""
                }`}
              >
                <div>
                  {/* Category & Date */}
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
                    <span className="opacity-75">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 
                    onClick={() => handleSelectArticle(item)}
                    className="font-serif text-xl sm:text-2xl font-black tracking-tight hover:text-[#cc785c] cursor-pointer transition-colors leading-tight font-newspaper"
                  >
                    {item.title}
                  </h3>

                  {/* Snippet */}
                  <p className="mt-4 text-xs md:text-sm leading-relaxed opacity-85 line-clamp-4">
                    {item.content}
                  </p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-5 pt-3 border-t border-dashed border-[#e6dfd8]">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono opacity-65">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-4 border-t border-[#111111]/15 dark:border-[#e6dfd8]/15 flex items-center justify-between">
                  <button 
                    onClick={() => handleSelectArticle(item)}
                    className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:text-[#cc785c]"
                  >
                    Read dispatch
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleLikeToggle(item.id)} 
                      className="flex items-center gap-1 text-xs hover:text-[#c64545] transition-colors p-1"
                      title={item.hasLiked ? "Unlike Dispatch" : "Like Dispatch"}
                    >
                      <Heart className={`h-4.5 w-4.5 transition-transform active:scale-125 ${item.hasLiked ? "fill-[#c64545] text-[#c64545]" : ""}`} />
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
          
          {nextCursor && (
            <div className="flex justify-center mt-12 pb-4">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-[#fcfaf2] dark:bg-[#252320] text-inherit border-2 border-[#111111] dark:border-[#e6dfd8] font-mono text-xs font-bold px-8 py-5 rounded-none vintage-shadow-sm hover:bg-[#efe9de] dark:hover:bg-[#181715] hover:scale-[0.98] transition-all cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    DECODING WIRE DISPATCHES...
                  </>
                ) : (
                  "FETCH MORE DISPATCHES"
                )}
              </Button>
            </div>
          )}
          </>
        )}
      </main>

      {/* Article Detail Dialog Overlay - Blog-Inspired Redesign */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && handleCloseArticle()}>
          <DialogContent className={`max-w-4xl w-[95vw] md:w-[85vw] lg:max-w-5xl border-4 rounded-none vintage-shadow-lg p-0 overflow-y-auto max-h-[90vh] ${getModalThemeClasses()}`}>
            
            {/* Unified sheet container */}
            <div className="p-6 md:p-10 space-y-8 max-w-3xl mx-auto">
              
              {/* Header Info */}
              <div className="space-y-4 border-b border-[#e6dfd8] pb-6">
                
                {/* Meta details */}
                <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#cc785c] flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    DISPATCH CYCLE: {new Date(selectedArticle.createdAt).toLocaleString(undefined, {
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

              {/* Share Briefing component */}
              <div className="border-b border-[#e6dfd8] pb-4">
                <ShareBriefing
                  url={typeof window !== "undefined" ? `${window.location.origin}/news?article=${selectedArticle.id}` : ""}
                  title={selectedArticle.title}
                />
              </div>

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
                  title={selectedArticle.hasLiked ? "Unlike Dispatch" : "Like Dispatch"}
                >
                  <Heart className={`h-5 w-5 transition-transform active:scale-125 ${selectedArticle.hasLiked ? "fill-[#c64545] text-[#c64545]" : ""}`} />
                  <span>{selectedArticle.likesCount} Recommendations</span>
                </button>

                <Button 
                  onClick={handleCloseArticle}
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
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          </div>

          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>

          <p className="opacity-50">
            © {new Date().getFullYear()} Curation Newsroom. Classified dispatches.
          </p>
        </div>
      </footer>
    </div>
  );
}
