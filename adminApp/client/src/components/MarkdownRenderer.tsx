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
    return <div className="mermaid-rendered my-4" dangerouslySetInnerHTML={{ __html: svg }} />;
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
