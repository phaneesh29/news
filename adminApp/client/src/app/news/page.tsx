"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewsPageRedirect() {
 const router = useRouter();

 useEffect(() => {
 router.replace("/dashboard");
 }, [router]);

 return (
 <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-playfair text-stone-900 text-2xl animate-pulse">
 [ REDIRECTING TO CORE WIRE FEED... ]
 </div>
 );
}



