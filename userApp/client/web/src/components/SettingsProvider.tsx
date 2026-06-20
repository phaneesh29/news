"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type SiteTheme = "aged-paper" | "classic-white" | "ink-dark" | "amber-terminal" | "green-terminal";
export type FontFamily = "newspaper" | "serif" | "sans";
export type FontSize = "sm" | "md" | "lg" | "xl";

export interface Settings {
  warmness: number; // 0 to 100
  theme: SiteTheme;
  fontFamily: FontFamily;
  fontSize: FontSize;
  scanlines: boolean;
  grain: boolean;
  vignette: boolean;
  doubleColumn: boolean;
}

interface SettingsContextProps {
  settings: Settings;
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  warmness: 35,
  theme: "aged-paper",
  fontFamily: "newspaper",
  fontSize: "md",
  scanlines: true,
  grain: true,
  vignette: true,
  doubleColumn: false,
};

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem("devbits-settings");
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
    setMounted(true);
  }, []);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      localStorage.setItem("devbits-settings", JSON.stringify(next));
      return next;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem("devbits-settings", JSON.stringify(defaultSettings));
  };

  // Build classes based on settings
  const getThemeClasses = () => {
    if (!mounted) return "bg-[#f5f2e9] text-[#111111] --theme-aged-paper";
    
    switch (settings.theme) {
      case "aged-paper":
        return "bg-background text-foreground --theme-aged-paper";
      case "classic-white":
        return "bg-[#fcfaf2] text-[#111111] --theme-classic-white";
      case "ink-dark":
        return "bg-[#181715] text-[#e8e6df] --theme-ink-dark dark";
      case "amber-terminal":
        return "bg-[#0a0400] text-[#ff9d3b] --theme-amber-terminal";
      case "green-terminal":
        return "bg-[#000902] text-[#44ee77] --theme-green-terminal";
      default:
        return "bg-[#f5f2e9] text-[#111111]";
    }
  };

  const getFontClasses = () => {
    if (!mounted) return "font-newspaper";
    
    if (settings.theme === "amber-terminal" || settings.theme === "green-terminal") {
      return "font-mono";
    }
    switch (settings.fontFamily) {
      case "newspaper":
        return "font-newspaper";
      case "serif":
        return "font-serif";
      case "sans":
        return "font-sans";
      default:
        return "font-newspaper";
    }
  };

  const getFontSizeClasses = () => {
    if (!mounted) return "text-scale-md text-sm md:text-base";
    
    switch (settings.fontSize) {
      case "sm":
        return "text-scale-sm text-xs md:text-sm";
      case "md":
        return "text-scale-md text-sm md:text-base";
      case "lg":
        return "text-scale-lg text-base md:text-lg";
      case "xl":
        return "text-scale-xl text-lg md:text-xl";
      default:
        return "text-scale-md text-sm md:text-base";
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      <div 
        id="devbits-settings-root"
        className={`min-h-screen relative flex flex-col transition-colors duration-300 ${getThemeClasses()} ${getFontClasses()} ${getFontSizeClasses()}`}
      >
        {/* Overlay warmth layer */}
        {mounted && settings.warmness > 0 && (
          <div 
            className="fixed inset-0 pointer-events-none z-[9999] mix-blend-multiply" 
            style={{ 
              backgroundColor: `rgba(217, 119, 6, ${settings.warmness * 0.0022})`, 
            }} 
          />
        )}
        
        {/* Vignette layer */}
        {mounted && settings.vignette && (
          <div className="fixed inset-0 pointer-events-none z-[9998] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(30,20,10,0.18)_100%)] opacity-80" />
        )}

        {/* Scanlines sweep layer */}
        {mounted && settings.scanlines && (
          <div className="fixed inset-0 pointer-events-none z-[9997] scanline-sweeper opacity-20" />
        )}

        {/* Paper Grain layer */}
        {mounted && settings.grain && (
          <div className="fixed inset-0 pointer-events-none z-[9996] bg-grain opacity-[0.12] mix-blend-multiply dark:mix-blend-screen" />
        )}
        
        <div className="relative z-10 flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
