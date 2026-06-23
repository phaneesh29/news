import Link from "next/link";
import { ArrowRight, BrainCircuit, Gamepad2, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playables Hub",
};

export default function PlayablesHub() {
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
            <h1 className="font-blackletter text-5xl sm:text-6xl text-current tracking-wide mb-2">Playables</h1>
            <p className="font-sans text-sm italic opacity-80 uppercase tracking-widest">
              Amusements, Diversions & Technical Assessments
            </p>
          </div>
          <Gamepad2 className="h-12 w-12 text-[#cc785c] hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Quiz Game Card */}
          <Link 
            href="/playables/quiz" 
            className="group block border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-8 vintage-shadow-lg transition-all hover:-translate-y-1 hover:border-[#cc785c] duration-300 relative overflow-hidden"
          >
            {/* Decorative corners */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-current opacity-50 group-hover:border-[#cc785c] transition-colors"></div>
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-current opacity-50 group-hover:border-[#cc785c] transition-colors"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-current opacity-50 group-hover:border-[#cc785c] transition-colors"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-current opacity-50 group-hover:border-[#cc785c] transition-colors"></div>

            <div className="flex items-start justify-between mb-6">
              <BrainCircuit className="h-10 w-10 text-current group-hover:text-[#cc785c] transition-colors" />
              <div className="bg-current text-background text-[10px] font-bold uppercase tracking-widest px-2 py-1 font-mono">
                Featured
              </div>
            </div>

            <h2 className="font-blackletter text-3xl mb-3 group-hover:text-[#cc785c] transition-colors">Developer Trivia</h2>
            <p className="font-mono text-sm opacity-80 leading-relaxed mb-8">
              Test your knowledge on web technologies, tools, and computer science. A challenging evaluation for the modern engineer.
            </p>

            <div className="flex items-center text-[#cc785c] font-bold uppercase tracking-wider text-sm">
              Commence Assessment <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
            </div>
          </Link>

          {/* Coming Soon Card */}
          <div className="border-2 border-dashed border-current/50 bg-[#111111]/5 dark:bg-[#e6dfd8]/5 p-8 flex flex-col items-center justify-center text-center opacity-70">
            <h2 className="font-blackletter text-2xl mb-2 opacity-50">More Coming Soon</h2>
            <p className="font-mono text-xs opacity-60">
              The editorial board is currently developing new amusements. Check back in future editions.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
