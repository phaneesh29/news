"use client";

import React, { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { fetchBlogsList, type BlogItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { 
  Clock, 
  ArrowRight,
  LogOut,
  Loader2,
  BookOpen
} from "lucide-react";
import Navbar from "@/components/Navbar";

export default function BlogsListPage() {
  const { data: sessionData, isPending, refetch } = useSession();
  const activeUser = sessionData?.user;

  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBlogs() {
      try {
        setLoading(true);
        const res = await fetchBlogsList();
        if (res.status === "success" && res.data) {
          setBlogs(res.data.blogs);
        }
      } catch (err) {
        console.error("Failed to load blog posts:", err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  const triggerGoogleLogin = async () => {
    try {
      await signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/blogs"
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

      {/* Hero Section */}
      <section className="relative bg-[#faf9f5] border-b border-[#e6dfd8] py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#cc785c]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#cc785c]">
            <BookOpen className="h-3.5 w-3.5" />
            Engineering & Strategy Blog
          </div>

          <h1 className="mt-4 font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#141413] leading-tight">
            Deep Dives & Technical Insights
          </h1>

          <p className="mt-4 text-sm sm:text-base text-[#6c6a64] leading-relaxed max-w-xl">
            Read comprehensive analyses, development tutorials, and best practices shared by the DevBits curation team.
          </p>
        </div>
      </section>

      {/* Blogs Grid */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-8 w-8 text-[#cc785c] animate-spin" />
            <p className="text-xs text-[#6c6a64] font-mono">Fetching latest publications...</p>
          </div>
        ) : !activeUser ? (
          <div className="text-center py-20 border border-dashed border-[#e6dfd8] rounded-xl bg-[#efe9de]/10 max-w-2xl mx-auto flex flex-col items-center gap-4">
            <p className="text-sm text-[#6c6a64]">Please sign in to read our technical deep dives.</p>
            <Button 
              onClick={triggerGoogleLogin}
              className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-0 text-xs font-semibold px-6 py-2 h-9 rounded-md transition-colors"
            >
              Sign In with Google
            </Button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#e6dfd8] rounded-xl bg-[#efe9de]/10 max-w-2xl mx-auto">
            <p className="text-sm text-[#6c6a64]">No blog posts have been published yet.</p>
            <Link href="/">
              <Button className="mt-4 bg-[#141413] hover:bg-[#252523] text-white border-0 text-xs">
                Back to News Broadcasts
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Card key={blog.id} className="border border-[#e6dfd8] bg-[#faf9f5] flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                <div>
                  <CardHeader className="p-6 pb-3 space-y-2">
                    <div className="text-[10px] text-[#8e8b82] font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#cc785c]" />
                      {new Date(blog.createdAt).toLocaleDateString(undefined, {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                    <Link href={`/blogs/${blog.id}`} className="block group">
                      <CardTitle className="font-serif text-xl font-normal leading-tight text-[#141413] group-hover:text-[#cc785c] transition-colors line-clamp-2">
                        {blog.title}
                      </CardTitle>
                    </Link>
                  </CardHeader>
                  <CardContent className="px-6 pb-4">
                    <p className="text-xs text-[#6c6a64] leading-relaxed line-clamp-4">
                      {blog.content}
                    </p>
                  </CardContent>
                </div>
                <CardFooter className="px-6 py-4 border-t border-[#e6dfd8] bg-[#f5f0e8]/20 flex justify-end">
                  <Link href={`/blogs/${blog.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-[#cc785c] hover:text-[#a9583e] hover:bg-transparent p-0 flex items-center gap-1.5 group">
                      Read Blog Post
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
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
