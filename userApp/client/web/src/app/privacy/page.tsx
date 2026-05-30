"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-xs text-[#6c6a64] font-mono">
              Last Updated: May 30, 2026
            </p>
          </div>

          <div className="h-px bg-[#e6dfd8]" />

          <div className="space-y-6 text-sm sm:text-base leading-relaxed text-[#3d3d3a]">
            <p>
              At DevBits, accessible from devbits.ai, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by DevBits and how we use it.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">1. Information We Collect</h2>
            <p>
              When you authenticate using Google Social Sign-in, we collect basic profile details including your name, email address, profile photo URL, and a unique provider identifier. This information is required to establish your secure user account and synchronize your bookmarks across devices.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">2. How We Use Your Information</h2>
            <p>
              We use the collected information solely to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[#3d3d3a]">
              <li>Authenticate your account session securely using Better Auth tokens.</li>
              <li>Provide and maintain your customized feed preferences and saved bookmarks index.</li>
              <li>Improve, personalize, and expand our news curation services.</li>
              <li>Monitor and prevent unauthorized access or system vulnerabilities.</li>
            </ul>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">3. Log Files and Cookies</h2>
            <p>
              DevBits follows a standard procedure of using log files and cookies. These files log visitors when they access the platform. We store secure HTTP-only cookies on your client browser to verify authentication sessions with our database-backed Express endpoints. These cookies are not used to track your activities across external third-party platforms.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">4. Third-Party Services</h2>
            <p>
              Our authentication integrations communicate directly with Google OAuth APIs. We do not sell, trade, or share your profile details with external marketing partners. All database transactions are stored securely within our private Neon PostgreSQL infrastructure.
            </p>

            <h2 className="font-serif text-2xl font-normal text-[#141413] pt-4">5. Your Rights and Data Deletion</h2>
            <p>
              You have the right to request deletion of your authenticated user details and associated bookmarks. To purge your account data, please sign out and contact our systems administrator. Your data will be deleted from our active PostgreSQL instances immediately.
            </p>
          </div>
        </article>
      </main>

      {/* Clean Footer */}
      <footer className="bg-[#181715] text-[#a09d96]/60 py-8 border-t border-[#252320]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 flex flex-wrap justify-between items-center gap-4 text-xs">
          <p>© {new Date().getFullYear()} DevBits. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[#faf9f5] transition-colors">Terms of Service</Link>
            <Link href="/" className="hover:text-[#faf9f5] transition-colors">News Feed</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
