"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import { useEffect, useRef, useState, useMemo } from "react";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";

const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS: any[] = [
  rehypeIgnoreMermaid,
  rehypeKatex,
  rehypeSlug,
  [rehypeAutolinkHeadings, { behavior: "wrap" }],
  rehypeHighlight,
];

// --- Custom Client-Side Mermaid Renderer ---
function Mermaid({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(50);

  useEffect(() => {
    let active = true;
    const renderChart = async () => {
      if (!containerRef.current) return;
      try {
        const m = (await import("mermaid")).default;
        m.initialize({ startOnLoad: false, theme: "neutral" });
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg: renderedSvg } = await m.render(id, chart);
        if (active) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        console.error("[Mermaid] Render failed:", err);
        if (active) {
          setError(err.message || String(err));
        }
      }
    };
    renderChart();
    return () => {
      active = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 my-2 border border-red-200 bg-red-50 text-red-700 rounded text-xs">
        <strong className="font-semibold block mb-1">Mermaid Syntax Error:</strong>
        <pre className="whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  if (svg) {
    return (
      <div className="relative group border-2 border-stone-950 rounded p-4 my-4 bg-[#fcfaf2] select-none shadow-[4px_4px_0px_#111111]">
        <style>{`
          .mermaid-svg-container svg {
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
          }
        `}</style>

        {/* Floating Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#fcfaf2] px-2 py-1 rounded-full border-2 border-stone-950 shadow-[2px_2px_0px_#111111] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => setZoom(prev => Math.max(25, prev - 25))}
            className="p-1 text-stone-800 hover:text-stone-950 hover:bg-stone-200/60 rounded-full transition-colors duration-150"
            title="Zoom Out"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
          <span className="text-[10px] font-mono font-bold px-1 text-stone-900 min-w-[36px] text-center select-none">
            {zoom}%
          </span>
          <button 
            onClick={() => setZoom(prev => Math.min(300, prev + 25))}
            className="p-1.5 text-stone-800 hover:text-stone-950 hover:bg-stone-200/60 rounded-full transition-colors duration-150"
            title="Zoom In"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button 
            onClick={() => setZoom(50)}
            className="p-1.5 text-stone-800 hover:text-stone-950 hover:bg-stone-200/60 rounded-full transition-colors duration-150"
            title="Reset Zoom"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>

        {/* Scroll wrapper */}
        <div className="w-full overflow-auto [scrollbar-width:thin] py-2 flex justify-start">
          <div 
            className="mermaid-svg-container transition-all duration-150"
            style={{ 
              width: `${zoom}%`,
              maxWidth: "none",
              flexShrink: 0,
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="animate-pulse bg-stone-100 dark:bg-stone-800 h-24 rounded flex items-center justify-center text-xs text-stone-500 my-4">
      Rendering diagram...
    </div>
  );
}

// --- Custom Rehype Plugin to isolate Mermaid block from rehype-pretty-code ---
function rehypeIgnoreMermaid() {
  return (tree: any) => {
    const walk = (node: any) => {
      if (!node || !node.children) return;

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (
          child.type === "element" &&
          child.tagName === "pre" &&
          child.children &&
          child.children.length > 0 &&
          child.children[0].tagName === "code"
        ) {
          const codeNode = child.children[0];
          const className = codeNode.properties?.className || [];
          if (className.includes("language-mermaid")) {
            const rawCode = codeNode.children?.[0]?.value || "";
            // Replace the <pre> node with our custom div
            node.children[i] = {
              type: "element",
              tagName: "div",
              properties: {
                className: ["mermaid-raw"],
                "data-code": encodeURIComponent(rawCode),
              },
              children: [{ type: "text", value: rawCode }],
            };
            continue;
          }
        }
        walk(child);
      }
    };
    walk(tree);
  };
}

interface MarkdownRendererProps {
  content: string;
  components?: any;
}

export default function MarkdownRenderer({ content, components }: MarkdownRendererProps) {
  const mergedComponents = useMemo(() => ({
    div({ className, children, ...props }: any) {
      if (className?.includes("mermaid-raw")) {
        const chart = decodeURIComponent(props["data-code"] || "");
        return <Mermaid chart={chart} />;
      }
      return <div className={className} {...props}>{children}</div>;
    },
    ...components,
  }), [components]);

  return (
    <ReactMarkdown
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={mergedComponents}
    >
      {content}
    </ReactMarkdown>
  );
}
