"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "../../config";
import Link from "next/link";

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
        setMessage("Token Verified. Entering Dashboard...");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setStatus("error");
        const backendError = typeof data.error === "string" ? data.error : data.error?.message;
        setMessage(backendError || "Invalid Token. Access Denied.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Telegraph Disconnected. Cannot Verify.");
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center p-4 sm:p-8 relative selection:bg-black selection:text-white text-[#111111] font-serif">
      
      <div className="bg-[#fcfaf2] border border-[#d3c7b3] shadow-xl w-full max-w-4xl z-10 relative p-6 sm:p-10">
        
        {/* TOP METADATA ROW */}
        <div className="flex justify-between items-center text-xs sm:text-sm border-b-2 border-black pb-2 mb-4 font-bold uppercase tracking-widest">
          <span>"Identity Verification Process"</span>
          <span className="hidden sm:inline bg-black text-white px-2 py-0.5">SECURITY PROTOCOL A-1</span>
          <span>Clearance Check</span>
        </div>

        <main className="flex flex-col md:flex-row gap-8">
          
          {/* Main Input Column */}
          <div className="flex-1 border-b md:border-b-0 md:border-r border-black pb-6 md:pb-0 md:pr-8 relative">
            
            <div className="border-b-[4px] border-double border-black pb-4 mb-6">
              <span className="font-bold text-xs uppercase tracking-widest block mb-2 text-center">
                Dev Bits | Staff Requisition
              </span>
              <h1 className="font-['Playfair_Display',_Georgia,_serif] text-4xl sm:text-5xl font-black text-center tracking-tighter uppercase leading-[0.9] mb-2">
                ENTRY TOKEN <br/> REQUIRED
              </h1>
            </div>
            
            <div className="text-center font-bold text-sm tracking-wide mb-6">
              Operative Record: <span className="underline">{email}</span>
            </div>

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 relative z-10 w-full max-w-sm mx-auto">
              
              {/* Token Input */}
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-widest flex justify-between mb-2">
                  <span>6-Digit Telegraph Code</span>
                </label>
                <div className="border-[3px] border-black p-2 bg-[#f4edd8]">
                  <input
                    type="text"
                    required
                    pattern="\d{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-transparent border-none outline-none text-black font-mono text-4xl sm:text-5xl tracking-[0.35em] text-center placeholder-gray-400 font-black"
                    placeholder="000000"
                    autoFocus
                  />
                </div>
              </div>

              {/* Status Message */}
              <div className="min-h-[50px] flex items-center justify-center">
                {status !== "idle" && status !== "loading" && (
                  <div className={`p-3 text-center border-2 font-bold text-xs uppercase tracking-wider w-full ${status === "success" ? "border-black text-[#fcfaf2] bg-black" : "border-black text-black bg-gray-200"}`}>
                    {message}
                  </div>
                )}
                {status === "loading" && (
                  <div className="p-3 text-center border-2 border-black font-bold text-xs uppercase tracking-wider text-black bg-[#f4edd8] animate-pulse w-full">
                    Awaiting Wire Confirmation...
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full text-[#fcfaf2] bg-black border-2 border-black hover:bg-transparent hover:text-black text-sm py-4 uppercase tracking-widest font-black transition-colors duration-300"
                disabled={status === "loading" || otp.length < 6}
              >
                Submit Entry Token
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/login" className="text-xs uppercase tracking-widest border-b border-black hover:border-b-2 hover:font-bold transition-all">
                &lt; Return to Credentials Desk
              </Link>
            </div>
          </div>

          {/* Right Side: Regulations / Memo */}
          <div className="w-full md:w-[280px] flex flex-col justify-center gap-4 relative">
            
            <div className="border-[3px] border-black p-5 bg-[#fcfaf2] relative text-left shadow-[4px_4px_0px_#111111]">
              <h3 className="font-['Playfair_Display',_Georgia,_serif] font-black uppercase text-xl border-b-2 border-black pb-2 mb-4 tracking-tight">
                Verification Rules
              </h3>
              
              <ol className="text-xs font-bold space-y-4 list-decimal pl-4 pr-2">
                <li className="pl-1">
                  A telegram containing your 6-digit access token has been dispatched to your provided address.
                </li>
                <li className="pl-1">
                  Input the digits exactly as received. The mechanism will reject letters or special characters.
                </li>
                <li className="pl-1">
                  Tokens expire shortly after issuance. If delayed, you must requisition a new one.
                </li>
              </ol>

              <div className="mt-6 border-t border-dashed border-black pt-4">
                <span className="text-xs font-black uppercase block mb-1">
                  SECURITY ADVISORY
                </span>
                <p className="text-[11px] leading-relaxed">
                  Three consecutive failures to provide the correct token will result in a temporary suspension of your credentials pending an administrative review.
                </p>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-['Playfair_Display',_Georgia,_serif] text-[#111111] text-2xl animate-pulse">
        [ RETRIEVING DISPATCH CODE... ]
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
