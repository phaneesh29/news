"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const res = await fetch("http://localhost:8000/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 cursor-crosshair">
      {/* CD-ROM Window Shell */}
      <div className="cd-rom-window w-full max-w-5xl z-10 animate-bounce-slight relative">
        <div className="cd-rom-titlebar">
          <span>C:\BUREAU\DEV_NEWS_INSTALLER.EXE</span>
          <button 
            onClick={() => router.push('/')}
            className="cursor-pointer bg-[#c0c0c0] text-black border border-white border-b-gray-800 border-r-gray-800 px-1 leading-none font-bold hover:bg-gray-300 active:border-b-white active:border-r-white active:border-t-gray-800 active:border-l-gray-800"
            title="Close Installer"
          >
            X
          </button>
        </div>
        
        {/* Torn Paper Overlaid on CD-ROM bg */}
        <div className="p-4 bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACAQMAAABIeJ9nAAAAA1BMVEUAAACnej3aAAAAAXRSTlMAQObYZgAAAAxJREFUCNdjYGBgAAAABAABJzQnCgAAAABJRU5ErkJggg==')]">
          
          <main className="torn-paper relative flex w-full flex-col p-8 sm:p-12 md:flex-row shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-20">
            
            {/* Newspaper Column */}
            <div className="flex-1 pr-0 md:pr-10 border-b-4 md:border-b-0 md:border-r-4 border-ink-faded mb-8 md:mb-0 pb-8 md:pb-0 relative">
              <div className="border-b-[8px] border-ink pb-2 mb-4">
                <h1 className="font-playfair text-6xl md:text-7xl font-black text-center tracking-tighter uppercase leading-[0.8] mb-2 transform -skew-x-6">
                  <span className="text-blood-red">HACKED</span><br/>CHRONICLE
                </h1>
              </div>
              
              <div className="bg-ink text-paper py-1 text-center font-vt323 text-lg tracking-widest uppercase mb-6 shadow-[-4px_4px_0_var(--color-blood-red)]">
                &gt;&gt; Y2K PANIC LEVEL: SEVERE &lt;&lt;
              </div>

              <div className="text-[15px] leading-tight text-justify indent-[20px] font-bold">
                <span className="font-old-standard text-6xl float-left pt-2 pr-2 text-blood-red">T</span>
                he millennium bug threatens to wipe the archives. You are holding a physical backup printed from the last surviving terminal in Bombay. 
                Enter your operative credentials in the attached dossier to initialize the analog handshake. 
              </div>
              
              <div className="mt-8 border-4 border-ink p-4 rotate-2 bg-paper-stain relative">
                <div className="absolute -top-3 -right-3 bg-blood-red text-paper font-bold px-2 py-1 transform rotate-12">URGENT</div>
                <img src="data:image/svg+xml;utf8,<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='40' stroke='black' stroke-width='3' fill='none'/><path d='M30,50 L70,50 M50,30 L50,70' stroke='black' stroke-width='3'/></svg>" className="w-16 h-16 mx-auto opacity-50 mix-blend-multiply" />
                <p className="font-courier text-center text-xs mt-2 uppercase font-black">Scan biometrics or insert key-disk</p>
              </div>
            </div>

            {/* Dossier Form */}
            <div className="flex-1 md:pl-10 flex flex-col justify-center relative">
              {/* Simulated Tape */}
              <div className="absolute -top-4 right-10 w-24 h-8 bg-[rgba(255,255,255,0.4)] transform rotate-[-5deg] shadow-sm z-30 mix-blend-screen"></div>

              <div className="bg-manila border-2 border-manila-dark p-8 shadow-[10px_10px_0_rgba(24,21,19,0.9)] transform -rotate-2">
                <div className="border-b-4 border-ink pb-2 mb-6 flex justify-between items-end">
                  <h2 className="font-old-standard uppercase text-3xl font-black tracking-tight text-ink">
                    CLEARANCE
                  </h2>
                  <span className="font-vt323 text-blood-red text-xl bg-ink px-2">AUTH_REQ</span>
                </div>

                <form onSubmit={handleRequestOtp} className="flex flex-col gap-6">
                  <div className="flex flex-col">
                    <label className="font-courier text-sm font-black mb-2 uppercase text-ink flex justify-between">
                      <span>Operative Email</span>
                      <span className="text-blood-red">[CONFIDENTIAL]</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="typewriter-input text-2xl font-bold p-2 bg-transparent border-b-4 border-ink border-dashed"
                      placeholder="CLASSIFIED@..."
                    />
                  </div>

                  {status !== "idle" && (
                    <div className={`p-4 text-center border-4 font-vt323 text-2xl uppercase ${status === "error" ? "border-blood-red text-blood-red bg-ink" : "border-ink text-paper bg-ink"}`}>
                      {status === "loading" ? "UPLOADING TO MAINFRAME..." : message}
                    </div>
                  )}

                  <div className="mt-8 flex flex-col items-center">
                    <button 
                      type="submit" 
                      className="stamp-button w-full text-2xl py-4 shadow-[5px_5px_0_var(--color-ink)]"
                      disabled={status === "loading"}
                    >
                      REQUEST OVERRIDE KEY
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
