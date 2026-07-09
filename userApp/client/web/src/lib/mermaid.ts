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
        const escapedText = encodeURIComponent(text);
        return `<div class="mermaid" data-original-code="${escapedText}">${text}</div>`;
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
        const mermaid = await getMermaidInstance();
        
        const nodesToRender: HTMLElement[] = [];
        mermaidDivs.forEach((el) => {
          const originalCode = el.getAttribute("data-original-code");
          if (originalCode) {
            el.textContent = decodeURIComponent(originalCode);
            el.removeAttribute("data-processed");
            nodesToRender.push(el);
          } else if (!el.getAttribute("data-processed")) {
            nodesToRender.push(el);
          }
        });

        if (nodesToRender.length > 0) {
          await mermaid.run({ nodes: nodesToRender });
        }
      } catch (err) {
        console.error("[Mermaid] Failed to render diagrams:", err);
      }
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ---- Mermaid instance loader (loads npm package dynamically) ----

let _mermaidPromise: Promise<any> | null = null;

function getMermaidInstance(): Promise<any> {
  if (_mermaidPromise) return _mermaidPromise;

  _mermaidPromise = import("mermaid").then((m) => {
    const mermaidInstance = m.default || m;
    mermaidInstance.initialize({ startOnLoad: false, theme: "neutral" });
    return mermaidInstance;
  });

  return _mermaidPromise;
}
