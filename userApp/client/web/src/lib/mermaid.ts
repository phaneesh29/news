"use client";

import { useEffect } from "react";
import { marked, type MarkedExtension } from "marked";

/**
 * Custom marked extension that converts ```mermaid code blocks
 * into <div class="mermaid"> containers for mermaid.js to pick up.
 */
const mermaidExtension: MarkedExtension = {
  renderer: {
    code({ text, lang }: { text: string; lang?: string | undefined }) {
      if (lang === "mermaid") {
        return `<div class="mermaid">${text}</div>`;
      }
      // Return false to fall through to the default renderer
      return false;
    },
  },
};

// Apply the extension once
let _configured = false;
export function configureMermaidMarked() {
  if (_configured) return;
  marked.use(mermaidExtension);
  _configured = true;
}

/**
 * Hook: call after markdown HTML is rendered into the DOM.
 * It loads mermaid from CDN (lazy) and renders all .mermaid divs.
 *
 * @param deps - dependency array that triggers re-render (e.g. [htmlContent, showPreview])
 */
export function useMermaid(deps: unknown[] = []) {
  useEffect(() => {
    // Small delay to ensure DOM is painted
    const timer = setTimeout(async () => {
      const mermaidDivs = document.querySelectorAll<HTMLElement>(".mermaid");
      if (mermaidDivs.length === 0) return;

      try {
        // Dynamically import mermaid from CDN via global
        const mermaid = await getMermaidInstance();
        
        // Reset all mermaid divs so they can be re-rendered
        mermaidDivs.forEach((el) => {
          // If already rendered, mermaid adds data-processed; we need to reset it
          if (el.getAttribute("data-processed")) {
            el.removeAttribute("data-processed");
          }
        });

        await mermaid.run({ nodes: mermaidDivs });
      } catch (err) {
        console.error("[Mermaid] Failed to render diagrams:", err);
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ---- Mermaid instance loader (loads from CDN once) ----

let _mermaidPromise: Promise<any> | null = null;

function getMermaidInstance(): Promise<any> {
  if (_mermaidPromise) return _mermaidPromise;

  _mermaidPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).mermaid) {
      (window as any).mermaid.initialize({ startOnLoad: false, theme: "neutral" });
      resolve((window as any).mermaid);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => {
      const m = (window as any).mermaid;
      if (m) {
        m.initialize({ startOnLoad: false, theme: "neutral" });
        resolve(m);
      } else {
        reject(new Error("Mermaid script loaded but instance not found"));
      }
    };
    script.onerror = () => {
      _mermaidPromise = null;
      reject(new Error("Failed to load mermaid from CDN"));
    };
    document.head.appendChild(script);
  });

  return _mermaidPromise;
}
