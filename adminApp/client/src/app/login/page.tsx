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
 setMessage(backendError || "TRANSMISSION FAILED. ERROR OVERRIDE.");
 }
 } catch (err) {
 setStatus("error");
 setMessage("FATAL ERROR: WIRE DECK DISCONNECTED");
 }
 };

 return (
 <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center p-4 sm:p-8 relative selection:bg-red-800/10 selection:text-red-950 text-stone-900 font-serif">
 
 {/* Newspaper grid desk mat */}

 {/* Main Newspaper Window Shell */}
 <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 w-full max-w-5xl z-10 relative p-4 ">
 
 {/* Window Content */}
 <div className="p-2 sm:p-4">
 
 <main className="bg-[#fcfaf2] relative flex w-full flex-col p-6 sm:p-10 md:p-12 md:flex-row z-20">
 
 {/* Coffee ring stain details */}
 <div className="coffee-stain top-6 left-12 opacity-50 rotate-[40deg]"></div>

 {/* Newspaper Column */}
 <div className="flex-1 pr-0 md:pr-10 border-b-4 md:border-b-0 md:border-r-2 border-stone-950 mb-8 md:mb-0 pb-8 md:pb-0 relative text-stone-900">
 
 <div className="border-b-4 border-double border-stone-950 pb-2.5 mb-4">
 <span className="font-mono text-[9px] text-stone-600 font-bold uppercase tracking-wider block mb-1">
 BOMBAY TELEGRAPH | EDITORIAL AUTH
 </span>
 <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-black text-center tracking-tighter uppercase leading-[0.85] mb-2 -skew-x-2 text-stone-950">
 <span className="text-red-800">BREACH</span> REPORT
 </h1>
 </div>
 
 <div className="bg-stone-950 text-[#fcfaf2] py-1 text-center font-mono text-[10px] tracking-widest uppercase mb-6 font-bold">
 PANIC STATE: LEVEL OMEGA
 </div>

 <div className="text-[14px] leading-relaxed text-justify font-serif text-stone-900">
 The mainframe database has quarantined access keys following unauthorized queries in the Bombay sector. Operational terminals have fallback mechanisms activated. 
 <br/><br/>
 Operatives must enter a registered email address in the attached clearance folder to request a cryptographic override code. Failing to input coordinates will trigger local telemetry wipes.
 </div>
 
 {/* Graphic */}
 <div className="mt-8 border-2 border-stone-950 p-4 bg-[#f5f2e9] relative max-w-[280px] mx-auto">
 <div className="absolute -top-3.5 -right-2 bg-red-850 text-[#fcfaf2] font-mono text-[9px] font-bold px-2 py-0.5 uppercase">
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
 <p className="font-mono text-center text-[9px] mt-2 uppercase font-black tracking-wider text-stone-850">
 DECRYPTION MODULE SYNCED
 </p>
 </div>
 </div>

 {/* Dossier Form */}
 <div className="flex-1 md:pl-10 flex flex-col justify-center relative">

 {/* Dossier Card body */}
 <div className="bg-[#f4edd8] border-2 border-stone-950 p-6 sm:p-8 vintage-shadow-lg relative overflow-hidden">
 
 {/* Coffee stain on card */}
 <div className="coffee-stain -bottom-8 -right-8 opacity-35 rotate-[20deg]"></div>

 <div className="border-b-2 border-stone-950 pb-2 mb-6 flex justify-between items-end">
 <h2 className="font-playfair uppercase text-xl sm:text-2xl font-black tracking-tight text-stone-950">
 ACCESS CODE
 </h2>
 <span className="font-mono text-[9px] text-[#fcfaf2] bg-stone-950 px-2 py-0.5 font-bold uppercase tracking-widest">
 REQ_OTP
 </span>
 </div>

 <form onSubmit={handleRequestOtp} className="flex flex-col gap-6 relative z-10">
 
 <div className="flex flex-col text-left">
 <label className="font-mono text-[10px] font-bold mb-2.5 uppercase text-stone-700 flex justify-between tracking-wide">
 <span>OPERATIVE EMAIL IDENTIFICATION</span>
 <span className="text-red-800">[RESTRICTED]</span>
 </label>
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 className="typewriter-field text-xl font-bold p-2 text-stone-950 placeholder-stone-650/40 outline-none border-b-2 border-dashed border-stone-950 focus:border-solid font-serif bg-transparent"
 placeholder="operative@dev.news..."
 />
 </div>

 {status !== "idle" && (
 <div className={`p-3 text-center border-2 font-mono text-xs uppercase font-bold tracking-wider ${status === "error" ? "border-red-700 text-red-700 bg-red-50" : "border-stone-950 text-[#fcfaf2] bg-stone-950"}`}>
 {status === "loading" ? "INITIALIZING MAIN WIRE FEED..." : message}
 </div>
 )}

 <div className="mt-8 flex flex-col items-center">
 <button 
 type="submit" 
 className="vintage-stamp w-full text-[#fcfaf2] bg-red-850 hover:bg-red-950 border-red-950 text-lg py-3 uppercase tracking-widest font-black"
 disabled={status === "loading"}
 >
 SEND ACCESS CODE
 </button>
 
 <Link href="/" className="font-mono text-[10px] text-stone-600 uppercase tracking-widest mt-4 hover:underline font-bold">
 &lt; Back to Archives
 </Link>
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







