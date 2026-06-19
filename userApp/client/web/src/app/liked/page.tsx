"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchLikedNewsList, likeNewsApi, unlikeNewsApi, type NewsItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";
import { 
  Clock, 
  ChevronRight, 
  ArrowRight,
  LogOut,
  ExternalLink,
  Loader2,
  Heart
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function LikedNewsPage() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;

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

  const handleLogout = async () => {
    await signOut();
    refetch();
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
    <div className="min-h-screen flex flex-col bg-[#faf9f5] font-sans selection:bg-[#cc785c]/20 selection:text-[#141413]">
      
      <Navbar />

      {/* Hero Header */}
      <section className="relative bg-[#faf9f5] border-b border-[#e6dfd8] py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#c64545]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#c64545]">
            <Heart className="h-3.5 w-3.5 fill-current" />
            Your Liked Engineering Broadcasts
          </div>

          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#141413] leading-tight">
            Saved Engineering Broadcasts
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#6c6a64] leading-relaxed max-w-xl">
            A personalized repository of AI-enriched articles and major announcements you marked as helpful.
          </p>
        </div>
      </section>

      {/* Main List */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16">
        {isPending || (activeUser && loading) ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs text-[#6c6a64] font-mono">Fetching your saved broadcasts...</p>
          </div>
        ) : !activeUser ? (
          <div className="text-center py-20 border border-dashed border-[#e6dfd8] rounded-xl bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4">
            <p className="text-sm text-[#6c6a64]">Please sign in to access your liked engineering broadcasts.</p>
            <Button 
              onClick={triggerGoogleLogin}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-0 text-xs font-semibold px-6 py-2 h-9 rounded-md transition-colors"
            >
              Sign In with Google
            </Button>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#e6dfd8] rounded-xl bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4">
            <p className="text-sm text-[#6c6a64]">You haven't liked any announcements yet.</p>
            <Link href="/">
              <Button className="bg-[#141413] hover:bg-[#252523] text-white border-0 text-xs px-6">
                Explore Broadcasts
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <Card key={item.id} className="border border-[#e6dfd8] bg-[#faf9f5] flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                <div>
                  <CardHeader className="p-6 pb-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`border-0 text-[10px] font-semibold py-0.5 px-2 tracking-wide uppercase ${
                        item.priority === "critical"
                          ? "bg-[#c64545]/10 text-[#c64545]"
                          : item.priority === "high"
                          ? "bg-[#cc785c]/10 text-[#cc785c]"
                          : item.priority === "medium"
                          ? "bg-[#d4a017]/10 text-[#d4a017]"
                          : "bg-[#5db872]/10 text-[#5db872]"
                      }`}>
                        {item.priority}
                      </Badge>
                      <span className="text-[10px] text-[#8e8b82] font-mono">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    <CardTitle className="font-serif text-lg font-normal leading-tight text-[#141413] hover:text-[#cc785c] cursor-pointer transition-colors pt-1 line-clamp-2" onClick={() => setSelectedArticle(item)}>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-4">
                    <p className="text-xs text-[#3d3d3a] leading-relaxed line-clamp-3">
                      {item.content}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[9px] px-2 py-0 border-[#e6dfd8] font-mono text-[#6c6a64] bg-[#f5f0e8]/30">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
                <CardFooter className="px-6 py-4 border-t border-[#e6dfd8] bg-[#f5f0e8]/20 flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-xs text-[#cc785c] hover:text-[#a9583e] hover:bg-transparent p-0 flex items-center gap-1" onClick={() => setSelectedArticle(item)}>
                    Read Full Article
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleLikeToggle(item.id)} 
                      className="flex items-center gap-1 text-xs text-[#8e8b82] hover:text-[#c64545] transition-colors p-1"
                      title="Unlike Article"
                    >
                      <Heart className="h-4 w-4 fill-[#c64545] text-[#c64545] transition-transform active:scale-125" />
                      <span>{item.likesCount}</span>
                    </button>

                    {item.sourceUrl && (
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" title="View Source Link" className="text-[#8e8b82] hover:text-[#141413] transition-colors p-1">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Article Detail Dialog Overlay */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
          <DialogContent className="max-w-2xl bg-[#faf9f5] border-[#e6dfd8] text-[#141413]">
            <DialogHeader className="border-b border-[#e6dfd8] pb-4">
              <div className="flex items-center gap-3 text-[10px] text-[#6c6a64] font-medium mb-1.5">
                <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[#cc785c]">
                  <Clock className="h-3 w-3" />
                  {new Date(selectedArticle.createdAt).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
                <Badge className={`border-0 text-[10px] font-semibold py-0.5 px-2 tracking-wide uppercase ${
                  selectedArticle.priority === "critical"
                    ? "bg-[#c64545]/10 text-[#c64545]"
                    : selectedArticle.priority === "high"
                    ? "bg-[#cc785c]/10 text-[#cc785c]"
                    : selectedArticle.priority === "medium"
                    ? "bg-[#d4a017]/10 text-[#d4a017]"
                    : "bg-[#5db872]/10 text-[#5db872]"
                }`}>
                  {selectedArticle.priority}
                </Badge>
              </div>
              <DialogTitle className="font-serif text-2xl font-normal leading-tight text-[#141413]">
                {selectedArticle.title}
              </DialogTitle>
              {selectedArticle.sourceUrl && (
                <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-[#8e8b82]">
                  <span>Source:</span>
                  <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[#cc785c] hover:underline flex items-center gap-1">
                    {selectedArticle.sourceUrl}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </DialogHeader>

            <div className="py-4 space-y-5 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-[#141413] uppercase tracking-wider">Content</h4>
                <div className="text-xs text-[#3d3d3a] leading-relaxed whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
              </div>

              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#e6dfd8]/50">
                  <span className="text-xs text-[#6c6a64] font-medium mr-1.5">Tags:</span>
                  {selectedArticle.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0 border-[#e6dfd8] font-mono text-[#6c6a64]">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="border-t border-[#e6dfd8] pt-4 flex flex-row items-center justify-between gap-2">
              <button 
                onClick={() => handleLikeToggle(selectedArticle.id)}
                className="flex items-center gap-1.5 text-xs text-[#8e8b82] hover:text-[#c64545] transition-colors p-1"
                title="Unlike Article"
              >
                <Heart className="h-4.5 w-4.5 fill-[#c64545] text-[#c64545] transition-transform active:scale-125" />
                <span className="font-semibold">{selectedArticle.likesCount} {selectedArticle.likesCount === 1 ? "Like" : "Likes"}</span>
              </button>

              <Button 
                onClick={() => setSelectedArticle(null)}
                className="bg-[#141413] hover:bg-[#252523] text-white border-0 text-xs h-9"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Clean Premium Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 border-t border-[#252320]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#faf9f5] text-[#181715]">
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-serif text-lg font-medium tracking-tight text-[#faf9f5]">DevBits</span>
          </div>

          <div className="flex gap-6 text-xs text-[#a09d96]/80 font-medium">
            <Link href="/privacy" className="hover:text-[#faf9f5] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#faf9f5] transition-colors">Terms of Service</Link>
          </div>

          <p className="text-[11px] text-[#a09d96]/50">
            © {new Date().getFullYear()} DevBits Curation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
