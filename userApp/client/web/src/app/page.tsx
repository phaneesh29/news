"use client";

import React, { useState } from "react";
import authClient, { useSession, signIn, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import Link from "next/link";
import { 
  Clock, 
  Bookmark, 
  ChevronRight, 
  TrendingUp, 
  Sparkles, 
  Check, 
  Lightbulb,
  ArrowRight,
  LogOut
} from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  category: "AI & Models" | "Industry & Acquisitions" | "Open Source" | "Frameworks & Tools";
  source: string;
  timeAgo: string;
  readTime: string;
  summary: string;
  impactScore: number;
  aiEnrichment: {
    tldr: string;
    developerTakeaway: string;
    techStackAffected: string[];
    migrationRisk: "None" | "Low" | "Medium" | "High";
  };
}

const INITIAL_NEWS: NewsItem[] = [
  {
    id: "news-1",
    title: "Next.js 16.3 Stable Release: React Compiler Enabled by Default",
    category: "Frameworks & Tools",
    source: "NextJS Blog",
    timeAgo: "12m ago",
    readTime: "3 min read",
    summary: "Vercel has announced the general availability of Next.js 16.3, turning on the automatic React Compiler for all new projects. This release removes the need for manual useMemo and useCallback hook declarations across the framework.",
    impactScore: 89,
    aiEnrichment: {
      tldr: "Next.js 16.3 implements automatic memorization by default. Developers no longer need to write boilerplate hooks to optimize rendering loops, resulting in up to 15% smaller client bundle footprints.",
      developerTakeaway: "Gradually remove manual useMemo/useCallback references. Ensure your lint configurations are updated to not warn about missing dependency arrays in compiled files.",
      techStackAffected: ["React 19", "Next.js", "TypeScript"],
      migrationRisk: "Low"
    }
  },
  {
    id: "news-2",
    title: "Anthropic Acquires Terminal Helper Tool 'ShellMate' for $45M",
    category: "Industry & Acquisitions",
    source: "TechCrunch",
    timeAgo: "28m ago",
    readTime: "4 min read",
    summary: "Anthropic has acquired ShellMate, a popular open-source terminal automation assistant, in an all-cash deal valued at $45M. The team will join the Anthropic tooling department to strengthen Claude Code's terminal capability.",
    impactScore: 94,
    aiEnrichment: {
      tldr: "This acquisition confirms Anthropic's focus on CLI and developer shell integrations. ShellMate's contextual terminal heuristics will be directly baked into future versions of Claude Code.",
      developerTakeaway: "Expect more robust file system and repository git actions directly from your terminal prompts in Claude Code's next release.",
      techStackAffected: ["Claude Code", "Git", "Shell Scripts"],
      migrationRisk: "None"
    }
  },
  {
    id: "news-3",
    title: "Gemma 3 Open-Weights Released: Specialized Coding Variants Excel on Multi-File Context",
    category: "AI & Models",
    source: "Google DeepMind",
    timeAgo: "41m ago",
    readTime: "5 min read",
    summary: "Google DeepMind has published weights for Gemma 3, a next-generation open-weights language model. The model features a specialized 128k context coding variant that outperforms Llama-3-Coder on complex multi-file codebase operations.",
    impactScore: 92,
    aiEnrichment: {
      tldr: "Gemma 3 Coding variant comes in 9B and 27B sizes. Features custom attention heads optimized for tracking cross-file inheritance, interfaces, and workspace directory structures.",
      developerTakeaway: "Excellent choice for self-hosted developer assistants. Can be run locally using Ollama on standard hardware with high output speeds.",
      techStackAffected: ["Ollama", "Python", "Local LLMs"],
      migrationRisk: "None"
    }
  }
];

export default function DevBitsNews() {
  // Authentic Better Auth States
  const { data: sessionData, isPending, refetch } = useSession();
  
  const activeUser = sessionData?.user;

  React.useEffect(() => {
    console.log("Google Client ID configured as:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    if (!activeUser && !isPending) {
      authClient.oneTap().catch((err) => {
        console.warn("Google One Tap automatic prompt failed to initialize:", err);
      });
    }
  }, [activeUser, isPending]);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsItem | null>(null);

  const toggleBookmark = (id: string) => {
    if (!activeUser) return;
    if (bookmarks.includes(id)) {
      setBookmarks(bookmarks.filter(b => b !== id));
    } else {
      setBookmarks([...bookmarks, id]);
    }
  };

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin
      });
    } catch (err) {
      console.error("Authentication redirect error:", err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    refetch();
    setBookmarks([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] font-sans selection:bg-[#cc785c]/20 selection:text-[#141413]">
      
      {/* Navigation Header */}
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

            {activeUser && (
              <Link href="/profile" className="hidden sm:inline-block text-xs font-semibold text-[#6c6a64] hover:text-[#141413] transition-colors border-l border-[#e6dfd8] pl-4">
                Profile
              </Link>
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

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center items-center py-20 sm:py-32 bg-[#faf9f5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#cc785c]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#cc785c]">
            <Clock className="h-3.5 w-3.5" />
            Hourly Intelligence Cycle
          </div>

          <h1 className="mt-6 font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-[#141413] leading-[1.08] max-w-3xl">
            AI-Enriched News for Developers.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#3d3d3a] leading-relaxed max-w-2xl font-normal">
            DevBits crawls engineering updates, open-weights releases, and technology acquisitions every 60 minutes. We index and parse releases to extract structured technical takeaways and migration risk metrics.
          </p>

          <div className="mt-8 flex justify-center gap-3">
            {activeUser ? (
              <div className="bg-[#efe9de] px-4.5 py-2.5 rounded-lg border border-[#e6dfd8] text-xs text-[#3d3d3a] font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-[#cc785c]" />
                Authenticated Profile Securely Linked
              </div>
            ) : (
              <Button 
                onClick={triggerGoogleLogin}
                className="bg-[#cc785c] hover:bg-[#a9583e] text-white px-6 py-5.5 text-sm font-medium rounded-md flex items-center gap-1.5 shadow-sm transition-colors border-0"
              >
                Sign In with Google
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Authenticated Bookmarks Container */}
      {activeUser && bookmarks.length > 0 && (
        <section className="py-12 bg-[#efe9de] border-t border-[#e6dfd8]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <Card className="border border-[#e6dfd8] bg-[#faf9f5]">
              <CardHeader className="bg-[#f5f0e8]/50 border-b border-[#e6dfd8] p-6">
                <CardTitle className="font-serif text-xl font-normal text-[#141413] flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-[#cc785c] fill-current" />
                  Your Bookmarked Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {bookmarks.map(id => {
                    const article = INITIAL_NEWS.find(n => n.id === id);
                    if (!article) return null;
                    
                    return (
                      <div key={id} className="flex items-center justify-between p-3.5 border border-[#e6dfd8] rounded-lg bg-[#efe9de]/30">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-[#cc785c]/10 text-[#cc785c] border-0 text-[10px] font-mono shrink-0">
                            {article.category}
                          </Badge>
                          <span 
                            className="text-xs font-semibold text-[#141413] hover:text-[#cc785c] cursor-pointer truncate max-w-[200px] sm:max-w-md"
                            onClick={() => setSelectedArticle(article)}
                          >
                            {article.title}
                          </span>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => toggleBookmark(id)}
                          className="border-[#c64545]/20 text-[#c64545] hover:bg-[#c64545]/10 text-[10px] h-6 px-2"
                        >
                          Remove
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Article Detail Dialog Overlay */}
      {selectedArticle && (
        <Dialog open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
          <DialogContent className="max-w-2xl bg-[#faf9f5] border-[#e6dfd8] text-[#141413]">
            <DialogHeader className="border-b border-[#e6dfd8] pb-4">
              <div className="flex items-center gap-3 text-[10px] text-[#6c6a64] font-medium mb-1.5">
                <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[#cc785c]">
                  <Clock className="h-3 w-3" />
                  {selectedArticle.timeAgo}
                </span>
                <span className="rounded bg-[#efe9de] px-2 py-0.5 text-xs font-semibold text-[#141413]">
                  {selectedArticle.category}
                </span>
              </div>
              <DialogTitle className="font-serif text-2xl font-normal leading-tight text-[#141413]">
                {selectedArticle.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 font-mono text-[10px] text-[#8e8b82]">
                <span>Source: {selectedArticle.source}</span>
                <span>•</span>
                <span>{selectedArticle.readTime}</span>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-5 text-sm">
              <div className="space-y-1.5">
                <h4 className="font-semibold text-xs text-[#141413] uppercase tracking-wider">Summary</h4>
                <p className="text-xs text-[#3d3d3a] leading-relaxed">{selectedArticle.summary}</p>
              </div>

              {/* Enriched AI Takeaway Container */}
              <div className="rounded-xl border border-[#e6dfd8] bg-[#efe9de] p-4.5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#e6dfd8]/80 pb-2">
                  <span className="font-serif text-sm font-semibold text-[#141413] flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#cc785c]" /> Curation Analysis
                  </span>
                  <Badge className="bg-[#cc785c]/10 text-[#cc785c] border-0 font-mono text-[10px]">
                    Impact: {selectedArticle.impactScore}%
                  </Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <h5 className="font-semibold text-[#141413] flex items-center gap-1">
                      <Check className="h-3.5 w-3.5 text-[#cc785c]" /> The TL;DR Breakdown:
                    </h5>
                    <p className="text-[#3d3d3a] leading-relaxed">{selectedArticle.aiEnrichment.tldr}</p>
                  </div>

                  <div className="space-y-1">
                    <h5 className="font-semibold text-[#141413] flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5 text-[#e8a55a]" /> Technical Takeaway:
                    </h5>
                    <p className="text-[#3d3d3a] leading-relaxed">{selectedArticle.aiEnrichment.developerTakeaway}</p>
                  </div>
                </div>

                <div className="border-t border-[#e6dfd8]/80 pt-3 flex flex-wrap gap-4 items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[#6c6a64]">Frameworks:</span>
                    {selectedArticle.aiEnrichment.techStackAffected.map((s: string) => (
                      <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 border-[#e6dfd8] font-mono">{s}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#6c6a64]">Migration Risk:</span>
                    <Badge className={`border-0 font-semibold text-[10px] ${
                      selectedArticle.aiEnrichment.migrationRisk === "High" 
                        ? "bg-[#c64545]/10 text-[#c64545]"
                        : selectedArticle.aiEnrichment.migrationRisk === "Medium"
                        ? "bg-[#d4a017]/10 text-[#d4a017]"
                        : "bg-[#5db872]/10 text-[#5db872]"
                    }`}>
                      {selectedArticle.aiEnrichment.migrationRisk}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-[#e6dfd8] pt-4 gap-2">
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
