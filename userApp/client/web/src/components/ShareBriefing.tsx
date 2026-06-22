"use client";

import React, { useState } from "react";
import { Link2, Check } from "lucide-react";

interface ShareBriefingProps {
  url: string;
  title: string;
  className?: string;
}

export default function ShareBriefing({ url, title, className = "" }: ShareBriefingProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL to clipboard:", err);
    }
  };

  const xShareUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
    `Check out this chronicle: "${title}"`
  )}`;
  
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className={`flex items-center gap-3 font-mono text-xs ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">// SHARE:</span>
      <div className="flex items-center gap-2">
        {/* X (formerly Twitter) SVG Icon */}
        <a
          href={xShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on X"
          className="h-8 w-8 inline-flex items-center justify-center border-2 border-current hover:bg-[#cc785c]/10 active:scale-95 transition-all text-current rounded-none"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* LinkedIn SVG Icon */}
        <a
          href={linkedinShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on LinkedIn"
          className="h-8 w-8 inline-flex items-center justify-center border-2 border-current hover:bg-[#cc785c]/10 active:scale-95 transition-all text-current rounded-none"
        >
          <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
          </svg>
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy Link"}
          className={`h-8 px-2.5 inline-flex items-center gap-1.5 border-2 border-current active:scale-95 transition-all text-current rounded-none font-bold uppercase text-[10px] cursor-pointer ${
            copied 
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-600 dark:text-emerald-400 dark:border-emerald-400" 
              : "hover:bg-[#cc785c]/10"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Link2 className="h-3.5 w-3.5" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
