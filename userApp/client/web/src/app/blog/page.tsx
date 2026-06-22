"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchBlogsList, searchBlogsList, type BlogItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { 
  Clock, 
  ArrowRight,
  Loader2,
  BookOpen,
  Calendar
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function BlogListPage() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;
  const router = useRouter();

  // Redirect to login if user is logged out
  useEffect(() => {
    if (!isPending && !activeUser) {
      router.push("/login");
    }
  }, [activeUser, isPending, router]);

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!activeUser) {
      setLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setLoading(true);
        if (searchQuery.trim() === "") {
          const res = await fetchBlogsList();
          if (res.status === "success" && res.data) {
            setBlogs(res.data.blogs);
            setNextCursor(res.data.nextCursor);
          }
        } else {
          const res = await searchBlogsList(searchQuery);
          if (res.status === "success" && res.data) {
            setBlogs(res.data.blogs);
            setNextCursor(null);
          }
        }
      } catch (err) {
        console.error("Failed to load or search blog posts:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, activeUser]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore || !activeUser) return;
    try {
      setLoadingMore(true);
      const res = await fetchBlogsList(nextCursor);
      if (res.status === "success" && res.data) {
        const data = res.data;
        setBlogs(prev => [...prev, ...data.blogs]);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load more blogs:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/blog"
      });
    } catch (err) {
      console.error("Authentication redirect error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col paper-grain selection:bg-[#cc785c]/20 selection:text-[#141413]">
      <Navbar />

      {/* Broadsheet Blog Header */}
      <header className="py-8 md:py-12 border-b-4 border-double border-current px-4 bg-transparent text-inherit text-center">
        <div className="mx-auto max-w-7xl flex flex-col items-center space-y-4">
          
          <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest border-b border-current pb-2 max-w-6xl">
            <span>EDITORIAL BULLETIN</span>
            <span>STRATEGIC INTEL REPORT</span>
            <span>SECTION B // BLOGS</span>
          </div>

             {/* Gothic Masthead Title */}
             <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-inherit select-none uppercase font-blackletter border-b border-current pb-4 w-full max-w-6xl">
               Chronicles
             </h1>
             
             <div className="text-center font-serif italic text-sm md:text-base border-t border-b border-current py-1 max-w-2xl px-6 font-newspaper">
               "Deep Technical Takeaways, Architectural Briefings & Engineering Guidelines"
             </div>
        </div>
      </header>

      {/* Blogs Grid */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {activeUser && (
          <div className="mb-8 max-w-md mx-auto sm:mx-0">
            <div className="flex items-center gap-2 bg-[#fcfaf2] dark:bg-[#1f1e1b] border-2 border-[#111111] dark:border-[#e6dfd8] px-3 py-3 font-mono text-xs shadow-[2px_2px_0px_#111111] dark:shadow-[2px_2px_0px_#e6dfd8] focus-within:shadow-none transition-all">
              <span className="text-[#cc785c] font-bold uppercase shrink-0">// SEARCH:</span>
              <input 
                type="text" 
                placeholder="Search chronicles (title, content, slug)..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full bg-transparent outline-none border-none p-0 text-inherit text-xs font-mono"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs font-mono">Retrieving chronicles database...</p>
          </div>
        ) : !activeUser ? (
          <div className="text-center py-20 border-2 border-dashed border-[#e6dfd8] rounded-none bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4 p-8 vintage-shadow">
            <p className="text-sm font-serif italic">Please sign in to read strategic engineering analyses.</p>
            <Button 
              onClick={triggerGoogleLogin}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] text-xs font-bold px-6 py-2 h-9 rounded-none vintage-shadow transition-colors"
            >
              Sign In with Google
            </Button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-[#e6dfd8] rounded-none bg-[#efe9de]/10 max-w-2xl mx-auto p-8 vintage-shadow">
            <p className="text-sm font-serif italic">
              {searchQuery ? `No chronicles discovered matching "${searchQuery}".` : "No chronicles have been published for this print cycle."}
            </p>
            {searchQuery ? (
              <Button 
                onClick={() => setSearchQuery("")}
                className="mt-4 bg-[#111111] hover:bg-[#222222] text-white border-2 border-[#111111] text-xs font-bold rounded-none px-6 vintage-shadow-sm cursor-pointer"
              >
                Clear Search Query
              </Button>
            ) : (
              <Link href="/news">
                <Button className="mt-4 bg-[#111111] hover:bg-[#222222] text-white border-2 border-[#111111] text-xs font-bold rounded-none px-6 vintage-shadow-sm">
                  Back to News Wire
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <article 
                key={blog.id} 
                className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] flex flex-col justify-between hover:-translate-y-0.5 transition-all vintage-shadow p-6"
              >
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider flex items-center gap-1.5 border-b border-[#e6dfd8] pb-3 mb-4 opacity-75">
                    <Clock className="h-3.5 w-3.5 text-[#cc785c]" />
                    {new Date(blog.createdAt).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </div>
                  <Link href={`/blog/${blog.id}`} className="block group">
                    <h3 className="font-serif text-xl sm:text-2xl font-black tracking-tight hover:text-[#cc785c] cursor-pointer transition-colors leading-tight font-newspaper">
                      {blog.title}
                    </h3>
                  </Link>
                  <p className="mt-4 text-xs md:text-sm leading-relaxed opacity-85 line-clamp-4">
                    {blog.content}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#111111]/15 dark:border-[#e6dfd8]/15 flex justify-end">
                  <Link href={`/blog/${blog.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-wider text-[#cc785c] hover:text-[#a9583e] hover:bg-[#cc785c]/10 border border-[#cc785c]/20 hover:border-[#cc785c] px-3.5 py-1.5 flex items-center gap-1.5 group rounded-none transition-all cursor-pointer">
                      Read chronicle
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {nextCursor && (
            <div className="flex justify-center mt-12">
              <Button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="bg-[#fcfaf2] dark:bg-[#252320] text-inherit border-2 border-[#111111] dark:border-[#e6dfd8] font-mono text-xs font-bold px-8 py-5 rounded-none vintage-shadow-sm hover:bg-[#efe9de] dark:hover:bg-[#181715] hover:scale-[0.98] transition-all cursor-pointer"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    DECODING CHRONICLES WIRE...
                  </>
                ) : (
                  "FETCH MORE CHRONICLES"
                )}
              </Button>
            </div>
          )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 border-t-4 border-[#111111]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono">
          <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>
          <p className="opacity-50">© {new Date().getFullYear()} Curation Newsroom. Chronicles.</p>
        </div>
      </footer>
    </div>
  );
}
