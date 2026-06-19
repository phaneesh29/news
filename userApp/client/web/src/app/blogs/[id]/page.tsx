"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchBlogById, type BlogItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { 
  Clock, 
  ArrowLeft,
  LogOut,
  Loader2,
  BookOpen
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params using React.use() or a simple local state
  const [blogId, setBlogId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setBlogId(p.id)).catch(() => setError("Invalid parameters"));
  }, [params]);

  useEffect(() => {
    if (!blogId) return;

    async function loadBlog() {
      try {
        setLoading(true);
        const res = await fetchBlogById(blogId!);
        if (res.status === "success" && res.data?.blog) {
          setBlog(res.data.blog);
        } else {
          setError(res.message || "Failed to load blog post");
        }
      } catch (err) {
        console.error("Failed to load blog post:", err);
        setError("An error occurred while fetching the blog post.");
      } finally {
        setLoading(false);
      }
    }
    loadBlog();
  }, [blogId]);

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + `/blogs/${blogId}`
      });
    } catch (err) {
      console.error("Authentication redirect error:", err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    refetch();
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

            <Link href="/blogs" className="hidden sm:inline-block text-xs font-semibold text-[#6c6a64] hover:text-[#141413] transition-colors border-l border-[#e6dfd8] pl-4">
              Blogs
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

      {/* Main Blog Post Container */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 sm:py-16">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-xs font-semibold text-[#6c6a64] hover:text-[#cc785c] transition-colors mb-8 group">
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to Blog Posts
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs text-[#6c6a64] font-mono">Loading dynamic layout...</p>
          </div>
        ) : error || !blog ? (
          <div className="text-center py-16 border border-[#e6dfd8] rounded-xl bg-[#efe9de]/10">
            <p className="text-sm text-[#cc785c] font-medium">{error || "Blog post not found."}</p>
            <Link href="/blogs">
              <Button className="mt-4 bg-[#141413] hover:bg-[#252523] text-white border-0 text-xs">
                Back to Blogs List
              </Button>
            </Link>
          </div>
        ) : (
          <article className="space-y-8">
            {/* Post Metadata Header */}
            <div className="space-y-4">
              <div className="text-xs text-[#cc785c] font-mono flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                <Clock className="h-3.5 w-3.5" />
                Published {new Date(blog.createdAt).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </div>
              
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#141413] leading-[1.15]">
                {blog.title}
              </h1>
            </div>

            <div className="h-px bg-[#e6dfd8]" />

            {/* Post Content */}
            <div className="text-[#3d3d3a] text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans space-y-6">
              {blog.content}
            </div>
          </article>
        )}
      </main>

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
