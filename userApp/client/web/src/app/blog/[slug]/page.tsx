"use client";

import React, { useState, useEffect, use } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchBlogBySlug, type BlogItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ShareBriefing from "@/components/ShareBriefing";
import { 
  Clock, 
  ArrowLeft,
  Loader2,
  BookOpen,
  ChevronRight,
  Menu,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { marked } from "marked";
import { configureMermaidMarked, useMermaid } from "@/lib/mermaid";
import Navbar from "@/components/Navbar";
import { useSettings } from "@/components/SettingsProvider";
import { useRouter } from "next/navigation";

configureMermaidMarked();

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function parseToc(markdown: string): TocItem[] {
  const cleanMarkdown = markdown.replace(/\r/g, "");
  const lines = cleanMarkdown.split("\n");
  const items: TocItem[] = [];
  
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/[*_`#]/g, ""); 
      const id = text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      items.push({ id, text, level });
    }
  }
  return items;
}

function injectHeaderIds(html: string): string {
  return html.replace(/<h([1-3])([^>]*?)>([\s\S]*?)<\/h[1-3]>/gi, (match, level, attrs, content) => {
    const cleanText = content.replace(/<[^>]+>/g, ""); 
    const slug = cleanText.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
    
    let headerClasses = "";
    if (level === "1") {
      headerClasses = "scroll-mt-24 font-serif font-black text-3xl sm:text-4xl tracking-tight text-inherit mt-12 mb-6 pb-3 border-b-2 border-double border-current/30 w-full uppercase font-newspaper";
    } else if (level === "2") {
      headerClasses = "scroll-mt-24 font-serif font-black italic text-2xl sm:text-3xl tracking-tight text-inherit mt-10 mb-4 pb-2 border-b border-current/15 w-full font-newspaper";
    } else {
      headerClasses = "scroll-mt-24 font-serif font-bold text-xl sm:text-2xl tracking-tight text-[#cc785c] mt-8 mb-3 w-full font-newspaper";
    }
    
    return `<h${level} id="${slug}" class="${headerClasses}">${content}</h${level}>`;
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
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

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [readProgress, setReadProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState("");

  const resolvedParams = use(params);
  const blogSlug = resolvedParams?.slug;

  // Process markdown to HTML & extract TOC
  useEffect(() => {
    if (blog?.content) {
      setToc(parseToc(blog.content));

      const parsed = marked.parse(blog.content);
      if (parsed instanceof Promise) {
        parsed.then((res) => setHtmlContent(injectHeaderIds(res))).catch(console.error);
      } else {
        setHtmlContent(injectHeaderIds(parsed));
      }

      if (typeof window !== "undefined") {
        setShareUrl(window.location.origin + `/blog/${blog.slug}`);
      }
    }
  }, [blog]);

  useMermaid([htmlContent]);

  // Load Blog Details
  useEffect(() => {
    if (!blogSlug) return;

    async function loadBlog() {
      try {
        setLoading(true);
        const res = await fetchBlogBySlug(blogSlug);
        if (res.status === "success" && res.data?.blog) {
          setBlog(res.data.blog);
        } else {
          setError(res.message || "Chronicle not found in archival logs.");
        }
      } catch (err) {
        console.error("Failed to load blog post:", err);
        setError("An archival error occurred while retrieving the chronicle.");
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [blogSlug]);

  // Scroll spy to find active header based on viewport scroll position
  useEffect(() => {
    if (!htmlContent || toc.length === 0) return;

    const handleScrollSpy = () => {
      const articleEl = document.querySelector(".markdown-content");
      if (!articleEl) return;

      const headingElements = Array.from(articleEl.querySelectorAll("h1, h2, h3")) as HTMLElement[];
      const headings = headingElements
        .map((el) => {
          if (!el.id) return null;
          return { id: el.id, top: el.getBoundingClientRect().top };
        })
        .filter(Boolean) as { id: string; top: number }[];

      if (headings.length === 0) return;

      const threshold = 140;
      const passedHeadings = headings.filter((h) => h.top <= threshold);
      
      if (passedHeadings.length > 0) {
        const active = passedHeadings[passedHeadings.length - 1];
        setActiveId(active.id);
      } else {
        setActiveId(headings[0].id);
      }
    };

    const timer = setTimeout(handleScrollSpy, 100);

    window.addEventListener("scroll", handleScrollSpy);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScrollSpy);
    };
  }, [htmlContent, toc]);

  // Track overall scroll progress of the article container
  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector("article");
      if (!article) return;
      const rect = article.getBoundingClientRect();
      const articleHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      const scrolled = -rect.top;
      const totalScrollable = articleHeight - windowHeight;
      
      if (totalScrollable <= 0) {
        setReadProgress(rect.bottom <= windowHeight ? 100 : 0);
        return;
      }
      
      const pct = Math.max(0, Math.min(100, (scrolled / totalScrollable) * 100));
      setReadProgress(Math.round(pct));
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [htmlContent]);

  // Number the headings based on hierarchy
  const getNumberedToc = () => {
    let h1Count = 0;
    let h2Count = 0;
    return toc.map((item) => {
      if (item.level === 1) {
        h1Count++;
        h2Count = 0;
        return {
          ...item,
          displayNum: `${String(h1Count).padStart(2, "0")}.`
        };
      } else if (item.level === 2) {
        h2Count++;
        return {
          ...item,
          displayNum: `${String(h1Count).padStart(2, "0")}.${h2Count}`
        };
      } else {
        return {
          ...item,
          displayNum: `•`
        };
      }
    });
  };

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + `/blog/${blogSlug}`
      });
    } catch (err) {
      console.error("Authentication redirect error:", err);
    }
  };

  const handleScrollTo = (id: string, index: number) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      return;
    }
    
    const articleEl = document.querySelector(".markdown-content");
    if (articleEl) {
      const headingElements = Array.from(articleEl.querySelectorAll("h1, h2, h3")) as HTMLElement[];
      if (headingElements[index]) {
        headingElements[index].scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveId(id);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col paper-grain selection:bg-[#cc785c]/20 selection:text-[#141413]">
      <Navbar />

      {/* Full-width scroll progress indicator on top, right below the sticky navbar */}
      <div className="fixed top-[64px] left-0 right-0 h-1 bg-[#e6dfd8]/45 dark:bg-[#252320]/80 z-30 border-b border-[#e6dfd8]/10 pointer-events-none">
        <div 
          className="bg-[#cc785c] h-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(204,120,92,0.6)]" 
          style={{ width: `${readProgress}%` }}
        />
      </div>

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#cc785c] hover:-translate-x-1 transition-all mb-8 group">
          <ArrowLeft className="h-4 w-4" />
          Back to bulletins
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs font-mono">Decoding archival chronicle dispatches...</p>
          </div>
        ) : !activeUser ? (
          <div className="text-center py-20 border-2 border-dashed border-[#e6dfd8] rounded-none bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4 p-8 vintage-shadow">
            <p className="text-sm font-serif italic">Access restricted. Authentication is required to read this strategical briefing.</p>
            <Button 
              onClick={triggerGoogleLogin}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold px-6 py-2 h-9 rounded-none vintage-shadow transition-colors"
            >
              Sign In with Google Identity
            </Button>
          </div>
        ) : error || !blog ? (
          <div className="text-center py-16 border-2 border-[#111111] bg-[#efe9de]/10 max-w-2xl mx-auto p-8">
            <p className="text-sm font-serif italic text-[#c64545]">{error || "Requested chronicle was not discovered in the archives."}</p>
            <Link href="/blog" className="mt-4 inline-block">
              <Button className="bg-[#111111] hover:bg-[#222222] text-white border-2 border-[#111111] text-xs font-bold rounded-none vintage-shadow">
                Back to bulletins
              </Button>
            </Link>
          </div>
        ) : (
          /* Grid container layout for Sidebar TOC + Article */
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            
            {/* Sidebar TOC - sticky, dynamically updates on scroll */}
            <aside className="lg:col-span-3 sticky top-24 hidden lg:block border-r border-[#e6dfd8]/30 dark:border-current/10 pr-6 space-y-6">
              
              <div className="space-y-3 border-b-2 border-double border-current pb-4">
                <span className="font-bold text-[10px] uppercase font-mono tracking-widest text-[#cc785c] flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  Chronicle Outline
                </span>
                
                {/* Progress bar on top of outline */}
                <div className="space-y-1.5 font-mono text-[10px] pt-1">
                  <div className="flex justify-between items-center">
                    <span className="opacity-60 text-[9px] uppercase tracking-wider">READ PROGRESS</span>
                    <span className="font-bold text-[#cc785c]">{readProgress}%</span>
                  </div>
                  {/* Progress bar line */}
                  <div className="w-full bg-current/10 h-1.5 border border-current/25 relative">
                    <div 
                      className="bg-[#cc785c] h-full transition-all duration-150" 
                      style={{ width: `${readProgress}%` }}
                    />
                  </div>
                  <div className="text-[8px] opacity-40 text-center font-mono leading-none tracking-tighter pt-0.5">
                    {`[${"█".repeat(Math.max(0, Math.min(10, Math.round(readProgress / 10))))}${"░".repeat(Math.max(0, Math.min(10, 10 - Math.round(readProgress / 10))))}]`}
                  </div>
                </div>
              </div>

              {toc.length > 0 ? (
                <div className="relative pl-5 ml-1 py-1">
                  {/* Vertical Progress Line Track */}
                  <div className="absolute left-[5px] top-0 bottom-0 w-[1.5px] bg-current/10" />
                  {/* Active filled line based on progress */}
                  <div 
                    className="absolute left-[5px] top-0 w-[1.5px] bg-[#cc785c] transition-all duration-200" 
                    style={{ height: `${readProgress}%` }}
                  />

                  <nav className="flex flex-col space-y-3 leading-relaxed">
                    {getNumberedToc().map((item, index) => {
                      const isActive = activeId === item.id;
                      return (
                        <button
                          key={index}
                          onClick={() => handleScrollTo(item.id, index)}
                          className={`text-left relative transition-all duration-200 block w-full cursor-pointer group/item ${
                            item.level === 1 
                              ? "font-serif text-[15px] font-black uppercase tracking-tight mt-4 first:mt-0 pb-1 border-b border-current/10" 
                              : item.level === 2 
                                ? "font-mono text-[12.5px] pl-3.5 py-1" 
                                : "font-mono text-[11px] pl-6 py-0.5"
                          } ${
                            isActive 
                              ? "text-[#cc785c] bg-[#cc785c]/8 dark:bg-[#cc785c]/15 border-l-2 border-[#cc785c] pl-2 -ml-2 font-bold" 
                              : "text-inherit hover:bg-current/5 pl-2 -ml-2 border-l-2 border-transparent"
                          }`}
                        >
                          <span className="flex items-start gap-1 w-full">
                            {item.level !== 3 && (
                              <span className="font-mono text-[#cc785c]/80 select-none mr-1">{item.displayNum}</span>
                            )}
                            <span className="line-clamp-2 transition-transform duration-150 group-hover/item:translate-x-0.5">{item.text}</span>
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              ) : (
                <span className="font-mono text-[10px] opacity-50 block">No structural headings parsed.</span>
              )}

            </aside>

            {/* Main Article column */}
            <article className="lg:col-span-9 bg-[#fcfaf2] dark:bg-[#252320] border-2 border-[#111111] dark:border-[#e6dfd8] p-6 md:p-10 vintage-shadow-lg">
              
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Header Info */}
                <div className="space-y-4 border-b border-[#e6dfd8] pb-6">
                  
                  {/* Meta details */}
                  <div className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-[#cc785c] flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Published {new Date(blog.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    
                    <span className="opacity-60 hidden md:inline">
                      // ARCHIVE ID: DEV-BLOG-{blog.id.substring(0,6).toUpperCase()}
                    </span>
                  </div>

                  {/* Title */}
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-inherit uppercase font-newspaper">
                    {blog.title}
                  </h1>

                  {/* Share buttons */}
                  {shareUrl && (
                    <ShareBriefing url={shareUrl} title={blog.title} className="pt-2 border-t border-[#e6dfd8]/30 dark:border-current/10" />
                  )}
                </div>

                {/* Mobile Table of Contents Dropdown (visible only on mobile) */}
                {toc.length > 0 && (
                  <div className="lg:hidden bg-[#efe9de]/30 dark:bg-[#181715]/40 border-2 border-double border-current p-4 space-y-3 vintage-shadow mb-6">
                    <details className="group">
                      <summary className="font-mono text-xs uppercase font-bold flex items-center justify-between cursor-pointer list-none select-none">
                        <span className="flex flex-col gap-0.5">
                          <span className="flex items-center gap-2 text-[#cc785c]">
                            <Menu className="h-4 w-4 animate-pulse" />
                            Outline Index ({toc.length} sections)
                          </span>
                          <span className="text-[9px] opacity-60 font-mono tracking-normal normal-case">
                            Active: {activeId ? activeId.replace(/-/g, " ").toUpperCase() : "INTRODUCTION"}
                          </span>
                        </span>
                        <ChevronRight className="h-4 w-4 transform group-open:rotate-90 transition-transform text-[#cc785c]" />
                      </summary>
                      
                      <div className="relative pl-5 mt-4 pt-3 border-t border-dashed border-current/25">
                        {/* Progress track in mobile */}
                        <div className="absolute left-[5px] top-0 bottom-0 w-[1.5px] bg-current/10" />
                        <div 
                          className="absolute left-[5px] top-0 w-[1.5px] bg-[#cc785c] transition-all duration-200" 
                          style={{ height: `${readProgress}%` }}
                        />
                        
                        <nav className="flex flex-col space-y-2.5">
                          {getNumberedToc().map((item, index) => {
                            const isActive = activeId === item.id;
                            return (
                              <button
                                key={index}
                                onClick={() => handleScrollTo(item.id, index)}
                                className={`text-left relative transition-all duration-150 block w-full cursor-pointer py-1.5 ${
                                  item.level === 1 
                                    ? "font-serif text-[14px] font-black uppercase mt-2 pb-0.5 border-b border-current/10" 
                                    : item.level === 2 
                                      ? "font-mono text-[12px] pl-3.5" 
                                      : "font-mono text-[11px] pl-6"
                                } ${
                                  isActive 
                                    ? "text-[#cc785c] bg-[#cc785c]/8 dark:bg-[#cc785c]/15 border-l-2 border-[#cc785c] pl-2 -ml-2 font-bold" 
                                    : "text-inherit hover:bg-current/5 pl-2 -ml-2 border-l-2 border-transparent"
                                }`}
                              >
                                {/* Mobile active indicator bullets */}
                                <div className={`absolute left-[-17px] flex items-center justify-center ${
                                  item.level === 1 ? "top-[9px]" : "top-[7px]"
                                }`}>
                                  {isActive && (
                                    <span 
                                      className="h-1.5 w-1.5 bg-[#cc785c] border border-current"
                                      style={{ transform: "rotate(45deg)" }}
                                    />
                                  )}
                                </div>
                                <span className="flex items-start gap-1 w-full">
                                  {item.level !== 3 && (
                                    <span className="font-mono text-[#cc785c]/85 select-none mr-1">{item.displayNum}</span>
                                  )}
                                  <span className="line-clamp-1">{item.text}</span>
                                </span>
                              </button>
                            );
                          })}
                        </nav>
                      </div>
                    </details>
                  </div>
                )}

                {/* Dynamic HTML Content parsed by marked - Visually optimized for long-form reading */}
                <div 
                  className="markdown-content text-inherit text-base md:text-[18px] lg:text-[20px] leading-relaxed md:leading-[1.75] font-serif prose dark:prose-invert py-4 selection:bg-[#cc785c]/35 newspaper-body"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Bottom Actions */}
                <div className="border-t border-[#e6dfd8] pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-xs font-mono">
                  <div className="flex flex-col gap-2">
                    <span className="opacity-60">// END BULLET DISPATCH</span>
                    {shareUrl && (
                      <ShareBriefing url={shareUrl} title={blog.title} />
                    )}
                  </div>
                  <Link href="/blog" className="text-[#cc785c] font-bold hover:underline flex items-center gap-1">
                    Return to all dispatches
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

            </article>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 border-t-4 border-[#111111] mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono">
          <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>
          <p className="opacity-50">© {new Date().getFullYear()} Curation Newsroom. Classified dispatches.</p>
        </div>
      </footer>
    </div>
  );
}
