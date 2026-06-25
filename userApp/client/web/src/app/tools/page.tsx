import Link from "next/link";
import { ArrowLeft, ArrowRight, Code2, Terminal, Database, Activity } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools Hub",
};

export default function ToolsHub() {
  return (
    <div className="min-h-screen bg-background text-foreground newspaper-theme-layout p-4 sm:p-8 font-newspaper selection:bg-[#cc785c] selection:text-white pb-24">
      <div className="mx-auto max-w-4xl pt-8">
        
        <div className="mb-6">
          <Link href="/news" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-current hover:text-[#cc785c] transition-colors w-fit">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-12 border-b-4 border-double border-current pb-6 flex items-center justify-between">
          <div>
            <h1 className="font-blackletter text-5xl sm:text-6xl text-current tracking-wide mb-2">Tools Hub</h1>
            <p className="font-sans text-sm italic opacity-80 uppercase tracking-widest">
              Secure Execution Environments & Utilities
            </p>
          </div>
          <Code2 className="h-12 w-12 text-[#cc785c] hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Main IDE Tool Card */}
          <Link 
            href="/tools/code" 
            className="group block border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-8 vintage-shadow-lg transition-all hover:-translate-y-1 hover:border-[#cc785c] duration-300 relative overflow-hidden md:col-span-2"
          >
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-current opacity-50 group-hover:border-[#cc785c] transition-colors"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-current opacity-50 group-hover:border-[#cc785c] transition-colors"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-current opacity-50 group-hover:border-[#cc785c] transition-colors"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-current opacity-50 group-hover:border-[#cc785c] transition-colors"></div>

            <div className="flex items-start justify-between mb-6">
              <Terminal className="h-10 w-10 text-current group-hover:text-[#cc785c] transition-colors" />
              <div className="bg-current text-background text-[10px] font-bold uppercase tracking-widest px-2 py-1 font-mono">
                Primary Tool
              </div>
            </div>

            <h2 className="font-blackletter text-3xl mb-3 group-hover:text-[#cc785c] transition-colors">Cloud Sandbox IDE</h2>
            <p className="font-mono text-sm opacity-80 leading-relaxed mb-6">
              A complete, professional-grade development environment running securely in your browser. Instantly boot up and write code for Node.js, Express, React, Vanilla Web, or Python. Features a live terminal, intelligent code completion, and real-time app previews with zero latency.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-[10px] font-mono border border-current/20 px-2 py-1 rounded-sm uppercase tracking-widest bg-black/5 dark:bg-white/5">Zero Latency</span>
              <span className="text-[10px] font-mono border border-current/20 px-2 py-1 rounded-sm uppercase tracking-widest bg-black/5 dark:bg-white/5">Live Preview</span>
              <span className="text-[10px] font-mono border border-current/20 px-2 py-1 rounded-sm uppercase tracking-widest bg-black/5 dark:bg-white/5">Package Manager</span>
            </div>

            <div className="flex items-center text-[#cc785c] font-bold uppercase tracking-wider text-sm">
              Launch Environment <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </div>
          </Link>

          {/* Coming Soon Placeholder 1 */}
          <div className="group block border-4 border-dashed border-[#111111]/30 dark:border-[#e6dfd8]/30 bg-[#fcfaf2]/50 dark:bg-[#252320]/50 p-8 relative overflow-hidden">
            <div className="flex items-start justify-between mb-6 opacity-40">
              <Database className="h-10 w-10 text-current" />
              <div className="border border-current text-[10px] font-bold uppercase tracking-widest px-2 py-1 font-mono">
                Pending
              </div>
            </div>

            <h2 className="font-blackletter text-3xl mb-3 opacity-40">Cloud Database</h2>
            <p className="font-mono text-sm opacity-40 leading-relaxed mb-8">
              Instant, zero-config PostgreSQL visualizer. Connect to databases and execute queries securely from the client.
            </p>

            <div className="flex items-center font-bold uppercase tracking-wider text-sm opacity-30">
              Coming Soon
            </div>
          </div>

          {/* Coming Soon Placeholder 2 */}
          <div className="group block border-4 border-dashed border-[#111111]/30 dark:border-[#e6dfd8]/30 bg-[#fcfaf2]/50 dark:bg-[#252320]/50 p-8 relative overflow-hidden">
            <div className="flex items-start justify-between mb-6 opacity-40">
              <Activity className="h-10 w-10 text-current" />
              <div className="border border-current text-[10px] font-bold uppercase tracking-widest px-2 py-1 font-mono">
                Pending
              </div>
            </div>

            <h2 className="font-blackletter text-3xl mb-3 opacity-40">API Playground</h2>
            <p className="font-mono text-sm opacity-40 leading-relaxed mb-8">
              Visual REST and GraphQL endpoint tester. Inspect network requests, test webhooks, and debug APIs with ease.
            </p>

            <div className="flex items-center font-bold uppercase tracking-wider text-sm opacity-30">
              Coming Soon
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
