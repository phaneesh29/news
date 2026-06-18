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
 setMessage("CLEARANCE GRANTED. LOGGING IN...");
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
 setMessage("FATAL ERROR: WIRE LINK DOWN");
 }
 };

 if (!email) return null;

 return (
 <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center p-4 relative overflow-hidden font-serif text-stone-900">
 
 {/* Newspaper grid desk mat */}
 
 {/* Background Decoded Chaos elements */}
 <div className="absolute top-10 left-10 w-64 h-32 bg-[#fcfaf2] border-2 border-stone-950 rotate-[8deg] opacity-40 p-4 shadow shadow-stone-400 pointer-events-none hidden lg:block text-left">
 <h2 className="text-stone-950 font-playfair text-xl tracking-tighter font-black">[WIRE INTERCEPT]</h2>
 <div className="font-mono text-[10px] text-stone-600 mt-2">
 PACKETS LOGGED: 42,940<br/>
 WIRE INTEGRITY: 99.88%
 </div>
 </div>
 
 <div className="absolute bottom-10 right-10 w-80 bg-[#fcfaf2] border-4 border-double border-stone-950 p-5 z-0 pointer-events-none hidden lg:block text-stone-900 text-left">
 <div className="absolute -top-3 right-4 bg-red-800 text-[#fcfaf2] font-mono text-[9px] font-bold px-2 py-0.5 uppercase">
 TELEGRAM
 </div>
 <h2 className="font-playfair font-black text-lg uppercase border-b-2 border-stone-900 mb-2">WIRE DESK ALERT</h2>
 <p className="font-serif text-[11px] leading-normal">
 Operatives are advised that three failed decryption entries will lock target credentials. Security decks will log IP traces for local enforcement dispatch.
 </p>
 </div>

 {/* Main Newspaper Shell */}
 <div className="w-full max-w-4xl z-10 bg-[#fcfaf2] border-4 border-double border-stone-950 p-4 relative">
 
 {/* Main Panel Content */}
 <div className="p-2 sm:p-4 bg-[#fcfaf2]">
 <div className="flex flex-col md:flex-row gap-6">
 
 {/* Left Side: Decrypter Screen (Light Teletype window) */}
 <div className="flex-1 bg-[#f5f2e9] border-2 border-stone-950 p-4 sm:p-6 relative">
 
 <div className="p-4 sm:p-6 h-full relative overflow-hidden text-center">
 
 <div className="relative z-10 mb-6">
 <h2 className="font-playfair text-stone-950 text-2xl sm:text-3xl font-black uppercase tracking-tight">
 DECRYPT CODES
 </h2>
 <div className="mt-2 font-mono text-stone-700 text-[10px] bg-[#dcd7c9]/50 inline-block px-3 py-1 border border-stone-300">
 OPERATIVE: {email}
 </div>
 </div>

 <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 relative z-10 w-full max-w-xs mx-auto">
 
 {/* Digital Code Input */}
 <div className="green-terminal scanline relative overflow-hidden p-4 shadow-sm">
 <input
 type="text"
 required
 pattern="\d{6}"
 maxLength={6}
 value={otp}
 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
 className="w-full bg-transparent border-none outline-none text-[#44ee77] font-mono text-4xl sm:text-5xl tracking-[0.35em] text-center placeholder-[#1c883e]/30 font-black"
 placeholder="000000"
 autoFocus
 />
 </div>

 {/* Telemetry Status Message */}
 <div className="min-h-[50px] flex items-center justify-center">
 {status !== "idle" && status !== "loading" && (
 <div className={`p-2 text-center border font-mono text-[10px] uppercase font-bold tracking-wider w-full ${status === "success" ? "border-green-800 text-green-800 bg-green-50" : "border-red-700 text-red-750 bg-red-50"}`}>
 {message}
 </div>
 )}
 {status === "loading" && (
 <div className="p-2 text-center border-2 border-stone-950 font-mono text-[10px] uppercase text-[#fcfaf2] bg-stone-950 animate-pulse w-full font-bold tracking-widest">
 VERIFYING TELEGRAPHS...
 </div>
 )}
 </div>

 {/* Main Overriding Button */}
 <button 
 type="submit" 
 className="vintage-stamp w-full py-3.5 bg-red-800 text-[#fcfaf2] border-red-950 hover:bg-red-950 text-xs font-black"
 disabled={status === "loading" || otp.length < 6}
 >
 OVERRIDE DECK LOCK
 </button>
 </form>
 </div>
 </div>

 {/* Right Side: Stapled Paper memo (Tactile Protocol Document) */}
 <div className="w-full md:w-[280px] flex flex-col justify-center gap-4 relative">
 
 {/* Stapled document page */}
 <div className="bg-[#f4edd8] text-stone-900 p-5 border-2 border-stone-950 relative z-10-sm text-left vintage-shadow">
 
 {/* Stains */}
 <div className="coffee-stain top-2 right-2 w-16 h-16 opacity-30"></div>
 
 {/* staple visual */}
 <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-stone-400 border border-stone-600/30-sm z-30"></div>

 <h3 className="font-playfair font-black uppercase text-base border-b-2 border-stone-950 mb-3 tracking-tight">
 WIRE PROTOCOLS
 </h3>
 
 <ul className="font-mono text-[9.5px] font-bold space-y-2.5 text-stone-700">
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
 <span>Access logs and overrides will execute automatically.</span>
 </li>
 </ul>

 <div className="mt-5 border-t border-dashed border-stone-400 pt-3">
 <span className="font-mono text-[9px] text-red-800 font-bold uppercase block animate-pulse">
 ALERT LEVEL STATUS:
 </span>
 <p className="font-serif text-[10.5px] mt-1 text-stone-600 leading-normal">
 Decryption tunnel is monitored under secure protocol. System logs IP coordinates.
 </p>
 </div>
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
 <Suspense fallback={
 <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-playfair text-stone-900 text-2xl animate-pulse">
 [ RETRIEVING DISPATCH CODE... ]
 </div>
 }>
 <VerifyContent />
 </Suspense>
 );
}








