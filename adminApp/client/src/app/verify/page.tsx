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
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setStatus("success");
        setMessage("CLEARANCE GRANTED. ARCHIVES MOUNTED.");
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
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 cursor-crosshair">
      <div className="w-full max-w-3xl border-4 border-cyber-alert p-2 relative bg-cyber-black shadow-[0_0_100px_rgba(255,0,60,0.5)]">
        
        {/* Terminal Header */}
        <div className="bg-cyber-alert text-white px-4 py-1 font-vt323 text-xl tracking-widest flex justify-between uppercase">
          <span className="font-bold">DECRYPTION_PROTOCOL_ACTIVE</span>
          <span className="animate-pulse">_WAITING</span>
        </div>
        
        <main className="p-8 border-4 border-double border-cyber-alert mt-2 relative overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDUwNTA1Ij48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9InJnYmEoMjU1LCAwLCA2MCwgMC4xKSI+PC9yZWN0Pgo8L3N2Zz4=')]">
          
          <div className="text-center mb-10 relative z-10">
            <h1 
              className="font-vt323 text-6xl md:text-8xl text-cyber-alert glitch-text uppercase tracking-tighter"
              data-text="INPUT_KEY"
            >
              INPUT_KEY
            </h1>
            <p className="font-courier text-cyber-green mt-4 bg-black inline-block px-4 py-2 border border-cyber-green-dim font-bold">
              TARGET_ID: {email.toUpperCase()}
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 max-w-md mx-auto relative z-10">
            <div className="bg-cyber-black p-6 border-4 border-cyber-alert shadow-[inset_0_0_20px_rgba(255,0,60,0.3)] relative">
              <input
                type="text"
                required
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-transparent border-none outline-none text-cyber-alert font-vt323 text-7xl tracking-[0.3em] text-center"
                placeholder="------"
                autoFocus
              />
            </div>

            {status !== "idle" && status !== "loading" && (
              <div className={`p-4 text-center border-4 font-vt323 text-2xl uppercase ${status === "success" ? "border-cyber-green text-cyber-green bg-black" : "border-cyber-alert text-cyber-alert bg-black"}`}>
                {message}
              </div>
            )}
            
            {status === "loading" && (
              <div className="p-4 text-center border-4 font-vt323 text-2xl uppercase border-cyber-alert text-black bg-cyber-alert animate-pulse">
                &gt;&gt; BRUTEFORCING CIPHER...
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4">
              <button 
                type="submit" 
                className="bg-cyber-alert text-black font-vt323 text-3xl py-4 border-2 border-cyber-alert hover:bg-black hover:text-cyber-alert transition-colors uppercase tracking-widest"
                disabled={status === "loading" || otp.length < 6}
              >
                [ EXECUTE DECRYPTION ]
              </button>
              
              <button 
                type="button"
                onClick={() => router.push("/login")}
                className="font-vt323 text-xl hover:text-cyber-alert transition-colors text-center text-cyber-green-dim underline"
                disabled={status === "loading"}
              >
                &lt; ABORT HANDSHAKE
              </button>
            </div>
          </form>

        </main>
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
