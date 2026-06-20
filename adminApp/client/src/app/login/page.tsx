"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../config";
import Link from "next/link";

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
        setMessage(backendError || "Verification Failed. Consult the Chief Editor.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Telegraph Disconnected. Cannot Verify Credentials.");
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center p-4 sm:p-8 relative selection:bg-black selection:text-white text-[#111111] font-serif">
      
      <div className="bg-[#fcfaf2] border border-[#d3c7b3] shadow-xl w-full max-w-5xl z-10 relative p-6 sm:p-10">
        
        {/* TOP METADATA ROW */}
        <div className="flex justify-between items-center text-xs sm:text-sm border-b-2 border-black pb-2 mb-4 font-bold uppercase tracking-widest">
          <span>"Internal Administrative Control"</span>
          <span className="hidden sm:inline bg-black text-white px-2 py-0.5">STAFF & EDITORS ONLY</span>
          <span>{today}</span>
        </div>

        <main className="flex flex-col md:flex-row gap-8">
          
          {/* Newspaper Column */}
          <div className="flex-1 border-b md:border-b-0 md:border-r border-black pb-6 md:pb-0 md:pr-8 relative">
            
            <div className="border-b-[4px] border-double border-black pb-4 mb-4">
              <span className="font-bold text-xs uppercase tracking-widest block mb-2 text-center">
                Dev Bits | Staff Requisition
              </span>
              <h1 className="font-['Playfair_Display',_Georgia,_serif] text-4xl sm:text-5xl font-black text-center tracking-tighter uppercase leading-[0.9] mb-2">
                CREDENTIAL <br/> VERIFICATION
              </h1>
            </div>
            
            <div className="bg-[#f4edd8] border-y-2 border-black py-1 text-center font-bold text-xs tracking-widest uppercase mb-6">
              Official Directive: Required Access Procedure
            </div>

            <div className="columns-1 gap-6 text-justify text-[15px] leading-relaxed">
              <p className="mb-4">
                <span className="float-left text-5xl leading-[0.8] font-['Playfair_Display',_Georgia,_serif] font-black pr-2 pt-1">P</span>ursuant to the latest security decrees from the Publisher's office, all active journalists and managing editors must file a requisition to access the central typesetting and administrative dashboard.
              </p>
              <p className="mb-4">
                Your credentials must be verified through the standard postal or telegraphic routes (Email Authentication). Providing your recognized staff address will prompt the dispatch of a single-use entry token.
              </p>
              <p className="mb-4">
                Attempts to falsify credentials or access the archives without an explicit mandate will be reported to the oversight board immediately.
              </p>
            </div>
            
            {/* Graphic */}
            <div className="mt-8 border-2 border-dashed border-black p-4 bg-[#f4edd8] relative max-w-[300px] mx-auto text-center">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#fcfaf2] border border-black font-bold text-[10px] px-2 py-0.5 uppercase tracking-widest">
                Official Stamp
              </div>
              <div className="w-16 h-16 mx-auto mt-2 mb-2 flex items-center justify-center border-[3px] border-black rounded-full p-1 opacity-80">
                <div className="w-full h-full border border-black rounded-full flex items-center justify-center font-['Playfair_Display',_Georgia,_serif] font-black text-2xl">
                  DB
                </div>
              </div>
              <p className="text-xs uppercase font-bold tracking-wider">
                Dev Bits Publication
                <br/>
                <span className="text-[10px] font-normal italic">Established 2026</span>
              </p>
            </div>
          </div>

          {/* Dossier Form */}
          <div className="flex-1 flex flex-col justify-center relative md:pl-4 max-w-md w-full mx-auto">

            <div className="border-[3px] border-black p-6 sm:p-8 bg-[#fcfaf2] relative shadow-[6px_6px_0px_#111111]">
              
              <div className="border-b-2 border-black pb-3 mb-6 flex justify-between items-end">
                <h2 className="font-['Playfair_Display',_Georgia,_serif] uppercase text-2xl font-black tracking-tight">
                  Editor's Pass
                </h2>
                <span className="text-xs border border-black px-2 py-0.5 font-bold uppercase tracking-widest bg-black text-[#fcfaf2]">
                  FORM 2A
                </span>
              </div>

              <form onSubmit={handleRequestOtp} className="flex flex-col gap-6 relative z-10">
                
                <div className="flex flex-col text-left">
                  <label className="text-xs font-bold mb-2 uppercase flex justify-between tracking-wide">
                    <span>Staff Email Address</span>
                    <span className="italic font-normal">*Required</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg font-bold p-2 text-black placeholder-gray-400 outline-none border-b-[3px] border-dashed border-black focus:border-solid font-serif bg-transparent"
                    placeholder="editor@devbits.news"
                  />
                </div>

                {status !== "idle" && (
                  <div className={`p-3 text-center border-2 font-bold text-xs uppercase tracking-wider ${status === "error" ? "border-black text-black bg-gray-200" : "border-black text-[#fcfaf2] bg-black"}`}>
                    {status === "loading" ? "Dispatching Telegram..." : message}
                  </div>
                )}

                <div className="mt-6 flex flex-col items-center">
                  <button 
                    type="submit" 
                    className="w-full text-[#fcfaf2] bg-black hover:bg-transparent hover:text-black border-2 border-black text-sm py-4 uppercase tracking-widest font-black transition-colors duration-300"
                    disabled={status === "loading"}
                  >
                    Request Entry Token
                  </button>
                  
                  <Link href="/" className="text-xs uppercase tracking-widest mt-6 border-b border-black hover:border-b-2 hover:font-bold transition-all">
                    Return to Front Page
                  </Link>
                </div>

              </form>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
}
