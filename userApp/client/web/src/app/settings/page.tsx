"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSettings, type SiteTheme, type FontFamily, type FontSize } from "@/components/SettingsProvider";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  Tv, 
  Type, 
  RotateCcw, 
  Activity,
  Cpu
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSetting, resetSettings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#cc785c]/25 selection:text-[#141413]">
      <Navbar />

      <main className="flex-1 mx-auto max-w-5xl w-full px-4 py-8 md:py-12 space-y-10">
        
        {/* Masthead and Heading */}
        <div className="text-center md:text-left space-y-2 border-b-2 border-current pb-6">
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold uppercase tracking-tight text-center md:text-left font-newspaper">
            Display & Typography Settings
          </h1>
          <p className="text-xs md:text-sm font-mono opacity-80 max-w-2xl">
            Configure display themes, font scaling, CRT scanlines, and layouts for optimal reading.
          </p>
        </div>

        {/* main grids */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          
          {/* Controls Column (left) */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Display and Typography settings */}
            <Card className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] vintage-shadow rounded-none">
              <CardHeader className="border-b-2 border-[#111111] dark:border-[#e6dfd8] bg-[#efe9de] dark:bg-[#252320] rounded-none">
                <CardTitle className="font-serif text-lg font-bold flex items-center gap-2 font-newspaper">
                  <Type className="h-5 w-5 text-[#cc785c]" />
                  Typography & Readability
                </CardTitle>
                <CardDescription className="font-mono text-[11px] opacity-75">
                  Adjust font scaling and layouts for optimal reading.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6 text-sm">
                
                {/* Font Face selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider block font-mono">
                    Headline & Body Font Family
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "newspaper", label: "Broadsheet", desc: "California Times style" },
                      { id: "serif", label: "Classic Serif", desc: "Garamond Book style" },
                      { id: "sans", label: "Modern Sans", desc: "Inter Clean style" }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => updateSetting("fontFamily", f.id as FontFamily)}
                        className={`p-3 text-left border-2 border-[#111111] dark:border-[#e6dfd8] transition-all hover:bg-[#efe9de] dark:hover:bg-[#252320] flex flex-col justify-between ${
                          settings.fontFamily === f.id
                            ? "bg-[#cc785c]/15 border-[#cc785c] text-[#cc785c] scale-[0.98] ring-1 ring-[#cc785c]"
                            : "bg-transparent text-inherit"
                        }`}
                      >
                        <span className="font-bold text-xs">{f.label}</span>
                        <span className="text-[10px] opacity-60 font-mono mt-1">{f.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font size scaling */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider block font-mono">
                    Text Scale Adjustment
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "sm", label: "Small" },
                      { id: "md", label: "Default" },
                      { id: "lg", label: "Large" },
                      { id: "xl", label: "Extrabold" }
                    ].map((sz) => (
                      <button
                        key={sz.id}
                        onClick={() => updateSetting("fontSize", sz.id as FontSize)}
                        className={`p-2.5 text-center border-2 border-[#111111] dark:border-[#e6dfd8] font-bold text-xs transition-all ${
                          settings.fontSize === sz.id
                            ? "bg-[#cc785c] text-white border-[#cc785c]"
                            : "bg-transparent hover:bg-[#efe9de] dark:hover:bg-[#252320]"
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multi Column Layout Toggle */}
                <div className="flex items-center justify-between border-t border-[#e6dfd8] pt-4">
                  <div>
                    <span className="text-xs font-bold uppercase block font-mono">Broadsheet Dual Columns</span>
                    <span className="text-[11px] opacity-75">Layout news in double column print broadsheet columns.</span>
                  </div>
                  <button
                    onClick={() => updateSetting("doubleColumn", !settings.doubleColumn)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      settings.doubleColumn ? "bg-[#cc785c]" : "bg-[#efe9de] dark:bg-[#252320]"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        settings.doubleColumn ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

              </CardContent>
            </Card>

            {/* Display tone, CRT, vignette controls */}
            <Card className="border-2 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#1f1e1b] vintage-shadow rounded-none">
              <CardHeader className="border-b-2 border-[#111111] dark:border-[#e6dfd8] bg-[#efe9de] dark:bg-[#252320] rounded-none">
                <CardTitle className="font-serif text-lg font-bold flex items-center gap-2 font-newspaper">
                  <Tv className="h-5 w-5 text-[#cc785c]" />
                  Display Aesthetics & Screen Tones
                </CardTitle>
                <CardDescription className="font-mono text-[11px] opacity-75">
                  Configure parchment stains, screen scanlines, and vignette depths.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6 text-sm">
                
                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider block font-mono">
                    Active System Surface Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "aged-paper", label: "Aged Paper" },
                      { id: "classic-white", label: "Plain Canvas" }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => updateSetting("theme", t.id as SiteTheme)}
                        className={`p-2 border-2 border-[#111111] dark:border-[#e6dfd8] font-bold text-[10px] sm:text-xs transition-all ${
                          settings.theme === t.id
                            ? "bg-[#cc785c] text-white border-[#cc785c]"
                            : "bg-transparent hover:bg-[#efe9de] dark:hover:bg-[#252320]"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warmness controls slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider block font-mono">
                      Parchment Warmth Filter
                    </label>
                    <span className="font-mono text-xs text-[#cc785c] font-bold">{settings.warmness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.warmness}
                    onChange={(e) => updateSetting("warmness", parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#efe9de] dark:bg-[#252320] rounded-lg appearance-none cursor-pointer accent-[#cc785c]"
                  />
                  <p className="text-[10px] font-mono opacity-60">
                    Applies a warm sepia multiply filter to reduce eye strain during late-night reading cycles.
                  </p>
                </div>

                {/* Aesthetic switches */}
                <div className="space-y-4 border-t border-[#e6dfd8] pt-4">
                  
                  {/* CRT Tunnels scanline */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase block font-mono">CRT Scanline Raster</span>
                      <span className="text-[11px] opacity-75">Simulate vintage monitor scanning lines.</span>
                    </div>
                    <button
                      onClick={() => updateSetting("scanlines", !settings.scanlines)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.scanlines ? "bg-[#cc785c]" : "bg-[#efe9de] dark:bg-[#252320]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.scanlines ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Vignette Shadow */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase block font-mono">CRT Vignette Halo</span>
                      <span className="text-[11px] opacity-75">Darkens viewport edges to recreate physical cathode tubes.</span>
                    </div>
                    <button
                      onClick={() => updateSetting("vignette", !settings.vignette)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.vignette ? "bg-[#cc785c]" : "bg-[#efe9de] dark:bg-[#252320]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.vignette ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Paper Pulp Grain */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase block font-mono">Newsprint Pulp Grain</span>
                      <span className="text-[11px] opacity-75">Superimposes physical wood-fiber grain onto paper.</span>
                    </div>
                    <button
                      onClick={() => updateSetting("grain", !settings.grain)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.grain ? "bg-[#cc785c]" : "bg-[#efe9de] dark:bg-[#252320]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.grain ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                </div>

              </CardContent>
              <CardFooter className="bg-[#efe9de]/30 dark:bg-[#252320]/30 px-6 py-4 flex justify-between border-t border-[#e6dfd8]/50 rounded-none">
                <Button 
                  onClick={resetSettings} 
                  variant="outline" 
                  className="border-2 border-[#111111] dark:border-[#e6dfd8] hover:bg-[#efe9de] text-xs h-9 rounded-none font-bold"
                >
                  <RotateCcw className="h-4 w-4 mr-1.5" />
                  Restore Defaults
                </Button>
                
                <span className="font-mono text-[10px] opacity-50 flex items-center gap-1">
                  <Activity className="h-3 w-3 text-[#cc785c]" />
                  Aesthetics Synced Locally
                </span>
              </CardFooter>
            </Card>

          </div>

          {/* Guidelines Column (right) */}
          <div className="space-y-6">
            
            {/* In-use guidelines */}
            <Card className="border border-[#e6dfd8] bg-[#efe9de]/20 p-4.5 space-y-2 rounded-none">
              <span className="font-bold text-[10px] uppercase font-mono tracking-widest text-[#cc785c] flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                Readability Guidelines
              </span>
              <p className="text-[11px] leading-relaxed">
                If you encounter high ambient light, we recommend switching to the <strong>Plain Canvas</strong> theme. For a vintage newspaper reading experience, select <strong>Aged Paper</strong>.
              </p>
            </Card>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-[#181715] text-[#a09d96] py-8 border-t border-[#252320]">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <p>© {new Date().getFullYear()} DevBits Curation System.</p>
          <div className="flex gap-4">
            <a href="/news" className="hover:underline">News Feed</a>
            <a href="/blog" className="hover:underline">Strategic Blog</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
