"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
      const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
        credentials: "include",
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("CLEARANCE GRANTED. ARCHIVES MOUNTED.");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setStatus("error");
        const backendError = typeof data.error === "string" ? data.error : data.error?.message;
        setMessage(backendError || "INVALID KEY.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("FATAL: NEURAL LINK SEVERED");
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#b5b5b5] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjYjViNWI1Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjYTNhM2EzIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] overflow-hidden cursor-crosshair relative">
      
      {/* Background Chaos Elements */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-black border-4 border-cyber-cyan rotate-[15deg] opacity-60 p-4 shadow-2xl pointer-events-none">
        <h2 className="text-cyber-cyan font-vt323 text-5xl glitch-text" data-text="INTERCEPTED">INTERCEPTED</h2>
      </div>
      <div className="absolute bottom-10 right-10 md:right-20 w-80 bg-white border-2 border-black -rotate-6 shadow-[10px_10px_0_rgba(0,0,0,0.8)] p-4 z-0 pointer-events-none">
        <h2 className="font-playfair font-black text-2xl uppercase border-b-4 border-black mb-2">Notice of Decryption</h2>
        <p className="font-serif text-sm font-bold">Target sector locked. Authorization requires 6-digit cryptographic handshake. Failure to verify will result in immediate localized wipe.</p>
      </div>

      {/* Main Window Shell */}
      <div className="w-full max-w-4xl z-10 shadow-[15px_15px_0_rgba(0,0,0,0.9)] animate-bounce-slight relative border-2 border-white border-b-black border-r-black bg-[#c0c0c0]">
        
        {/* Titlebar */}
        <div className="bg-[#000080] text-white font-bold p-1 flex justify-between items-center border-b-2 border-black">
          <span className="font-vt323 text-xl tracking-widest pl-2 flex items-center gap-2">
             <div className="w-3 h-3 bg-white animate-pulse"></div>
             A:\CRACKER\BRUTEFORCE_V9.EXE
          </span>
          <button 
            onClick={() => router.push('/login')}
            className="cursor-pointer bg-[#c0c0c0] text-black border-2 border-white border-b-gray-800 border-r-gray-800 px-2 leading-none font-bold hover:bg-gray-300 active:border-b-white active:border-r-white active:border-t-gray-800 active:border-l-gray-800"
            title="Close"
          >
            X
          </button>
        </div>
        
        <div className="p-4 md:p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjIiPgo8cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSIyIiBmaWxsPSIjYzBjMGMwIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNhMGEwYTAiPjwvcmVjdD4KPC9zdmc+')]">
          
          {/* Hardware Decryptor Module */}
          <div className="flex-1 bg-[#111] border-[8px] border-gray-800 border-t-gray-600 border-l-gray-600 shadow-2xl p-4 md:p-6 relative">
             
             {/* CRT Screen inside Hardware */}
             <div className="bg-[#050505] border-4 border-[#000] p-4 h-full relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,240,255,0.2)] crt-flicker">
                {/* Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none"></div>
                
                <div className="text-center relative z-10 mb-6">
                  <h2 className="font-vt323 text-cyber-cyan text-4xl md:text-5xl glitch-text" data-text="ENTER CIPHER">ENTER CIPHER</h2>
                  <div className="mt-2 font-courier text-white font-bold text-xs md:text-sm bg-cyber-cyan/30 inline-block px-3 py-1 border border-cyber-cyan">
                    TGT_ID: {email}
                  </div>
                </div>

                <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 relative z-10 w-full max-w-sm mx-auto">
                  
                  {/* Digital Input */}
                  <div className="bg-black border-2 border-cyber-cyan p-3 shadow-[0_0_20px_rgba(0,240,255,0.4)] relative">
                    <input
                      type="text"
                      required
                      pattern="\d{6}"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-transparent border-none outline-none text-cyber-cyan font-vt323 text-5xl md:text-6xl tracking-[0.4em] text-center placeholder-cyber-cyan/30 focus:drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                      placeholder="------"
                      autoFocus
                    />
                  </div>

                  {/* Status */}
                  <div className="min-h-[60px] flex items-center justify-center">
                    {status !== "idle" && status !== "loading" && (
                      <div className={`p-2 text-center border-2 font-vt323 text-xl uppercase w-full ${status === "success" ? "border-cyber-green text-cyber-green bg-black" : "border-red-500 text-red-500 bg-black"}`}>
                        {message}
                      </div>
                    )}
                    {status === "loading" && (
                      <div className="p-2 text-center border-2 font-vt323 text-xl uppercase border-cyber-cyan text-black bg-cyber-cyan animate-pulse w-full shadow-[0_0_15px_rgba(0,240,255,0.6)]">
                        &gt;&gt; CRACKING...
                      </div>
                    )}
                  </div>

                  {/* Cyber Stamp Button */}
                  <button 
                    type="submit" 
                    className="font-old-standard font-black text-2xl md:text-3xl uppercase text-black bg-cyber-cyan border-[4px] border-black py-4 w-full transform rotate-1 shadow-[5px_5px_0_#000] hover:rotate-0 hover:scale-[1.02] hover:bg-white hover:text-black transition-all mt-2"
                    disabled={status === "loading" || otp.length < 6}
                  >
                    OVERRIDE LOCK
                  </button>
                </form>
             </div>
          </div>

          {/* Right Side: Dossier / Instructions */}
          <div className="w-full md:w-1/3 flex flex-col gap-6 justify-center">
             <div className="bg-[#fff5e6] text-black p-5 border-2 border-black shadow-[6px_6px_0_#000] transform rotate-3 relative z-10">
                <h3 className="font-playfair font-black uppercase text-2xl border-b-4 border-black mb-4">Protocol</h3>
                <ul className="font-courier text-base font-bold space-y-3">
                  <li>1. Check designated dead-drop.</li>
                  <li>2. Retrieve 6-digit cypher.</li>
                  <li>3. Input exactly. No mistakes.</li>
                </ul>
                <div className="mt-6 border-t-4 border-dashed border-black pt-3">
                  <span className="font-vt323 text-red-600 text-3xl font-bold animate-pulse">WARNING:</span>
                  <p className="font-serif text-sm font-bold mt-1">3 failed attempts will trigger IP backtrace.</p>
                </div>
             </div>

             {/* Chaotic sticker/stamp */}
             <div className="self-end transform -rotate-12 border-[6px] border-red-600 text-red-600 font-old-standard font-black text-4xl px-3 py-1 shadow-xl bg-transparent opacity-90 z-20">
               TOP SECRET
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-vt323 text-cyber-alert bg-cyber-black text-4xl animate-pulse">BOOTING_DECRYPTER...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
