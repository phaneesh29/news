"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "../../config";

interface DigestTrend {
  trend: string;
  description: string;
}

interface DigestSource {
  name: string;
  url: string;
}

interface DigestArticle {
  type: string;
  emoji: string;
  confidence: string;
  title: string;
  impact: number | null;
  sourceName: string;
  sourceUrl: string;
  summary: string;
  score: number | null;
  scoringBreakdown: Record<string, number>;
  sources: DigestSource[];
}

interface DigestCategory {
  name: string;
  emoji: string;
  articles: DigestArticle[];
}

interface DigestStats {
  totalItemsVerified?: string;
  highConfidence?: string;
  mediumConfidence?: string;
  lowConfidence?: string;
  crossReferenced?: string;
  freshnessWindow?: string;
  generatedAt?: string;
  [key: string]: string | undefined;
}

interface DigestData {
  title: string;
  subtitle: string;
  lastUpdated: string;
  executiveSummary: string;
  trends: DigestTrend[];
  categories: DigestCategory[];
  stats: DigestStats;
}

export default function DigestPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Digest data state
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<DigestArticle | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  // Verification form state
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formPriority, setFormPriority] = useState("low");
  const [formTags, setFormTags] = useState("");
  const [formSourceUrl, setFormSourceUrl] = useState("");
  const [formIsPublished, setFormIsPublished] = useState(true);

  const [agentQuery, setAgentQuery] = useState("");
  const [agentLoading, setAgentLoading] = useState(false);

  // Successfully verified articles titles tracker
  const [verifiedTitles, setVerifiedTitles] = useState<string[]>([]);

  // Injection status animation
  const [injectionStatus, setInjectionStatus] = useState({ active: false, phase: "", progress: 0 });

  // Clock state
  const [systemTime, setSystemTime] = useState("");

  // Clock Update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
      setSystemTime(`${dateStr}  |  ${timeStr}`);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Auth & Digest Data
  useEffect(() => {
    const initPage = async () => {
      try {
        // Verify user profile & auth
        const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, { credentials: "include" });
        if (!profileRes.ok) {
          router.push("/login");
          return;
        }
        const profileData = await profileRes.json();
        setProfile(profileData.user);

        // Fetch digest data
        setFetchLoading(true);
        const digestRes = await fetch(`${API_BASE_URL}/digest`, { credentials: "include" });
        if (!digestRes.ok) {
          throw new Error(`Wire error: ${digestRes.statusText}`);
        }
        const digestResponse = await digestRes.json();
        if (digestResponse.success && digestResponse.data) {
          setDigest(digestResponse.data);
        } else {
          throw new Error("Invalid response schema from wire");
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setFetchError(err.message || "Failed to load neural digest");
      } finally {
        setLoading(false);
        setFetchLoading(false);
      }
    };

    initPage();
  }, [router]);

  useEffect(() => {
    if (showVerifyModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showVerifyModal]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { method: "POST", credentials: "include" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  // Maps article type to db priority levels
  const mapTypeToPriority = (type: string) => {
    const cleanType = type.toLowerCase();
    if (cleanType.includes("breaking") || cleanType.includes("fire")) return "critical";
    if (cleanType.includes("trending")) return "medium";
    if (cleanType.includes("notable") || cleanType.includes("pin")) return "low";
    return "low";
  };

  const openVerifyModal = (article: DigestArticle, categoryName: string) => {
    setSelectedArticle(article);
    setSelectedCategoryName(categoryName);
    setFormTitle(article.title.toUpperCase());
    setFormContent(article.summary);
    setFormPriority(mapTypeToPriority(article.type));
    setFormTags(categoryName.toUpperCase().replace(/[^\w\s]/g, "").trim());
    setFormSourceUrl(article.sourceUrl || "");
    setFormIsPublished(true);
    setShowVerifyModal(true);
  };

  const handleVerifyPublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent || !selectedArticle) return;

    setInjectionStatus({ active: true, phase: "VALIDATING DISPATCH PACKET...", progress: 10 });

    try {
      const payload = {
        title: formTitle.toUpperCase(),
        content: formContent,
        priority: formPriority.toLowerCase() as 'low' | 'medium' | 'high' | 'critical',
        tags: formTags.split(",").map(t => t.trim().toUpperCase()).filter(Boolean),
        sourceUrl: formSourceUrl || null,
        isPublished: formIsPublished
      };

      const res = await fetch(`${API_BASE_URL}/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Failed to verify/publish news item");

      // Verify animation steps
      const phases = [
        { msg: "ENGRAVING PRESS PLATES...", delay: 250, progress: 40 },
        { msg: "STAMPING CYBER WIRE DESK...", delay: 500, progress: 75 },
        { msg: "DISPATCHED ONLINE AND REGISTERED!", delay: 800, progress: 100 }
      ];

      phases.forEach((p) => {
        setTimeout(() => {
          setInjectionStatus((prev) => ({ ...prev, phase: p.msg, progress: p.progress }));
          
          if (p.progress === 100) {
            setTimeout(() => {
              setInjectionStatus({ active: false, phase: "", progress: 0 });
              setShowVerifyModal(false);
              setVerifiedTitles(prev => [...prev, selectedArticle.title.toLowerCase().trim()]);
            }, 600);
          }
        }, p.delay);
      });

    } catch (err: any) {
      console.error(err);
      setInjectionStatus({ active: true, phase: "VERIFICATION TRANSMISSION REJECTED!", progress: 0 });
      setTimeout(() => {
        setInjectionStatus({ active: false, phase: "", progress: 0 });
      }, 1500);
    }
  };

  const handleAskAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentQuery.trim()) return;

    setAgentLoading(true);
    try {
      const promptWithContext = `You are refining or drafting a news article based on a neural wire digest dispatch suggestion.

Here is the current draft state:
---
TITLE: ${formTitle || "(empty)"}
CONTENT/SUMMARY:
${formContent || "(empty)"}
TAGS: ${formTags || "(empty)"}
PRIORITY/ALERT LEVEL: ${formPriority || "(empty)"}
SOURCE LINK: ${formSourceUrl || "(empty)"}
---

User Instructions / Topic:
"${agentQuery}"

Please modify or rewrite the news draft according to the user instructions. Make sure to respond with the complete updated schema (title, content, tags, priority, and sourceUrl).`;

      const res = await fetch(`${API_BASE_URL}/agent/draft/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: promptWithContext }),
        credentials: "include"
      });
      if (!res.ok) throw new Error("Agent failed to draft news");
      const data = await res.json();
      if (data.success) {
        const draft = data.draft;
        setFormTitle(draft.title || "");
        setFormContent(draft.content || "");
        if (draft.tags) {
          setFormTags(draft.tags.join(", "));
        }
        if (draft.sourceUrl) {
          setFormSourceUrl(draft.sourceUrl);
        }
        if (draft.priority) {
          const pr = draft.priority.toLowerCase();
          if (["low", "medium", "high", "critical"].includes(pr)) {
            setFormPriority(pr);
          } else {
            setFormPriority("low");
          }
        }
        setAgentQuery("");
      } else {
        throw new Error(data.error?.message || "Failed to draft news");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error generating draft from agent");
    } finally {
      setAgentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-[#f5f2e9] flex items-center justify-center font-['Playfair_Display',_Georgia,_serif] text-stone-900 text-2xl animate-pulse font-bold">
        [ RETRIEVING ARCHIVES & AGENT WIRE DIGEST... ]
      </div>
    );
  }

  const isAdmin = profile?.role === "admin";

  return (
    <div className="min-h-screen w-screen bg-[#f5f2e9] flex flex-col p-4 sm:p-6 md:p-8 relative selection:bg-red-800/10 selection:text-stone-950 text-stone-900 font-serif">
      {/* Newspaper texture noise overlay */}
      <div className="absolute inset-0 desk-mat pointer-events-none z-0"></div>

      {/* Header HUD - Traditional Newspaper style Banner */}
      <header className="w-full flex flex-col items-center border-b-4 border-double border-stone-950 pb-4 mb-6 relative z-10 max-w-[1600px] mx-auto px-1">
        <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
          
          <div className="flex flex-col text-center md:text-left">
            <Link href="/dashboard" className="font-['UnifrakturMaguntia',_Georgia,_serif] text-6xl sm:text-7xl drop-shadow-sm tracking-tight text-black select-none hover:opacity-80 border-b-4 border-double border-black transition-opacity pb-1 leading-none">
              Dev Bits
            </Link>
            <span className="font-mono text-[10px] text-stone-600 tracking-wider mt-2 uppercase font-bold">
              EDITORIAL DESK  •  STAFF ID: <span className="text-black">{profile?.email}</span> ({profile?.role?.toUpperCase()})
            </span>
          </div>

          {/* Nav Deck Links */}
          <div className="flex gap-4 text-xs font-mono font-bold uppercase tracking-widest bg-stone-200/50 px-4 py-2 border border-stone-400/50 rounded">
            <Link href="/dashboard" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; News Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/blogs" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; Blogs Feed</Link>
            <span className="text-stone-400">|</span>
            <Link href="/digest" className="text-stone-900 border-b border-stone-900 hover:text-red-900 transition-colors font-black border-b-2 border-red-850 pb-0.5">&gt; Digest Wire</Link>
            {isAdmin && (
              <>
                <span className="text-stone-400">|</span>
                <Link href="/feedback" className="text-stone-700 hover:text-stone-950 transition-colors">&gt; User Feedback</Link>
              </>
            )}
          </div>

          <div className="flex gap-3">
            {isAdmin && (
              <Link 
                href="/settings"
                className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-white px-3 py-1.5 hover:bg-black hover:text-white transition-all uppercase tracking-widest flex items-center font-bold"
              >
                Oversight Board
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="font-mono text-[10px] sm:text-xs border-2 border-black text-black bg-white px-3 py-1.5 hover:bg-black hover:text-white transition-all uppercase tracking-widest flex items-center font-bold cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Newspaper Subheader bar */}
        <div className="w-full flex justify-between items-center border-t border-stone-850 pt-2 text-[10px] font-mono uppercase text-stone-700 tracking-wider">
          <span>VOL. CXXVI... No. 47190</span>
          <span className="font-bold text-stone-950">{systemTime || "[ RETRIEVING TIME ]"}</span>
          <span>PRICE: 10 CENTS</span>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full pb-8">
        
        {/* Digest Details */}
        <div className="flex flex-col gap-6">
          
          {fetchLoading ? (
            <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-12 text-center shadow-[4px_4px_0px_#111] rounded">
              <div className="animate-spin w-8 h-8 border-4 border-stone-950 border-t-transparent rounded-full mx-auto mb-4"></div>
              <span className="font-mono text-xs uppercase tracking-widest text-stone-700">RETRIEVING LATEST BRIEFINGS FROM TELEGRAPH...</span>
            </div>
          ) : fetchError ? (
            <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-8 shadow-[4px_4px_0px_#111] text-center text-red-900 rounded">
              <span className="font-mono text-xs uppercase font-bold tracking-widest block mb-2">ERROR OCCURRED ON DISPATCH RELAY</span>
              <p className="text-sm italic">{fetchError}</p>
            </div>
          ) : !digest ? (
            <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-8 shadow-[4px_4px_0px_#111] text-center rounded">
              <span className="font-mono text-xs uppercase tracking-widest text-stone-700">NO TELEGRAPH WIRE BRIEFS RECEIVED TODAY.</span>
            </div>
          ) : (
            <div className="bg-[#fcfaf2] border-4 border-double border-stone-950 p-6 md:p-8 shadow-[4px_4px_0px_#111] rounded flex flex-col relative">
              
              {/* Dispatch Header */}
              <div className="text-center border-b-[4px] border-double border-stone-950 pb-6 mb-6">
                <span className="font-mono text-[10px] text-stone-600 font-bold uppercase tracking-widest block mb-1">
                  INTELLIGENCE BRIEFING WIRE DISPATCH
                </span>
                <h2 className="font-['Playfair_Display',_Georgia,_serif] text-4xl sm:text-5xl font-black drop-shadow-sm text-black tracking-tight uppercase leading-none mb-3">
                  ✦ {digest.title || "NEWSFETCH DIGEST"} ✦
                </h2>
                <div className="font-mono text-[10px] uppercase font-bold text-stone-700 tracking-wider">
                  {digest.subtitle || "Developer-Focused AI Intelligence Wire"}
                  <span className="mx-2">•</span>
                  Last Updated: <span className="text-black">{digest.lastUpdated}</span>
                </div>
              </div>

              {/* Executive Summary & Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b-2 border-stone-300">
                
                {/* Executive Summary */}
                <div className="md:col-span-8 pr-0 md:pr-6 border-b md:border-b-0 md:border-r border-stone-300 text-left">
                  <h3 className="font-['Playfair_Display',_Georgia,_serif] text-xl font-bold uppercase mb-2 text-stone-900 border-b border-stone-200 pb-1">
                    📋 Executive Summary
                  </h3>
                  <p className="text-[14px] leading-relaxed text-justify text-stone-850 whitespace-pre-line font-serif">
                    {digest.executiveSummary}
                  </p>
                </div>

                {/* Pipeline Stats */}
                <div className="md:col-span-4 text-left">
                  <h3 className="font-['Playfair_Display',_Georgia,_serif] text-xl font-bold uppercase mb-2 text-stone-900 border-b border-stone-200 pb-1">
                    📊 Stats Matrix
                  </h3>
                  <div className="space-y-2 font-mono text-[11px] text-stone-700">
                    {Object.entries(digest.stats || {}).map(([key, val]) => {
                      const label = key.replace(/([A-Z])/g, " $1").toUpperCase();
                      return (
                        <div key={key} className="flex justify-between border-b border-stone-200/50 pb-1">
                          <span>{label}:</span>
                          <span className="text-black font-bold">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Key Industry Trends */}
              {digest.trends && digest.trends.length > 0 && (
                <div className="py-6 border-b-2 border-stone-300 text-left">
                  <h3 className="font-['Playfair_Display',_Georgia,_serif] text-xl font-bold uppercase mb-3 text-stone-900">
                    📈 Key Industry Trends
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {digest.trends.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 border-r last:border-none border-dashed border-stone-300 pr-4">
                        <span className="font-mono text-[10px] font-bold text-red-850 block">TREND 0{idx + 1}</span>
                        <h4 className="font-bold text-sm uppercase text-stone-950">{item.trend}</h4>
                        <p className="text-xs text-stone-700 leading-relaxed">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Categorized Feeds */}
              <div className="space-y-8 mt-6">
                
                <div className="font-mono text-xs uppercase tracking-widest text-center border-y-2 border-stone-950 py-2 font-black">
                  CLASSIFIED EDITORIAL FEED CATEGORIES
                </div>

                {digest.categories.map((category, catIdx) => (
                  <div key={catIdx} className="space-y-4 text-left">
                    <h3 className="font-['Playfair_Display',_Georgia,_serif] text-2xl font-black uppercase text-stone-900 border-b border-stone-950 pb-1.5 flex items-center gap-2">
                      <span>{category.emoji}</span> {category.name}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {category.articles.map((article, artIdx) => {
                        const isVerified = verifiedTitles.includes(article.title.toLowerCase().trim());
                        
                        return (
                          <div 
                            key={artIdx}
                            className="bg-white border-2 border-stone-950 p-5 rounded shadow-sm hover:shadow transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              {/* Metadata */}
                              <div className="flex justify-between items-center text-[10px] font-mono text-stone-600 border-b border-dashed border-stone-300 pb-1.5">
                                <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                                  <span className={
                                    article.type.toLowerCase().includes("breaking")
                                      ? "text-red-600"
                                      : article.type.toLowerCase().includes("trending")
                                      ? "text-amber-600"
                                      : "text-blue-600"
                                  }>●</span>
                                  {article.type}
                                </span>
                                {article.impact && (
                                  <span className="font-bold">IMPACT: {article.impact}/10</span>
                                )}
                              </div>

                              <h4 className="font-['Playfair_Display',_Georgia,_serif] text-lg font-black uppercase text-black leading-snug">
                                {article.title}
                              </h4>

                              <p className="text-xs text-stone-800 leading-relaxed font-serif text-justify">
                                {article.summary}
                              </p>
                              
                              {article.sourceUrl && (
                                <div className="pt-2">
                                  <span className="font-mono text-[9px] text-stone-500 uppercase block">INTELLIGENCE MATRIX REF</span>
                                  <a 
                                    href={article.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono text-[10px] text-red-850 hover:underline break-all font-bold block"
                                  >
                                    {article.sourceUrl}
                                  </a>
                                </div>
                              )}
                            </div>

                            {/* Verification Button */}
                            <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between items-center">
                              <span className="font-mono text-[9px] text-stone-500 font-bold uppercase">ACTION REQUIRED</span>
                              
                              {isVerified ? (
                                <span className="font-mono text-[10px] border-2 border-green-700 bg-green-50 text-green-700 font-black px-2.5 py-1 uppercase rounded tracking-wider flex items-center gap-1 select-none">
                                  ✓ DISPATCHED
                                </span>
                              ) : (
                                <button
                                  onClick={() => openVerifyModal(article, category.name)}
                                  className="vintage-stamp text-[10px] font-black uppercase tracking-wider py-1 cursor-pointer"
                                >
                                  VERIFY DISPATCH
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Verification Overlay Modal */}
      {showVerifyModal && selectedArticle && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#fcfaf2] border-4 border-stone-950 p-6 md:p-8 max-w-5xl w-full rounded shadow-[6px_6px_0px_#111] relative text-left transition-all duration-300">
            
            {/* Modal close */}
            <button 
              onClick={() => setShowVerifyModal(false)}
              className="absolute right-4 top-4 font-mono text-lg font-black border-2 border-black hover:bg-black hover:text-white px-2 py-0.5 rounded cursor-pointer select-none"
            >
              ✕
            </button>

            {/* Modal Title */}
            <div className="border-b-[4px] border-double border-stone-950 pb-3 mb-5 text-center">
              <span className="font-mono text-[9px] text-stone-600 font-bold uppercase tracking-widest block mb-1">
                DISPATCH TELEGRAPH VERIFICATION PROTOCOL
              </span>
              <h3 className="font-playfair text-2xl font-black uppercase tracking-tight text-stone-950">
                VERIFY NEWS DISPATCH
              </h3>
            </div>

            {/* Split layout: Form & Agent Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start mt-4">
              <form onSubmit={handleVerifyPublishSubmit} className="lg:col-span-2 space-y-4">
                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                    ARTICLE TITLE
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-base text-stone-900 font-bold font-serif uppercase tracking-tight"
                  />
                </div>

                <div className="flex flex-col border-b border-stone-400 pb-2">
                  <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                    CONTENT SUMMARY
                  </label>
                  <textarea
                    required
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm text-stone-900 font-serif leading-relaxed"
                    rows={5}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col border-b border-stone-400 pb-2">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                      SOURCE URL
                    </label>
                    <input
                      type="url"
                      value={formSourceUrl}
                      onChange={(e) => setFormSourceUrl(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-stone-900 font-mono"
                    />
                  </div>

                  <div className="flex flex-col border-b border-stone-400 pb-2">
                    <label className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-1">
                      ROUTING LABELS (COMMA SEPARATED)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs text-stone-900 font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pt-2">
                  <span className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">
                    ALERT LEVEL
                  </span>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                    {[
                      { key: "low", text: "LOW" },
                      { key: "medium", text: "MEDIUM" },
                      { key: "high", text: "HIGH" },
                      { key: "critical", text: "CRITICAL" }
                    ].map((level) => (
                      <button
                        key={level.key}
                        type="button"
                        onClick={() => setFormPriority(level.key)}
                        className={`py-2 rounded border-2 cursor-pointer transition-all duration-200 ${
                          formPriority === level.key 
                            ? "bg-stone-950 text-white border-stone-950 font-bold scale-[1.03]" 
                            : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                        }`}
                      >
                        {level.text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-stone-400 pb-3 mt-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] font-bold text-stone-600 uppercase tracking-widest">DIRECT PUBLICATION</span>
                    <span className="font-serif text-xs text-stone-500">Toggle on to immediately list on the public feed.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormIsPublished(!formIsPublished)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer border-2 ${formIsPublished ? 'bg-green-700 border-green-800' : 'bg-stone-300 border-stone-400'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formIsPublished ? 'translate-x-5' : 'translate-x-1'}`}
                    />
                  </button>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="submit"
                    disabled={injectionStatus.active}
                    className="flex-1 bg-stone-950 text-white border-2 border-stone-950 font-mono font-bold text-xs py-3 rounded uppercase tracking-wider hover:bg-transparent hover:text-black transition-all cursor-pointer"
                  >
                    Confirm & Verify Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVerifyModal(false)}
                    className="flex-1 bg-stone-200 text-stone-900 border-2 border-stone-300 font-mono font-bold text-xs py-3 rounded uppercase tracking-wider hover:bg-stone-300 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="lg:col-span-1 flex flex-col relative w-full lg:sticky lg:top-0">
                <div className="bg-[#fcfaf2] border-[3px] border-black p-4 flex flex-col relative z-10 shadow-[4px_4px_0px_#111111] rounded">
                  <div className="absolute top-4 right-4 border-2 border-black text-black border-b border-black font-black text-[9px] px-1.5 -rotate-[10deg] mix-blend-multiply select-none font-['Playfair_Display',_Georgia,_serif] uppercase">
                    STAFF AI
                  </div>
                  <div className="border-b-2 border-black pb-3 mb-4 text-left">
                    <h3 className="font-['Playfair_Display',_Georgia,_serif] text-base text-black uppercase tracking-wide font-black">EDITORIAL ASSISTANT</h3>
                    <p className="font-mono text-[9px] text-stone-600 font-bold mt-1 tracking-wider uppercase">AUTOMATED WIRE DESPATCH</p>
                  </div>
                  <div className="flex-1 bg-[#fcfaf2] flex flex-col relative">
                    <form onSubmit={handleAskAgent} className="flex flex-col gap-4 font-serif text-stone-900 text-left">
                      <p className="font-serif text-xs text-stone-700 leading-relaxed">Provide instructions or a topic. The Staff Agent will search the web using <strong>Tavily Search & Extraction</strong>, synthesize the details, and return a print-ready news report draft matching the database schema.</p>
                      <div className="flex flex-col border-[2px] border-black p-2 bg-[#fcfaf2]">
                        <label className="font-mono text-[9px] font-bold text-black uppercase tracking-widest mb-1.5">Enter Topic or Wire Request:</label>
                        <textarea required placeholder="e.g. OpenAI releases a new reasoning model named o3. Include its features and pricing." value={agentQuery} onChange={(e) => setAgentQuery(e.target.value)} className="w-full bg-transparent outline-none text-xs text-stone-950 placeholder-stone-400 font-serif leading-relaxed h-20 resize-none typewriter-field" disabled={agentLoading} />
                      </div>
                      <button type="submit" className="vintage-stamp w-full text-center py-2 bg-black text-[#fcfaf2] border-black hover:bg-stone-800 hover:text-[#fcfaf2] font-bold cursor-pointer text-xs" disabled={agentLoading || !agentQuery.trim()}>
                        {agentLoading ? "COMMISSIONING TELETYPES..." : "DISPATCH NEWS AGENT"}
                      </button>
                      {agentLoading && (
                        <div className="mt-2 p-2 border border-stone-300 bg-[#e8e4d9]/60 text-center font-mono text-[10px] text-stone-700 flex flex-col gap-1">
                          <div className="animate-pulse flex items-center justify-center gap-1">
                            <span className="inline-block w-2 h-2 bg-black rounded-full animate-ping"></span>
                            <span className="text-black font-bold">[ WIRE AGENT AT WORK ]</span>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dispatching Teleprinter sweep animation popup */}
      {injectionStatus.active && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#fcfaf2] border-4 border-double border-black p-8 flex flex-col gap-6 relative overflow-hidden text-stone-900">
            <h3 className="font-['Playfair_Display',_Georgia,_serif] text-black font-black text-xl uppercase tracking-widest text-center animate-pulse">
              PUBLISHING TO FEED
            </h3>
            
            <div className="flex flex-col gap-2 font-mono text-xs text-stone-800">
              <div className="flex justify-between">
                <span>STATUS: {injectionStatus.phase}</span>
                <span>{injectionStatus.progress}%</span>
              </div>
              <div className="w-full h-4 bg-[#dcd7c9] border-2 border-stone-950 overflow-hidden p-0.5">
                <div 
                  className="h-full bg-stone-950 transition-all duration-300"
                  style={{ width: `${injectionStatus.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer HUD */}
      <footer className="w-full max-w-[1600px] mx-auto mt-6 pt-3 border-t-2 border-black flex flex-wrap justify-between items-center gap-4 text-[10px] font-mono text-stone-800 z-10 px-1 font-bold">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-black font-black bg-[#fcfaf2]">
            D
          </div>
          <div>
            <span className="text-black font-black tracking-widest">DEV BITS PUBLISHING</span>
            <span className="mx-2 text-stone-400">|</span>
            <span>Telegraph Wire: <span className="text-black border-b border-black font-black uppercase">CONNECTED</span></span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span>STAFF CLEARANCE:</span>
          <span className="text-black font-black uppercase">VERIFIED ACTIVE</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span>SYSTEM TIME:</span>
          <span className="text-stone-850 font-bold">{systemTime || "[ SYSTEM STANDBY ]"}</span>
        </div>
      </footer>
    </div>
  );
}
