"use client";

import React, { useState, useEffect, Suspense, use } from "react";
import { useSession, signIn } from "@/lib/auth-client";
import { fetchDocsList, searchDocsList, type DocItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Clock, 
  ArrowLeft,
  Loader2,
  BookOpen,
  ChevronRight,
  Menu,
  Sparkles,
  ArrowRight,
  Search,
  FileText,
  Bookmark,
  Folder,
  File
} from "lucide-react";
import { marked } from "marked";
import Navbar from "@/components/Navbar";
import ShareBriefing from "@/components/ShareBriefing";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocNode extends DocItem {
  children: DocNode[];
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
      headerClasses = "scroll-mt-24 font-serif font-black text-2xl sm:text-3xl tracking-tight text-inherit mt-8 mb-4 pb-2 border-b-2 border-double border-current/30 w-full uppercase font-newspaper";
    } else if (level === "2") {
      headerClasses = "scroll-mt-24 font-serif font-black italic text-xl sm:text-2xl tracking-tight text-inherit mt-6 mb-3 pb-1.5 border-b border-current/15 w-full font-newspaper";
    } else {
      headerClasses = "scroll-mt-24 font-serif font-bold text-lg sm:text-xl tracking-tight text-[#cc785c] mt-5 mb-2 w-full font-newspaper";
    }
    
    return `<h${level} id="${slug}" class="${headerClasses}">${content}</h${level}>`;
  });
}

function buildDocTree(items: DocItem[]): DocNode[] {
  const map = new Map<string, DocNode>();
  const roots: DocNode[] = [];

  items.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  items.forEach(item => {
    const node = map.get(item.id)!;
    if (item.parentId && map.has(item.parentId)) {
      map.get(item.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: DocNode[]) => {
    nodes.sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    nodes.forEach(node => sortNodes(node.children));
  };

  sortNodes(roots);
  return roots;
}

interface DocsContentProps {
  urlSlug: string | null;
}

function DocsContent({ urlSlug }: DocsContentProps) {
  const { data: sessionData, isPending } = useSession();
  const activeUser = sessionData?.user;
  const router = useRouter();

  const [allDocs, setAllDocs] = useState<DocItem[]>([]);
  const [docTree, setDocTree] = useState<DocNode[]>([]);
  const [searchResults, setSearchResults] = useState<DocItem[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [htmlContent, setHtmlContent] = useState("");
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState("");
  const [readProgress, setReadProgress] = useState(0);
  const [shareUrl, setShareUrl] = useState("");
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, [selectedDoc]);

  // Redirect if logged out
  useEffect(() => {
    if (!isPending && !activeUser) {
      router.push("/login");
    }
  }, [activeUser?.id, isPending, router]);

  // Fetch all documents
  useEffect(() => {
    if (!activeUser) return;

    async function loadDocs() {
      try {
        setLoading(true);
        const res = await fetchDocsList();
        if (res.status === "success" && res.data) {
          const fetchedDocs = res.data.docs;
          setAllDocs(fetchedDocs);
          const tree = buildDocTree(fetchedDocs);
          setDocTree(tree);

          let initialDoc: DocItem | null = null;

          if (urlSlug) {
            initialDoc = fetchedDocs.find(d => d.slug === urlSlug) || null;
          }

          if (!initialDoc && tree.length > 0) {
            initialDoc = tree[0];
            if (initialDoc) {
              router.replace(`/docs/${initialDoc.slug}`);
            }
          }

          if (initialDoc) {
            setSelectedDoc(initialDoc);
          }
        } else {
          setError(res.message || "Failed to retrieve documentation.");
        }
      } catch (err) {
        console.error("Failed to load documents:", err);
        setError("Error parsing the documentation repository.");
      } finally {
        setLoading(false);
      }
    }

    loadDocs();
  }, [activeUser?.id, urlSlug, router]);

  // Sync selected doc when URL slug changes
  useEffect(() => {
    if (allDocs.length > 0 && urlSlug) {
      const doc = allDocs.find(d => d.slug === urlSlug);
      if (doc) {
        setSelectedDoc(doc);
      }
    }
  }, [urlSlug, allDocs]);

  // Search query handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMode(false);
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchMode(true);

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await searchDocsList(searchQuery);
        if (res.status === "success" && res.data) {
          setSearchResults(res.data.docs);
        }
      } catch (err) {
        console.error("Search docs error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Process markdown of selected document
  useEffect(() => {
    if (selectedDoc?.content) {
      setToc(parseToc(selectedDoc.content));

      const parsed = marked.parse(selectedDoc.content);
      if (parsed instanceof Promise) {
        parsed.then((res) => setHtmlContent(injectHeaderIds(res))).catch(console.error);
      } else {
        setHtmlContent(injectHeaderIds(parsed));
      }
      
      setReadProgress(0);
      setActiveHeadingId("");
    } else {
      setHtmlContent("");
      setToc([]);
    }
  }, [selectedDoc]);

  // Scrollspy & Progress tracking
  useEffect(() => {
    if (!htmlContent || toc.length === 0) return;

    let rafId: number | null = null;

    const performScrollUpdate = () => {
      const article = document.querySelector(".markdown-content");
      if (!article) return;
      
      const rect = article.getBoundingClientRect();
      const articleHeight = rect.height;
      const windowHeight = window.innerHeight;
      
      const scrolled = -rect.top;
      const totalScrollable = articleHeight - windowHeight;
      
      if (totalScrollable <= 0) {
        setReadProgress(rect.bottom <= windowHeight ? 100 : 0);
      } else {
        const pct = Math.max(0, Math.min(100, (scrolled / totalScrollable) * 100));
        setReadProgress(Math.round(pct));
      }

      // Scroll Spy
      const headingElements = Array.from(article.querySelectorAll("h1, h2, h3"));
      
      const headings = headingElements
        .map((el) => {
          if (!el.id) return null;
          return { id: el.id, top: el.getBoundingClientRect().top };
        })
        .filter(Boolean) as { id: string; top: number }[];

      if (headings.length > 0) {
        const threshold = 140;
        const passedHeadings = headings.filter((h) => h.top <= threshold);
        if (passedHeadings.length > 0) {
          setActiveHeadingId(passedHeadings[passedHeadings.length - 1].id);
        } else {
          setActiveHeadingId(headings[0].id);
        }
      }
      rafId = null;
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = window.requestAnimationFrame(performScrollUpdate);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    performScrollUpdate();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [htmlContent, toc]);

  const handleSelectDoc = (doc: DocItem) => {
    router.push(`/docs/${doc.slug}`);
    setIsMobileMenuOpen(false);
  };

  const handleScrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveHeadingId(id);
    }
  };

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/docs"
      });
    } catch (err) {
      console.error("Auth redirect error:", err);
    }
  };

  // Render Sidebar Tree (recursive)
  const renderDocTree = (nodes: DocNode[], depth = 0) => {
    return nodes.map((node) => {
      const isSelected = selectedDoc?.id === node.id;
      const hasChildren = node.children.length > 0;
      return (
        <div key={node.id} className="flex flex-col">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleSelectDoc(node)}
                className={`text-left py-2 px-3 my-0.5 text-xs font-serif tracking-tight border-l-2 hover:bg-[#cc785c]/10 transition-colors cursor-pointer w-full flex items-center justify-between ${
                  isSelected
                    ? "border-[#cc785c] text-[#cc785c] font-black bg-[#cc785c]/15"
                    : "border-transparent text-current/80 hover:text-current font-semibold"
                }`}
                style={{ paddingLeft: `${Math.max(12, depth * 16 + 12)}px` }}
              >
                <span className="truncate flex items-center gap-2">
                  {hasChildren ? (
                    <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "opacity-100" : "opacity-60"}`} />
                  ) : (
                    <File className={`h-3 w-3 shrink-0 ${isSelected ? "opacity-100" : "opacity-50"}`} />
                  )}
                  {node.title}
                </span>
                {hasChildren && (
                  <span className="text-[9px] opacity-50 font-mono scale-90">
                    [{node.children.length}]
                  </span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-serif text-xs bg-[#1f1e1b] text-[#fcfaf2] border-[#cc785c]/30">
              {node.title}
            </TooltipContent>
          </Tooltip>
          {hasChildren && (
            <div className="flex flex-col ml-1">
              {renderDocTree(node.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen flex flex-col paper-grain selection:bg-[#cc785c]/20 selection:text-[#141413]">
      <Navbar />

      {/* Reading Progress Indicator */}
      <div className="fixed top-[64px] left-0 right-0 h-1 bg-[#e6dfd8]/45 dark:bg-[#252320]/80 z-30 border-b border-[#e6dfd8]/10 pointer-events-none">
        <div 
          className="bg-[#cc785c] h-full transition-all duration-100 ease-out shadow-[0_0_8px_rgba(204,120,92,0.6)]" 
          style={{ width: `${readProgress}%` }}
        />
      </div>

      {/* Editorial Documentation Header */}
      <header className="py-6 border-b-4 border-double border-current px-4 bg-transparent text-center select-none">
        <div className="mx-auto max-w-7xl flex flex-col items-center space-y-3">
          <div className="w-full flex justify-between items-center text-[9px] md:text-xs font-mono uppercase tracking-widest border-b border-current pb-1.5 max-w-7xl">
            <span>OPERATIVE INSTRUCTIONS</span>
            <span>SYSTEM DIRECTORY & DOCUMENTATION</span>
            <span>SECTION D // REFERENCE</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-black tracking-tight text-inherit uppercase font-blackletter border-b border-current pb-2 w-full max-w-7xl">
            Reference Board
          </h1>
          <div className="text-center font-serif italic text-xs md:text-sm border-t border-b border-current py-0.5 max-w-xl px-4 font-newspaper">
            "Official manuals, operational procedures and technical schematics."
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs font-mono">Loading technical archives database...</p>
          </div>
        ) : !activeUser ? (
          <div className="text-center py-20 border-2 border-dashed border-[#e6dfd8] rounded-none bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4 p-8 vintage-shadow">
            <p className="text-sm font-serif italic">Authentication required. Access to technical reference is restricted.</p>
            <Button 
              onClick={triggerGoogleLogin}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold px-6 py-2 h-9 rounded-none vintage-shadow transition-colors"
            >
              Sign In with Google
            </Button>
          </div>
        ) : error ? (
          <div className="text-center py-16 border-2 border-[#111111] bg-[#efe9de]/10 max-w-2xl mx-auto p-8">
            <p className="text-sm font-serif italic text-[#c64545]">{error}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start relative">
            
            {/* Side Navigation panel */}
            <aside className="lg:col-span-3 lg:sticky lg:top-24 flex flex-col gap-6 bg-[#fcfaf2] dark:bg-[#1f1e1b] border-2 border-current p-4 vintage-shadow-sm w-full">
              <div className="border-b-2 border-current pb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#cc785c] flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  Documentation Index
                </span>
              </div>

              {/* Sidebar search box */}
              <div className="flex items-center gap-1.5 bg-[#faf9f5] dark:bg-[#252320] border border-current/25 px-2.5 py-1.5 font-mono text-xs">
                <Search className="h-3.5 w-3.5 opacity-60 shrink-0" />
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full bg-transparent outline-none border-none p-0 text-inherit text-xs font-mono"
                />
                {isSearching && (
                  <Loader2 className="h-3 w-3 animate-spin text-[#cc785c] shrink-0" />
                )}
              </div>

              {/* Sidebar mobile menu toggle (only visible on small screens) */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="lg:hidden flex items-center justify-between border border-current/30 px-3 py-2 text-xs font-serif bg-[#faf9f5] dark:bg-[#252320] font-bold"
              >
                <span>{selectedDoc ? selectedDoc.title : "Select Document"}</span>
                <Menu className="h-4 w-4 text-[#cc785c]" />
              </button>

              {/* Documentation Tree List */}
              <nav className={`flex flex-col ${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex max-h-[calc(100vh-18rem)] overflow-y-auto pr-1 border-t border-current/10 pt-2 lg:border-t-0 lg:pt-0`}>
                {searchMode ? (
                  isSearching ? (
                    <span className="font-serif text-xs italic px-3 py-4 text-center text-current/60 flex items-center justify-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-[#cc785c]" />
                      Searching...
                    </span>
                  ) : searchResults.length > 0 ? (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono text-[#cc785c] uppercase pb-2 px-3 tracking-wider font-bold">
                        Search Results ({searchResults.length})
                      </span>
                      {searchResults.map((item) => (
                        <Tooltip key={item.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleSelectDoc(item)}
                              className={`text-left py-1.5 px-3 my-0.5 text-xs font-serif border-l-2 hover:bg-[#cc785c]/5 transition-colors cursor-pointer w-full flex items-center gap-1.5 ${
                                selectedDoc?.id === item.id
                                  ? "border-[#cc785c] text-[#cc785c] font-black bg-[#cc785c]/10"
                                  : "border-transparent text-current/75 hover:text-current font-medium"
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5 scale-90 opacity-60 shrink-0" />
                              <span className="truncate">{item.title}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="font-serif text-xs bg-[#1f1e1b] text-[#fcfaf2] border-[#cc785c]/30">
                            {item.title}
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ) : (
                    <span className="font-serif text-xs italic px-3 py-4 text-center text-current/60">
                      No matching documents found.
                    </span>
                  )
                ) : (
                  allDocs.length > 0 ? (
                    renderDocTree(docTree)
                  ) : (
                    <span className="font-serif text-xs italic px-3 py-4 text-center text-current/60">
                      No documentation files published.
                    </span>
                  )
                )}
              </nav>
            </aside>

            {/* Document Content View Pane */}
            <div className="lg:col-span-9 bg-[#fcfaf2] dark:bg-[#252320] border-2 border-current p-6 sm:p-10 md:p-14 vintage-shadow">
              {selectedDoc ? (
                <div className="max-w-3xl mx-auto space-y-6">
                  {/* Article header metadata */}
                  <div className="space-y-4 border-b border-current/15 pb-4 text-left">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#cc785c] flex flex-wrap items-center gap-4 select-none">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Refreshed {new Date(selectedDoc.updatedAt).toLocaleDateString(undefined, {
                          month: "long",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </span>
                      <span>
                        // SLUG: /{selectedDoc.slug}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl sm:text-4xl font-black leading-tight text-inherit uppercase font-newspaper">
                      {selectedDoc.title}
                    </h2>

                    {/* Share buttons */}
                    {shareUrl && (
                      <ShareBriefing url={shareUrl} title={selectedDoc.title} className="pt-3 border-t border-[#e6dfd8]/30 dark:border-current/10 mt-4" />
                    )}
                  </div>

                  {/* Inner Page Headings (Table of Contents) for quick scroll navigation */}
                  {toc.length > 0 && (
                    <div className="bg-[#efe9de]/30 dark:bg-[#1f1e1b]/40 border-t border-b border-current/15 py-3 select-none">
                      <p className="font-mono text-[10px] font-black uppercase text-[#cc785c] tracking-widest mb-2 px-1">
                        Document Outline Index
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 px-1 font-mono text-[10.5px] mt-3">
                        {toc.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => handleScrollToHeading(item.id)}
                            className={`hover:text-[#cc785c] text-left transition-colors flex items-center gap-2 cursor-pointer border-l-2 pl-2 py-0.5 ${
                              activeHeadingId === item.id 
                                ? "text-[#cc785c] font-bold border-[#cc785c]" 
                                : "text-current/70 border-current/15 hover:border-[#cc785c]/40"
                            }`}
                          >
                            <Bookmark className={`h-2.5 w-2.5 scale-75 shrink-0 ${activeHeadingId === item.id ? "opacity-100" : "opacity-40"}`} />
                            <span className="truncate w-full">{item.text}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parsed Markdown Body */}
                  <div 
                    className="markdown-content text-inherit text-sm md:text-base leading-relaxed font-serif prose dark:prose-invert py-4 selection:bg-[#cc785c]/35"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />

                  {/* Operational Footer info */}
                  <div className="border-t border-current/15 pt-6 text-[10px] font-mono text-current/60 select-none text-left">
                    <span className="block">// REFERENCE MANUAL ARCHIVAL SYSTEM</span>
                    <span className="block mt-1">CONFIDENTIALITY STATUS: APPROVED FOR PUBLIC DISPATCH</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <BookOpen className="h-12 w-12 opacity-35 text-[#cc785c] mb-4 animate-pulse" />
                  <h3 className="font-serif text-lg font-black uppercase font-newspaper">Dossier Unselected</h3>
                  <p className="font-serif text-xs text-current/70 max-w-xs mt-2">
                    Please choose an instruction manual or report from the index on the left.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-10 border-t-4 border-[#111111] mt-8 select-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono">
          <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>
          <p className="opacity-50">© {new Date().getFullYear()} Reference Board. Document System.</p>
        </div>
      </footer>
    </div>
  );
}

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

export default function DocsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const urlSlug = resolvedParams.slug?.[0] || null;

  return (
    <Suspense fallback={
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-serif text-stone-900 text-2xl animate-pulse font-bold">
        [ DECODING TECHNICAL DIRECTORY... ]
      </div>
    }>
      <DocsContent urlSlug={urlSlug} />
    </Suspense>
  );
}
