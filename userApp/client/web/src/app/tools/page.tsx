import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Terminal, Code2, ArrowRight } from "lucide-react";

export default function ToolsHub() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fcfaf2] dark:bg-[#141413] text-[#111111] dark:text-[#fcfaf2] selection:bg-[#cc785c]/30">
      <Navbar />
      
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="space-y-4 mb-12 border-b-2 border-current pb-8">
          <h1 className="font-serif text-4xl sm:text-5xl font-black uppercase tracking-tight font-newspaper">
            Developer Tools Hub
          </h1>
          <p className="text-sm md:text-base opacity-80 max-w-2xl font-mono">
            Access secure, client-side execution environments and utilities. No servers, zero latency. 
            Everything runs in the isolation of your own browser tab.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Main IDE Tool Card */}
          <div className="group border-2 border-current bg-white dark:bg-[#1f1e1b] p-6 vintage-shadow hover:vintage-shadow-lg transition-all duration-200 flex flex-col hover:-translate-y-1 lg:col-span-2">
            <div className="flex items-center gap-4 mb-4 border-b border-current/20 pb-4">
              <div className="h-12 w-12 border-2 border-current flex items-center justify-center bg-[#cc785c] text-white">
                <Code2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-serif text-xl md:text-2xl font-bold uppercase tracking-tight leading-none">
                  Cloud Sandbox IDE
                </h2>
                <span className="text-[10px] font-mono uppercase opacity-60 tracking-wider">
                  Node.js • Python • React • HTML/CSS
                </span>
              </div>
            </div>
            <p className="text-sm md:text-base opacity-80 mb-6 flex-1">
              A complete, professional-grade development environment running securely in your browser. 
              Instantly boot up and write code for Node.js, Express, React, Vanilla Web, or Python. 
              Features a live terminal, intelligent code completion, and real-time app previews.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded">Zero Latency</span>
              <span className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded">Live Preview</span>
              <span className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded">Package Manager</span>
              <span className="text-xs font-mono bg-black/5 dark:bg-white/10 px-2 py-1 rounded">File Explorer</span>
            </div>
            <Link href="/tools/code" className="w-full">
              <button className="w-full border-2 border-current py-3 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 group-hover:bg-[#cc785c] group-hover:text-white group-hover:border-[#cc785c] transition-colors">
                Launch IDE
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
          </div>

          {/* Coming Soon Placeholder 1 */}
          <div className="group border-2 border-dashed border-current/30 p-6 flex flex-col items-center justify-center text-center opacity-50 bg-black/5 dark:bg-white/5">
            <Terminal className="h-8 w-8 mb-4 opacity-40" />
            <h2 className="font-serif text-lg font-bold uppercase tracking-tight mb-2">
              Cloud Database
            </h2>
            <p className="text-xs font-mono">
              Coming soon. Instant, zero-config PostgreSQL visualizer.
            </p>
          </div>

          {/* Coming Soon Placeholder 2 */}
          <div className="group border-2 border-dashed border-current/30 p-6 flex flex-col items-center justify-center text-center opacity-50 bg-black/5 dark:bg-white/5">
            <Code2 className="h-8 w-8 mb-4 opacity-40" />
            <h2 className="font-serif text-lg font-bold uppercase tracking-tight mb-2">
              API Playground
            </h2>
            <p className="text-xs font-mono">
              Coming soon. Visual REST and GraphQL endpoint tester.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
