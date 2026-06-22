"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-[#cc785c]/25 selection:text-[#141413]">
      <Navbar />

      {/* Retro Newspaper Masthead */}
      <header className="py-8 md:py-12 border-b-4 border-double border-current px-4 bg-transparent text-inherit text-center">
        <div className="mx-auto max-w-7xl flex flex-col items-center space-y-4">
          
          <div className="w-full flex justify-between items-center text-[10px] md:text-xs font-mono uppercase tracking-widest border-b border-current pb-2 max-w-4xl">
            <span>LEGAL BULLETIN</span>
            <span>OFFICIAL OPERATIVE DECREE</span>
            <span>SECTION T // TERMS</span>
          </div>

          {/* Gothic Masthead Title */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-inherit uppercase font-blackletter border-b border-current pb-4 w-full max-w-4xl">
            Terms of Service
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
              DOC // REF-TS-882
            </span>
          </div>

          <div className="space-y-6 text-sm sm:text-base leading-relaxed newspaper-body font-serif">
            <p>
              Welcome to DevBits. By accessing our platform, you agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before utilizing our news feeds, dispatches, and curation indexes.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              1. Acceptance of Terms
            </h2>
            <p>
              By signing in, authenticating, or reading the feed materials on DevBits, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, along with our Privacy Policy.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              2. Description of Curation Service
            </h2>
            <p>
              DevBits aggregates developer news, release notes, compiler bulletins, and technical articles, augmenting this data with automated AI summary analysis, takeaways, and developer impact evaluations. All intelligence data is provided for educational and analytical purposes only. We make no guarantees regarding the accuracy, completeness, or up-to-the-minute precision of compiled news.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              3. User Authentication & Terminal Management
            </h2>
            <p>
              Access to features like saving bookmarks, setting custom feeds, liking dispatches, and submitting correspondence dispatches to the editor requires logging in through Google authentication. Each user login registers an active session terminal containing your device User-Agent and IP address. You agree to take full responsibility for securing your authenticated sessions and cookies. Users can view and revoke any active session terminal from their secure Security Dossier (Profile page) at any time.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              4. Customization & Local Settings
            </h2>
            <p>
              DevBits provides client-side typography, text scale adjustment, dual column broadsheet controls, aged paper warmness multiply filters, CRT scanline raster simulations, and wood-fiber pulp grain overlays. These visual preference indices are persisted purely on the user's browser local storage (localStorage) for privacy and offline persistence, and are not synchronized to our server database.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              5. Intellectual Property & User Letters
            </h2>
            <p>
              All aggregated article headlines, logos, and original content links are the property of their respective publishers. DevBits claims no ownership over external news bulletins. The design system layouts, styles, and automated analyses are the property of DevBits. Any communications or feedback submitted through our "Letters to the Editor" feedback form remain the property of the sender, but grant DevBits a royalty-free license to use feedback message contents to improve our services.
            </p>

            <h2 className="font-serif text-xl sm:text-2xl font-black mt-10 mb-3 uppercase font-newspaper border-b border-current/25 pb-1 text-[#cc785c]">
              6. Disclaimer of Liability
            </h2>
            <p>
              DevBits will not be held liable for any decisions, service refactoring, migration failures, or financial transactions executed based on our technical takeaway analysis or migration risk scores. Developers are expected to perform independent verification of official software releases before refactoring code.
            </p>
          </div>

          <div className="border-t border-[#e6dfd8]/60 dark:border-current/15 pt-6 flex justify-between items-center text-xs font-mono opacity-60">
            <span>SECURE LEGAL BLOCK v1.2 // SYNCED</span>
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
