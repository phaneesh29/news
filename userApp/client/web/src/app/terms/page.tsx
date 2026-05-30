"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f5] font-sans text-[#141413] selection:bg-[#cc785c]/20 selection:text-[#141413]">
      {/* Top Header */}
      <header className="border-b border-[#e6dfd8] bg-[#faf9f5]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#141413] text-[#faf9f5] transition-transform group-hover:rotate-45">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2v20M2 12h20M5 5l14 14M5 19L19 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-serif text-xl font-medium tracking-tight text-[#141413]">DevBits</span>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="border-[#e6dfd8] text-xs flex items-center gap-1.5 hover:bg-[#efe9de]">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to News
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 sm:py-16">
        <article className="space-y-8">
          <div className="space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight text-[#141413]">
              Terms of Service
            </h1>
            <p className="text-xs text-[#6c6a64] font-mono">
              Last Updated: May 30, 2026
            </p>
          </div>

          <div className="h-px bg-[#e6dfd8]" />

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[#3d3d3a]">
            <p>
              Welcome to DevBits. By accessing our platform, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">1. Acceptance of Terms</h2>
            <p>
              By signing in or reading the feed materials on DevBits, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, along with our Privacy Policy.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">2. Description of Curation Service</h2>
            <p>
              DevBits aggregates developer news, release notes, and technical articles, augmenting this data with automated AI summary analysis, takeaways, and developer impact evaluations. All intelligence data is provided for educational and analytical purposes only. We make no guarantees regarding the accuracy, completeness, or up-to-the-minute precision of compiled news.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">3. User Authentication</h2>
            <p>
              Access to features like saving bookmarks and personalizing preference indices requires logging in through Google authentication. You agree to take full responsibility for securing your authenticated sessions and cookies.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">4. Intellectual Property</h2>
            <p>
              All aggregated article headlines, logos, and original content links are the property of their respective publishers. DevBits claims no ownership over external news bulletins. The design system layouts, styles, and automated analyses are the property of DevBits.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">5. Disclaimer of Liability</h2>
            <p>
              DevBits will not be held liable for any decisions, service refactoring, migration failures, or financial transactions executed based on our technical takeaway analysis or migration risk scores. Developers are expected to perform independent verification of official software releases before refactoring code.
            </p>
          </div>
        </article>
      </main>

      {/* Clean Footer */}
      <footer className="bg-[#181715] text-[#a09d96]/60 py-8 border-t border-[#252320]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} DevBits. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-[#faf9f5] transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-[#faf9f5] transition-colors">News Feed</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
