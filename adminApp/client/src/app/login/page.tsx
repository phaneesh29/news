"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../config";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        setStatus("error");
        const backendError = typeof data.error === "string" ? data.error : data.error?.message;
        setMessage(backendError || "TRANSMISSION FAILED. ERR_0x9A");
      }
    } catch (err) {
      setStatus("error");
      setMessage("FATAL ERROR: NEURAL LINK SEVERED");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#060608] desk-mat flex items-center justify-center p-4 sm:p-8 relative selection:bg-red-500/30 selection:text-red-200 text-white font-mono">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-red-950/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* CD-ROM Window Shell */}
      <div className="cd-rom-window w-full max-w-5xl z-10 relative animate-bounce-slight">
        
        {/* Title bar resembling classic win95 window */}
        <div className="cd-rom-titlebar select-none">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
              <path d="M6 6h.01M10 6h.01"/>
            </svg>
            C:\BUREAU\DEV_NEWS_AUTH.EXE
          </span>
          <div className="flex gap-1.5">
            <button 
              onClick={() => router.push('/')}
              className="cursor-pointer bg-[#d4d0c8] text-black border border-white border-b-zinc-700 border-r-zinc-700 px-2 py-0.5 leading-none font-bold text-xs hover:bg-zinc-200 active:border-b-white active:border-r-white active:border-t-zinc-700 active:border-l-zinc-700"
              title="Close Installer"
            >
              X
            </button>
          </div>
        </div>
        
        {/* Window Content */}
        <div className="p-4 sm:p-6 bg-[#d4d0c8] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZDRkMGM4Ii8+CjxwYXRoIGQ9Ik0wIDBoMnYySDB6bTIgMmgydjJIMnoiIGZpbGw9IiNhMGExYTMiIGZpbGwtb3BhY2l0eT0iLjE1Ii8+Cjwvc3ZnPg==')]">
          
          <main className="parchment-sheet relative flex w-full flex-col p-6 sm:p-10 md:p-12 md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-20 rounded-md">
            
            {/* Coffee ring stain details */}
            <div className="coffee-stain top-6 left-12 opacity-50 rotate-[40deg]"></div>

            {/* Brass paper clip details */}
            <div className="absolute -top-6 left-10 w-6 h-16 bg-gradient-to-b from-stone-400 via-stone-300 to-stone-500 rounded-full border border-stone-600 shadow z-30 pointer-events-none transform -rotate-[5deg]"></div>

            {/* Newspaper Column */}
            <div className="flex-1 pr-0 md:pr-10 border-b-4 md:border-b-0 md:border-r-2 border-stone-400/80 mb-8 md:mb-0 pb-8 md:pb-0 relative text-stone-900">
              
              <div className="border-b-4 border-stone-900 pb-2 mb-4">
                <span className="font-mono text-[9px] text-stone-600 font-bold uppercase tracking-wider block mb-1">
                  SECURE BOMBAY TELEGRAPH // COGNITIVE DECK
                </span>
                <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-black text-center tracking-tighter uppercase leading-[0.85] mb-2 transform -skew-x-3">
                  <span className="text-red-800">BREACH</span> REPORT
                </h1>
              </div>
              
              <div className="bg-[#1a1a1a] text-[#f4ecd8] py-1 text-center font-mono text-[10px] tracking-widest uppercase mb-6 shadow-[-4px_4px_0_var(--color-blood-red)] font-bold">
                PANIC STATE: LEVEL OMEGA
              </div>

              <div className="text-[14px] leading-relaxed text-justify font-serif">
                The mainframe database has quarantined access keys following unauthorized queries in the Bombay sector. Operational terminals have fallback mechanisms activated. 
                <br/><br/>
                Operatives must enter a registered email address in the attached clearance folder to request a cryptographic override code. Failing to input coordinates will trigger local telemetry wipes.
              </div>
              
              {/* Retro graphic */}
              <div className="mt-8 border-2 border-stone-900 p-4 rotate-2 bg-stone-300/40 relative max-w-[280px] mx-auto">
                <div className="absolute -top-3.5 -right-2 bg-red-800 text-stone-200 font-mono text-[9px] font-bold px-2 py-0.5 transform rotate-6 uppercase">
                  CLASSIFIED
                </div>
                <div className="w-12 h-12 mx-auto opacity-75 mix-blend-multiply flex items-center justify-center">
                  <svg className="w-full h-full text-stone-950" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="50" cy="50" r="40" />
                    <line x1="50" y1="10" x2="50" y2="90" />
                    <line x1="10" y1="50" x2="90" y2="50" />
                    <circle cx="50" cy="50" r="15" strokeDasharray="3 3"/>
                  </svg>
                </div>
                <p className="font-mono text-center text-[9px] mt-2 uppercase font-black tracking-wider text-stone-800">
                  DECRYPTION MODULE SYNCED
                </p>
              </div>
            </div>

            {/* Dossier Form */}
            <div className="flex-1 md:pl-10 flex flex-col justify-center relative">
              
              {/* Simulated visual sticky note adhesive tape */}
              <div className="absolute -top-4 right-12 w-24 h-6 bg-yellow-200/20 border border-yellow-300/5 transform rotate-[-4deg] shadow-sm z-30 mix-blend-multiply pointer-events-none"></div>

              {/* Dossier Card body */}
              <div className="bg-[#e2c091] border border-[#b89b65] p-6 sm:p-8 shadow-[10px_10px_0px_rgba(26,26,26,0.9)] transform -rotate-1">
                
                <div className="border-b-2 border-stone-900 pb-2 mb-6 flex justify-between items-end">
                  <h2 className="font-serif uppercase text-xl sm:text-2xl font-black tracking-tight text-stone-900">
                    ACCESS CODE REQUEST
                  </h2>
                  <span className="font-mono text-[9px] text-[#f4ecd8] bg-[#1a1a1a] px-2 py-0.5 font-bold uppercase tracking-widest">
                    REQ_OTP
                  </span>
                </div>

                <form onSubmit={handleRequestOtp} className="flex flex-col gap-6">
                  
                  <div className="flex flex-col">
                    <label className="font-mono text-[10px] font-bold mb-2.5 uppercase text-stone-800 flex justify-between tracking-wide">
                      <span>OPERATIVE EMAIL IDENTIFICATION</span>
                      <span className="text-red-800">[RESTRICTED]</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="typewriter-field text-xl font-bold p-2 text-stone-950 placeholder-stone-600/40 outline-none"
                      placeholder="OPERATIVE@DEV.NEWS..."
                    />
                  </div>

                  {status !== "idle" && (
                    <div className={`p-3 text-center border-2 font-mono text-xs uppercase font-bold tracking-wider ${status === "error" ? "border-red-700 text-red-500 bg-red-950" : "border-stone-900 text-[#f4ecd8] bg-[#1a1a1a]"}`}>
                      {status === "loading" ? "INITIALIZING MAIN TRANSMITTER..." : message}
                    </div>
                  )}

                  <div className="mt-8 flex flex-col items-center">
                    <button 
                      type="submit" 
                      className="vintage-stamp w-full text-lg py-3 shadow-[4px_4px_0_rgba(26,26,26,0.9)] uppercase tracking-widest bg-transparent border-red-800 text-red-800 hover:bg-red-800 hover:text-white"
                      disabled={status === "loading"}
                    >
                      GENERATE TRANSIT CODE
                    </button>
                  </div>

                </form>
              </div>

            </div>

          </main>
        </div>
      </div>
    </div>
  );
}
