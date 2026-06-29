"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Globe, Shield, Server, Activity, Database, AlertCircle, Clock } from "lucide-react";
import { useSession, signIn } from "@/lib/auth-client";
import { resolveDnsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DnsResolver() {
  const { data: sessionData, isPending } = useSession();
  const activeUser = sessionData?.user;

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [dnsData, setDnsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordType, setRecordType] = useState("ALL");

  const handleLookup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);
    setDnsData(null);

    try {
      const res = await resolveDnsApi(domain.trim(), recordType);
      if (res.status === "success") {
        setDnsData(res.data);
      } else {
        setError(res.message || "Failed to resolve DNS");
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
            The advanced DNS resolver requires identity verification.
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

  const renderDnsRecords = (recordsObj: any, specificType: string) => {
    if (!recordsObj) return null;
    
    // If specificType is not ALL, recordsObj is just an array, not an object mapping
    if (specificType !== "ALL") {
      if (!Array.isArray(recordsObj) || recordsObj.length === 0) {
        return <p className="font-mono text-xs opacity-70 p-4 border border-dashed border-current">No records found.</p>;
      }
      return (
        <div className="border-2 border-current bg-[#fcfaf2] dark:bg-[#252320] p-4 vintage-shadow-sm">
          <h4 className="font-blackletter text-xl mb-3 flex items-center gap-2 border-b-2 border-current pb-2">
            <Server className="h-4 w-4 text-[#cc785c]" /> Record Type: {specificType}
          </h4>
          <ul className="space-y-2 font-mono text-xs overflow-x-auto">
            {recordsObj.map((record: any, idx: number) => (
              <li key={idx} className="bg-black/5 dark:bg-white/5 p-2 whitespace-pre-wrap break-words">
                {typeof record === "string" ? record : JSON.stringify(record, null, 2)}
              </li>
            ))}
          </ul>
        </div>
      );
    }

    // ALL type mapping
    const types = Object.keys(recordsObj);
    if (types.length === 0) return <p className="font-mono text-xs opacity-70 p-4 border border-dashed border-current">No records found.</p>;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {types.map(type => (
          <div key={type} className="border-2 border-current bg-[#fcfaf2] dark:bg-[#252320] p-4 vintage-shadow-sm flex flex-col h-full">
            <h4 className="font-blackletter text-xl mb-3 flex items-center gap-2 border-b-2 border-current pb-2">
              <Server className="h-4 w-4 text-[#cc785c]" /> {type} Records
            </h4>
            <ul className="space-y-2 font-mono text-xs overflow-x-auto flex-1">
              {recordsObj[type].map((record: any, idx: number) => (
                <li key={idx} className="bg-black/5 dark:bg-white/5 p-2 whitespace-pre-wrap break-words border-l-2 border-[#cc785c]">
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

        <div className="mb-8 border-b-4 border-double border-current pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="font-blackletter text-4xl sm:text-5xl text-current tracking-wide mb-2">Network Investigator</h1>
            <p className="font-sans text-sm italic opacity-80 uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-4 w-4" /> DNS Telemetry & IP Tracing
            </p>
          </div>
          {dnsData?.queryTimeMs !== undefined && (
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-widest border-2 border-current px-3 py-1.5 bg-[#fcfaf2] dark:bg-[#252320] vintage-shadow-sm">
              <Clock className="h-3 w-3 text-[#cc785c]" /> Latency: {dnsData.queryTimeMs}ms
            </div>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleLookup} className="mb-12">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="font-bold uppercase tracking-widest text-xs">Target Domain / IP Address</label>
              <div className="relative flex">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Search className="h-5 w-5 opacity-50" />
                </div>
                <input 
                  type="text" 
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. google.com or 8.8.8.8"
                  className="w-full pl-12 pr-4 py-4 border-4 border-r-0 border-current bg-[#fcfaf2] dark:bg-[#1a1917] font-mono text-lg focus:outline-none focus:ring-inset focus:ring-4 focus:ring-[#cc785c]/30 placeholder:opacity-40"
                  disabled={loading || isPending}
                />
                <Select 
                  value={recordType}
                  onValueChange={setRecordType}
                  disabled={loading || isPending}
                >
                  <SelectTrigger className="w-[180px] !h-[68px] border-4 border-l-0 border-current bg-[#fcfaf2] dark:bg-[#252320] font-bold font-mono text-sm uppercase rounded-none !ring-offset-0 focus:!ring-0 focus-visible:!ring-0 !outline-none focus:!outline-none focus-visible:!outline-none cursor-pointer">
                    <SelectValue placeholder="Record Type" />
                  </SelectTrigger>
                  <SelectContent className="border-4 border-current rounded-none bg-[#fcfaf2] dark:bg-[#252320] font-mono font-bold text-xs uppercase vintage-shadow-sm p-0">
                    <SelectItem value="ALL" className="focus:bg-[#cc785c] focus:!text-white focus:[&_*]:!text-white hover:bg-[#cc785c] hover:!text-white hover:[&_*]:!text-white rounded-none py-3 px-4 cursor-pointer border-b-2 border-current/20">ALL (Extensive)</SelectItem>
                    <SelectItem value="A" className="focus:bg-[#cc785c] focus:!text-white focus:[&_*]:!text-white hover:bg-[#cc785c] hover:!text-white hover:[&_*]:!text-white rounded-none py-3 px-4 cursor-pointer border-b-2 border-current/20">A (IPv4)</SelectItem>
                    <SelectItem value="AAAA" className="focus:bg-[#cc785c] focus:!text-white focus:[&_*]:!text-white hover:bg-[#cc785c] hover:!text-white hover:[&_*]:!text-white rounded-none py-3 px-4 cursor-pointer border-b-2 border-current/20">AAAA (IPv6)</SelectItem>
                    <SelectItem value="MX" className="focus:bg-[#cc785c] focus:!text-white focus:[&_*]:!text-white hover:bg-[#cc785c] hover:!text-white hover:[&_*]:!text-white rounded-none py-3 px-4 cursor-pointer border-b-2 border-current/20">MX (Mail)</SelectItem>
                    <SelectItem value="TXT" className="focus:bg-[#cc785c] focus:!text-white focus:[&_*]:!text-white hover:bg-[#cc785c] hover:!text-white hover:[&_*]:!text-white rounded-none py-3 px-4 cursor-pointer border-b-2 border-current/20">TXT (Text)</SelectItem>
                    <SelectItem value="NS" className="focus:bg-[#cc785c] focus:!text-white focus:[&_*]:!text-white hover:bg-[#cc785c] hover:!text-white hover:[&_*]:!text-white rounded-none py-3 px-4 cursor-pointer border-b-2 border-current/20">NS (Nameserver)</SelectItem>
                    <SelectItem value="CNAME" className="focus:bg-[#cc785c] focus:!text-white focus:[&_*]:!text-white hover:bg-[#cc785c] hover:!text-white hover:[&_*]:!text-white rounded-none py-3 px-4 cursor-pointer">CNAME (Alias)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={loading || isPending || !domain.trim()}
              className="bg-[#cc785c] hover:bg-[#b06148] text-white border-4 border-current h-[68px] px-8 font-bold text-lg rounded-none vintage-shadow flex items-center gap-2 transition-all active:translate-y-1 active:shadow-none disabled:opacity-50 w-full md:w-auto justify-center"
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
        <div className="space-y-6">
          {dnsData || loading || error ? (
            <h3 className="font-blackletter text-3xl border-b-2 border-current pb-3">DNS Telegraph</h3>
          ) : (
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
                renderDnsRecords(dnsData.records, dnsData.type)
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
