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
          
          {/* Node.js Sandbox Tool Card */}
          <div className="group border-2 border-current bg-white dark:bg-[#1f1e1b] p-6 vintage-shadow hover:vintage-shadow-lg transition-all duration-200 flex flex-col hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-4 border-b border-current/20 pb-4">
              <div className="h-12 w-12 border-2 border-current flex items-center justify-center bg-[#cc785c] text-white">
                <Terminal className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold uppercase tracking-tight leading-none">
                  Node.js Sandbox
                </h2>
                <span className="text-[10px] font-mono uppercase opacity-60 tracking-wider">
                  Client-side runtime
                </span>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-6 flex-1">
              A full Node.js environment powered by WebContainers. Write scripts, run <code>npm install</code>, 
              and test packages securely in your browser.
            </p>
            <Link href="/tools/code" className="w-full">
              <button className="w-full border-2 border-current py-2.5 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 group-hover:bg-[#cc785c] group-hover:text-white group-hover:border-[#cc785c] transition-colors">
                Launch Sandbox
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* Coming Soon Placeholder */}
          <div className="group border-2 border-dashed border-current/30 p-6 flex flex-col items-center justify-center text-center opacity-50">
            <Code2 className="h-10 w-10 mb-4 opacity-50" />
            <h2 className="font-serif text-lg font-bold uppercase tracking-tight mb-2">
              Python Sandbox
            </h2>
            <p className="text-xs font-mono">
              Coming soon. Pyodide CPython execution environment.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
