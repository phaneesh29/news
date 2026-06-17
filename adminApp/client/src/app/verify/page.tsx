"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../config";

function VerifyContent() {
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("CLEARANCE GRANTED. ACCESS SECURED.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setStatus("error");
        const backendError = typeof data.error === "string" ? data.error : data.error?.message;
        setMessage(backendError || "DECRYPTION CODE INVALID.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("FATAL ERROR: NEURAL SYSTEM DOWN");
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen w-screen bg-[#060608] desk-mat flex items-center justify-center p-4 relative overflow-hidden cursor-crosshair font-mono">
      
      {/* Background Decoded Chaos elements */}
      <div className="absolute top-10 left-10 w-64 h-32 bg-black/60 border border-cyan-500/30 rotate-[8deg] opacity-40 p-4 shadow-2xl pointer-events-none hidden lg:block">
        <h2 className="text-cyan-400 font-mono text-2xl tracking-widest animate-pulse font-bold">[INTERCEPTING_GRID]</h2>
        <div className="text-[10px] text-zinc-500 mt-2">
          PACKETS SNIFFED: 42,940<br/>
          NODE SECURE LEVEL: 0.12%
        </div>
      </div>
      
      <div className="absolute bottom-10 right-10 w-80 bg-[#f4ecd8] border-2 border-stone-800 -rotate-3 shadow-[12px_12px_0_rgba(0,0,0,0.85)] p-5 z-0 pointer-events-none hidden lg:block text-stone-900">
        <div className="absolute -top-3 right-4 bg-red-800 text-stone-200 font-mono text-[9px] font-bold px-2 py-0.5 transform rotate-6 uppercase">
          TELEGRAM
        </div>
        <h2 className="font-serif font-black text-xl uppercase border-b-2 border-stone-900 mb-2">INTELLIGENCE ALERT</h2>
        <p className="font-serif text-[11px] font-bold leading-normal">
          Operatives are advised that 3 failed decryption entries will lock target credentials. Security decks will log IP traces for local enforcement dispatch.
        </p>
      </div>

      {/* Main CD-ROM Window Shell */}
      <div className="w-full max-w-4xl z-10 shadow-[15px_15px_0_rgba(0,0,0,0.7)] cd-rom-window animate-bounce-slight relative">
        
        {/* Titlebar */}
        <div className="cd-rom-titlebar select-none">
          <span className="font-mono text-xs font-bold tracking-widest pl-2 flex items-center gap-2">
             <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
             A:\DECRYPT\KEY_DECK_V2.EXE
          </span>
          <button 
            onClick={() => router.push('/login')}
            className="cursor-pointer bg-[#d4d0c8] text-black border border-white border-b-zinc-700 border-r-zinc-700 px-2 py-0.5 leading-none font-bold text-xs hover:bg-zinc-200"
            title="Close"
          >
            X
          </button>
        </div>
        
        {/* Main Panel Content */}
        <div className="p-4 sm:p-6 bg-[#d4d0c8] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZDRkMGM4Ii8+CjxwYXRoIGQ9Ik0wIDBoMnYySDB6bTIgMmgydjJIMnoiIGZpbGw9IiNhMGExYTMiIGZpbGwtb3BhY2l0eT0iLjE1Ii8+Cjwvc3ZnPg==')]">
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Left Side: Decrypter Screen (Cyber CRT) */}
            <div className="flex-1 bg-[#111115] border-[6px] border-zinc-700 border-t-zinc-500 border-l-zinc-500 shadow-2xl p-4 sm:p-6 relative">
               
               {/* CRT Screen Panel */}
               <div className="cyber-console p-4 sm:p-6 h-full relative overflow-hidden rounded-md">
                  
                  {/* Sweep scanline */}
                  <div className="scanline-sweep absolute top-0 left-0 right-0 pointer-events-none z-20"></div>
                  
                  <div className="text-center relative z-10 mb-6">
                    <h2 className="font-mono text-cyan-400 text-2xl sm:text-3xl font-black uppercase tracking-wider glitch-text" data-text="DECRYPT CIPHER">
                      DECRYPT CIPHER
                    </h2>
                    <div className="mt-2 font-mono text-white text-[10px] bg-cyan-950/40 inline-block px-3 py-1 border border-cyan-800/40">
                      OPERATIVE: {email}
                    </div>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 relative z-10 w-full max-w-xs mx-auto">
                    
                    {/* Digital Code Input */}
                    <div className="bg-black/90 border-2 border-cyan-500 p-4 shadow-[0_0_20px_rgba(0,240,255,0.25)] relative rounded">
                      <input
                        type="text"
                        required
                        pattern="\d{6}"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-transparent border-none outline-none text-cyan-400 font-mono text-4xl sm:text-5xl tracking-[0.35em] text-center placeholder-cyan-900 focus:drop-shadow-[0_0_8px_rgba(0,240,255,0.7)] font-black"
                        placeholder="------"
                        autoFocus
                      />
                    </div>

                    {/* Telemetry Status Message */}
                    <div className="min-h-[50px] flex items-center justify-center">
                      {status !== "idle" && status !== "loading" && (
                        <div className={`p-2 text-center border font-mono text-[10px] uppercase font-bold tracking-wider w-full ${status === "success" ? "border-emerald-500 text-emerald-400 bg-emerald-950/20" : "border-red-600 text-red-400 bg-red-950/20"}`}>
                          {message}
                        </div>
                      )}
                      {status === "loading" && (
                        <div className="p-2.5 text-center border font-mono text-[10px] uppercase border-cyan-500 text-black bg-cyan-400 animate-pulse w-full font-bold tracking-widest">
                          &gt;&gt; BRUTEFORCING MAIN ACCESS DECK...
                        </div>
                      )}
                    </div>

                    {/* Main Overriding Button */}
                    <button 
                      type="submit" 
                      className="w-full font-mono font-black text-sm uppercase text-black bg-cyan-400 border-2 border-cyan-500 py-3.5 rounded hover:bg-white hover:text-black transition-all duration-300 shadow-[0_4px_12px_rgba(0,240,255,0.2)]"
                      disabled={status === "loading" || otp.length < 6}
                    >
                      OVERRIDE MAINFRAME LOCK
                    </button>
                  </form>
               </div>
            </div>

            {/* Right Side: Stapled Paper memo (Tactile Protocol Document) */}
            <div className="w-full md:w-[280px] flex flex-col justify-center gap-4 relative">
               
               {/* Stapled document page */}
               <div className="bg-[#f2efe6] text-stone-900 p-5 border border-stone-400/80 shadow-[6px_6px_0px_rgba(26,26,26,0.9)] transform rotate-2 relative z-10 rounded-sm">
                  
                  {/* Stains */}
                  <div className="coffee-stain top-2 right-2 w-16 h-16 opacity-30"></div>
                  
                  {/* staple visual */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-stone-500/40 border border-stone-600/30 transform rotate-1 rounded-sm z-30"></div>

                  <h3 className="font-serif font-black uppercase text-lg border-b-2 border-stone-900 mb-3 tracking-tight">
                    DECRYPT PROTOCOL
                  </h3>
                  
                  <ul className="font-mono text-[10px] font-bold space-y-2.5 text-stone-700">
                    <li className="flex gap-2">
                      <span className="text-red-800">1.</span>
                      <span>Retrieve 6-digit key from your registered email account.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-800">2.</span>
                      <span>Insert code exactly. System rejects non-numeric payloads.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-red-800">3.</span>
                      <span>Handshake will execute automatically upon verification.</span>
                    </li>
                  </ul>

                  <div className="mt-5 border-t border-dashed border-stone-400 pt-3">
                    <span className="font-mono text-xs text-red-800 font-bold uppercase block animate-pulse">
                      ALERT LEVEL STATUS:
                    </span>
                    <p className="font-serif text-[11px] font-bold mt-1 text-stone-600">
                      Decryption tunnel is monitored under secure protocol. System logs IP coordinates.
                    </p>
                  </div>
               </div>

               {/* Red Top Secret ink stamp */}
               <div className="self-end transform -rotate-12 border-4 border-red-700/80 text-red-700/80 font-serif font-black text-2xl px-4 py-1.5 shadow bg-transparent opacity-85 z-20 select-none">
                 TOP SECRET
               </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-mono text-cyan-400 bg-cyber-black text-xl animate-pulse">&gt; MOUNTING DECRYPTION INTERFACE...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
