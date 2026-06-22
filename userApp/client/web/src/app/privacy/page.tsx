"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[#cc785c]/25 selection:text-[#141413]">
      <Navbar />

      {/* Retro Newspaper Masthead */}
      <header className="py-8 md:py-12 border-b-4 border-double border-current px-4 bg-transparent text-inherit text-center">
        <div className="mx-auto max-w-7xl flex flex-col items-center space-y-4">
          
          <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest border-b border-current pb-2 max-w-4xl">
            <span>LEGAL BULLETIN</span>
            <span>DATA MANAGEMENT DIRECTIVE</span>
            <span>SECTION P // PRIVACY</span>
          </div>

          {/* Gothic Masthead Title */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-inherit uppercase font-blackletter border-b border-current pb-4 w-full max-w-4xl">
            Privacy Policy
          </h1>

          <div className="text-[10px] font-mono opacity-70 uppercase tracking-wider">
            ✦ Last updated: June 22, 2026
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 py-10">
        <article className="bg-[#fcfaf2] dark:bg-[#252320] border-2 border-[#111111] dark:border-[#e6dfd8] p-6 md:p-10 vintage-shadow-lg space-y-8">
          
          {/* Section back control */}
          <div className="border-b border-[#e6dfd8]/60 dark:border-current/15 pb-4 flex justify-between items-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#cc785c] hover:-translate-x-0.5 transition-all group">
              <ArrowLeft className="h-4 w-4" />
              Return to Lobby
            </Link>
            <span className="font-mono text-[9px] opacity-50 uppercase tracking-widest">
              DOC // REF-PP-994
            </span>
          </div>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed newspaper-body font-serif">
            <p>
              At DevBits, accessible from devbits.ai, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected, processed, and recorded by DevBits and how we protect it.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              1. Information We Collect
            </h2>
            <p>
              When you authenticate using Google Social Sign-in, we collect basic profile details including your name, email address, profile photo URL, and a unique provider identifier. 
            </p>
            <p>
              In addition, our systems collect active session telemetry when you are logged in. This includes your IP address, browser type, device type (parsed from the User-Agent header), session expiration timestamps, and session tokens. 
            </p>
            <p>
              We also collect user-generated interactions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>News likes and recommendations, associating your user account identifier with specific curated news dispatches.</li>
              <li>"Letters to the Editor" feedback dispatches, containing your email, identifier, and the message content you submit.</li>
            </ul>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              2. How We Use Your Information
            </h2>
            <p>
              We use the collected database details solely to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Authenticate your account session securely using Better Auth tokens.</li>
              <li>Provide and maintain your customized feed preferences and saved liked news dispatches.</li>
              <li>Improve, personalize, and expand our news curation services.</li>
              <li>Monitor, list, and let you revoke active session terminal devices from your user profile.</li>
              <li>Deliver your feedback dispatches directly to the systems administration and editorial board.</li>
            </ul>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              3. Data Storage & Infrastructure
            </h2>
            <p>
              All user profiles, sessions, likes, and feedbacks are stored within our database instances, hosted on a Neon PostgreSQL serverless cloud cluster. Database tables are structured and updated using the Drizzle ORM schemas. Secure HTTP-only cookies are utilized to synchronize authenticated client sessions with the Express endpoints. 
            </p>
            <p>
              Client visualization properties (such as CRT display controls, font families, text scaling, parchment warmness sliders, and scanline/grain layers) are stored purely on the client side in the browser's <code>localStorage</code>, so this information is never transmitted to or processed by our servers.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              4. Third-Party Integrations
            </h2>
            <p>
              Our authentication integrations communicate directly with Google OAuth APIs. We do not sell, trade, or share your profile details or device logs with external marketing partners.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              5. Your Rights and Data Deletion
            </h2>
            <p>
              You have the right to inspect your session logs, terminate individual login terminals via the Security Dossier view, and request total deletion of your authenticated user details, liked recommendations, and feedback dispatches. To purge your account data entirely, please contact our systems administrator. Your records will be deleted from our Neon PostgreSQL database instances immediately.
            </p>
          </div>

          <div className="border-t border-[#e6dfd8]/60 dark:border-current/15 pt-6 flex justify-between items-center text-xs font-mono opacity-60">
            <span>SECURE PRIVACY BLOCK v1.2 // SYNCED</span>
            <span>END OF BRIEF</span>
          </div>

        </article>
      </main>

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-12 border-t-4 border-[#111111] mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6 text-xs font-mono">
          <span className="font-serif text-lg font-bold text-[#faf9f5]">DEVBITS</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/settings" className="hover:underline">Settings</Link>
          </div>
          <p className="opacity-50">© {new Date().getFullYear()} Curation Newsroom. Legal archives.</p>
        </div>
      </footer>
    </div>
  );
}
