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
import { marked } from "marked";
import Navbar from "@/components/Navbar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;

  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>("");

  // Unwrap params using React.use() or a simple local state
  const [blogId, setBlogId] = useState<string | null>(null);

  useEffect(() => {
    if (blog?.content) {
      const parsed = marked.parse(blog.content);
      if (parsed instanceof Promise) {
        parsed.then((res) => setHtmlContent(res)).catch(console.error);
      } else {
        setHtmlContent(parsed);
      }
    }
  }, [blog]);

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
      
      <Navbar />

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
        ) : !activeUser ? (
          <div className="text-center py-16 border border-dashed border-[#e6dfd8] rounded-xl bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4">
            <p className="text-sm text-[#6c6a64]">Please sign in to read this blog post.</p>
            <Button 
              onClick={triggerGoogleLogin}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-0 text-xs font-semibold px-6 py-2 h-9 rounded-md transition-colors"
            >
              Sign In with Google
            </Button>
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
            <div 
              className="markdown-content text-[#3d3d3a] text-sm sm:text-base leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
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
