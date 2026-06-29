"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Globe, Shield, Server, Activity, Database, AlertCircle } from "lucide-react";
import { useSession, signIn } from "@/lib/auth-client";
import { resolveDnsApi, fetchWhoisApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function DnsResolver() {
  const { data: sessionData, isPending } = useSession();
  const activeUser = sessionData?.user;

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [dnsData, setDnsData] = useState<any>(null);
  const [whoisData, setWhoisData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);
    setDnsData(null);
    setWhoisData(null);

    try {
      const [dnsRes, whoisRes] = await Promise.allSettled([
        resolveDnsApi(domain.trim(), "ALL"),
        fetchWhoisApi(domain.trim())
      ]);

      if (dnsRes.status === "fulfilled" && dnsRes.value.status === "success") {
        setDnsData(dnsRes.value.data);
      } else if (dnsRes.status === "rejected") {
        setError(dnsRes.reason.message || "Failed to resolve DNS");
      }

      if (whoisRes.status === "fulfilled" && whoisRes.value.status === "success") {
        setWhoisData(whoisRes.value.data);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isPending && !activeUser) {
    return (
      <div className="min-h-screen bg-background text-foreground newspaper-theme-layout p-4 sm:p-8 font-newspaper flex items-center justify-center">
        <div className="border-4 border-dashed border-[#e6dfd8] bg-[#efe9de]/10 p-12 text-center vintage-shadow max-w-xl">
          <Shield className="h-12 w-12 mx-auto mb-4 text-[#cc785c]" />
          <h2 className="font-blackletter text-3xl mb-4">Restricted Tool Access</h2>
          <p className="font-mono text-sm opacity-80 mb-8">
            The advanced DNS and WHOIS resolver requires identity verification.
          </p>
          <Button 
            onClick={() => signIn.social({ provider: "google", callbackURL: window.location.origin + "/tools/dns-resolver" })}
            className="bg-[#cc785c] hover:bg-[#a9583e] text-white border-2 border-[#111111] font-bold rounded-none"
          >
            Authenticate via Google
          </Button>
        </div>
      </div>
    );
  }

  const renderDnsRecords = (recordsObj: any) => {
    if (!recordsObj) return null;
    const types = Object.keys(recordsObj);
    if (types.length === 0) return <p className="font-mono text-xs opacity-70 p-4 border border-dashed border-current">No records found.</p>;

    return (
      <div className="space-y-6">
        {types.map(type => (
          <div key={type} className="border-2 border-current bg-[#fcfaf2] dark:bg-[#252320] p-4 vintage-shadow-sm">
            <h4 className="font-blackletter text-xl mb-3 flex items-center gap-2 border-b-2 border-current pb-2">
              <Server className="h-4 w-4 text-[#cc785c]" /> Record Type: {type}
            </h4>
            <ul className="space-y-2 font-mono text-xs overflow-x-auto">
              {recordsObj[type].map((record: any, idx: number) => (
                <li key={idx} className="bg-black/5 dark:bg-white/5 p-2 whitespace-pre-wrap break-words">
                  {typeof record === "string" ? record : JSON.stringify(record, null, 2)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground newspaper-theme-layout p-4 sm:p-8 font-newspaper selection:bg-[#cc785c] selection:text-white pb-24">
      <div className="mx-auto max-w-5xl pt-8">
        
        <div className="mb-6">
          <Link href="/tools" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-current hover:text-[#cc785c] transition-colors w-fit">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Tools Hub
          </Link>
        </div>

        <div className="mb-8 border-b-4 border-double border-current pb-6 flex items-center justify-between">
          <div>
            <h1 className="font-blackletter text-4xl sm:text-5xl text-current tracking-wide mb-2">Network Investigator</h1>
            <p className="font-sans text-sm italic opacity-80 uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-4 w-4" /> DNS & WHOIS Information Retrieval
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleLookup} className="mb-12">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="font-bold uppercase tracking-widest text-xs">Target Domain / IP Address</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 opacity-50" />
                <input 
                  type="text" 
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. google.com or 8.8.8.8"
                  className="w-full pl-12 pr-4 py-4 border-4 border-current bg-[#fcfaf2] dark:bg-[#1a1917] font-mono text-lg focus:outline-none focus:ring-4 focus:ring-[#cc785c]/30 placeholder:opacity-40"
                  disabled={loading || isPending}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={loading || isPending || !domain.trim()}
              className="bg-[#cc785c] hover:bg-[#b06148] text-white border-4 border-current h-[68px] px-8 font-bold text-lg rounded-none vintage-shadow flex items-center gap-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50"
            >
              {loading ? <Activity className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
              {loading ? "Scanning..." : "Execute"}
            </Button>
          </div>
        </form>

        {error && (
          <div className="mb-8 border-l-4 border-[#c64545] bg-[#c64545]/10 p-4 flex gap-3 text-[#c64545] font-mono text-sm">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column - DNS Records */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="font-blackletter text-3xl border-b-2 border-current pb-3">DNS Telegraph</h3>
            
            {!dnsData && !loading && !error && (
              <div className="border-4 border-dashed border-current/20 p-12 text-center opacity-50">
                <Database className="h-8 w-8 mx-auto mb-3" />
                <p className="font-mono text-sm">Awaiting domain target instruction...</p>
              </div>
            )}

            {dnsData && (
              <div className="space-y-4">
                {dnsData.type === 'REVERSE' ? (
                  <div className="border-2 border-current bg-[#fcfaf2] dark:bg-[#252320] p-6 vintage-shadow">
                    <h4 className="font-blackletter text-2xl mb-4 border-b border-current pb-2">Reverse DNS Mapping</h4>
                    <p className="font-mono text-sm opacity-80 mb-2">Hostnames mapped to IP: {dnsData.domain}</p>
                    <ul className="list-disc pl-5 font-bold space-y-1">
                      {dnsData.records.map((r: string) => <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                ) : (
                  renderDnsRecords(dnsData.records)
                )}
              </div>
            )}
          </div>

          {/* Sidebar - WHOIS Data */}
          <div className="lg:col-span-1">
            <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1a1917] p-6 vintage-shadow sticky top-8">
              <h3 className="font-blackletter text-2xl mb-4 border-b-2 border-current pb-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#cc785c]" /> WHOIS Dossier
              </h3>
              
              {!whoisData && !loading && !error && (
                <p className="font-mono text-xs opacity-50 italic">Dossier unavailable until execution.</p>
              )}

              {loading && (
                <div className="flex items-center gap-2 font-mono text-xs opacity-70">
                  <Activity className="h-3 w-3 animate-spin" /> Fetching registry data...
                </div>
              )}

              {whoisData && (
                <div className="font-mono text-[10px] sm:text-xs overflow-x-auto max-h-[600px] overflow-y-auto bg-black/5 dark:bg-white/5 p-4 border border-current">
                  <pre className="whitespace-pre-wrap word-break-all">
                    {typeof whoisData === 'object' 
                      ? Object.entries(whoisData).map(([k, v]) => `${k.toUpperCase()}:\n${v}\n\n`).join('')
                      : whoisData}
                  </pre>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
