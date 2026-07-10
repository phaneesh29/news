"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Split, 
  Eye, 
  Edit2, 
  Trash2, 
  Newspaper,
  Maximize2,
  Minimize2,
  Printer,
  Sparkles,
  FileDown
} from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const DEFAULT_SAMPLE_MD = `# 📰 Archival Intelligence Dispatch
> **Status**: Verified Gateway Encryption Active
> **Priority**: Critical Clearance Level

Welcome to the **Premium Markdown Previewer**. This utility allows you to draft, preview, and audit documents using the editorial design system of *DevBits Chronicles*.

---

## 🛠️ Integrated Feature Dossier
Here is a demonstration of the formatting capabilities:

1. **Rich Typography**: Styled headings, blockquotes, and lists.
2. **Mermaid Diagrams**: Dynamic rendering of flowcharts, sequence diagrams, and mindmaps.
3. **Interactive Codeblocks**: Syntax highlighting using theme-specific variables.
4. **Mathematical Expressions**: LaTeX rendering support via KaTeX.

### 📊 Process Flow Diagram (Mermaid)

\`\`\`mermaid
graph TD
    A[Markdown Text Input] -->|Parsing AST| B(Remark / Rehype AST)
    B -->|Ignore Code Blocks| C{Is Mermaid?}
    C -->|Yes| D[Render via Mermaid.js]
    C -->|No| E[Apply Highlight.js]
    D --> F[Inject SVG Vector Node]
    E --> G[Inject Highlighted Code]
    F & G --> H[Display Premium Article Preview]
\`\`\`

### 🧠 Mathematical Formula
The quadratic formula is rendered inline as $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ or as a block:

$$
I(\\theta) = \\int_{-\\infty}^{\\infty} e^{-\\theta x^2} \\, dx = \\sqrt{\\frac{\\pi}{\\theta}}
$$

### 💻 Code Snippet
Here is an example JavaScript class:

\`\`\`javascript
class CourierGateway {
  constructor(clearance) {
    this.clearance = clearance;
  }
  
  verify() {
    return this.clearance >= 4;
  }
}
\`\`\`

### 📋 Technical Metadata Matrix

| Dispatch ID | Node Source | Latency | Authorization |
| :--- | :--- | :--- | :--- |
| DB-402 | US-EAST-4 | \`12ms\` | **GRANTED** |
| DB-908 | EU-WEST-1 | \`84ms\` | *PENDING* |
| DB-112 | AP-NE-2 | \`198ms\` | **DENIED** |

---
`;

export default function MarkdownPreviewer() {
  // State Variables
  const [markdown, setMarkdown] = useState(DEFAULT_SAMPLE_MD);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  
  // Resizing Panel Width state
  const [splitWidth, setSplitWidth] = useState(50); // percentage

  // Gutter/Line Numbers computed dynamically
  const lineNumbers = useMemo(() => {
    const lines = markdown.split("\n").length;
    return Array.from({ length: Math.max(1, lines) }, (_, i) => i + 1);
  }, [markdown]);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  
  const isScrollingEditor = useRef(false);
  const isScrollingPreview = useRef(false);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Clamp panels between 15% and 85% to prevent complete collapse
      if (newWidth >= 15 && newWidth <= 85) {
        setSplitWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // Sync scroll between Editor and Gutter, and optionally Preview
  const handleEditorScroll = () => {
    const editor = editorRef.current;
    const gutter = gutterRef.current;
    const preview = previewRef.current;
    
    if (editor) {
      // Keep line numbers aligned
      if (gutter) {
        gutter.scrollTop = editor.scrollTop;
      }
      
      // Keep preview aligned in split mode
      if (viewMode === "split" && preview && !isScrollingPreview.current) {
        isScrollingEditor.current = true;
        const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
        preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
        
        setTimeout(() => {
          isScrollingEditor.current = false;
        }, 50);
      }
    }
  };

  const handlePreviewScroll = () => {
    const editor = editorRef.current;
    const preview = previewRef.current;
    
    if (viewMode === "split" && editor && preview && !isScrollingEditor.current) {
      isScrollingPreview.current = true;
      const scrollPercentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);
      
      setTimeout(() => {
        isScrollingPreview.current = false;
      }, 50);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Drag and Drop File Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setMarkdown(String(event.target.result));
          }
        };
        reader.readAsText(file);
      } else {
        alert("Please drop a markdown (.md) or plain text (.txt) file.");
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMarkdown(String(event.target.result));
        }
      };
      reader.readAsText(file);
    }
  };

  // Tab key support inside textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newValue = markdown.substring(0, start) + "  " + markdown.substring(end);
      setMarkdown(newValue);
      
      // Set cursor position after state update
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  // Stats Calculations
  const stats = useMemo(() => {
    const charCount = markdown.length;
    const wordCount = markdown.trim() === "" ? 0 : markdown.trim().split(/\s+/).length;
    const lines = markdown.split("\n").length;
    const readTime = Math.ceil(wordCount / 200);
    return { charCount, wordCount, lines, readTime };
  }, [markdown]);

  // Actions
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHtml = () => {
    const previewEl = document.getElementById("printable-preview-area");
    if (!previewEl) return;
    navigator.clipboard.writeText(previewEl.innerHTML);
    alert("HTML code copied to clipboard!");
  };

  const downloadMd = () => {
    const element = document.createElement("a");
    const file = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "dispatch-draft.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setExportDropdownOpen(false);
  };

  const downloadHtml = () => {
    const previewEl = document.getElementById("printable-preview-area");
    if (!previewEl) return;
    
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Markdown Dispatch Export</title>
  <style>
    body {
      font-family: Georgia, serif;
      line-height: 1.75;
      padding: 3rem 2rem;
      max-width: 800px;
      margin: 0 auto;
      background-color: #faf9f5;
      color: #141413;
    }
    h1, h2, h3, h4 {
      font-family: Georgia, serif;
      font-weight: 900;
      color: #cc785c;
      margin-top: 2rem;
      margin-bottom: 1rem;
      line-height: 1.3;
      text-transform: uppercase;
    }
    h1 { border-bottom: 3px double #cc785c; padding-bottom: 0.5rem; font-size: 2.2rem; }
    h2 { border-bottom: 1px solid #e6dfd8; padding-bottom: 0.25rem; font-size: 1.6rem; }
    h3 { font-size: 1.3rem; }
    p { margin-bottom: 1.5rem; text-align: justify; }
    blockquote { border-left: 4px solid #cc785c; padding-left: 1.25rem; margin: 1.5rem 0; font-style: italic; color: #6c6a64; }
    pre { background: #efe9de; padding: 1.25rem; overflow-x: auto; border: 2px solid #141413; font-family: monospace; font-size: 0.9rem; }
    code { font-family: monospace; font-size: 0.9em; background-color: #efe9de; padding: 0.1rem 0.3rem; border-radius: 3px; }
    table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
    th, td { border: 1px solid #e6dfd8; padding: 0.6rem; text-align: left; }
    th { background-color: #efe9de; font-weight: bold; }
    img { max-width: 100%; height: auto; }
    hr { border: 0; border-top: 2px double #e6dfd8; margin: 2rem 0; }
  </style>
</head>
<body>
  ${previewEl.innerHTML}
</body>
</html>`;

    const element = document.createElement("a");
    const file = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "dispatch-draft.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setExportDropdownOpen(false);
  };

  const handlePrint = () => {
    window.print();
    setExportDropdownOpen(false);
  };

  // Config custom styles to match Docs/Blog aesthetics
  const customMarkdownComponents = useMemo(() => {
    return {
      h1({ children, ...props }: React.ComponentPropsWithoutRef<"h1">) {
        return (
          <h1 {...props} className="scroll-mt-24 font-serif font-black text-2xl sm:text-3xl tracking-tight text-inherit mt-8 mb-4 pb-2 border-b-2 border-double border-current/30 w-full uppercase font-newspaper">
            {children}
          </h1>
        );
      },
      h2({ children, ...props }: React.ComponentPropsWithoutRef<"h2">) {
        return (
          <h2 {...props} className="scroll-mt-24 font-serif font-black italic text-xl sm:text-2xl tracking-tight text-inherit mt-6 mb-3 pb-1.5 border-b border-current/15 w-full font-newspaper">
            {children}
          </h2>
        );
      },
      h3({ children, ...props }: React.ComponentPropsWithoutRef<"h3">) {
        return (
          <h3 {...props} className="scroll-mt-24 font-serif font-bold text-lg sm:text-xl tracking-tight text-[#cc785c] mt-5 mb-2 w-full font-newspaper">
            {children}
          </h3>
        );
      },
    };
  }, []);

  return (
    <div className={`flex flex-col bg-background text-foreground overflow-hidden font-newspaper selection:bg-[#cc785c]/35 selection:text-black ${
      isFullscreen ? "fixed inset-0 z-50 h-screen w-screen" : "h-[calc(100vh-0px)]"
    } ${isResizing ? "cursor-col-resize select-none" : ""}`}>
      {/* Dynamic print-only style overrides */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* Hide all elements on body */
          body * {
            visibility: hidden !important;
          }
          /* Show only the target preview area and its children */
          #printable-preview-area, #printable-preview-area * {
            visibility: visible !important;
          }
          /* Position printable area at top-left and ensure it fills the page */
          #printable-preview-area {
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Break container height restrictions during print */
          html, body, #devbits-settings-root, main, div {
            height: auto !important;
            overflow: visible !important;
          }
        }
      `}} />

      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div 
          className="fixed inset-0 z-50 bg-[#cc785c]/10 backdrop-blur-xs flex flex-col items-center justify-center border-8 border-dashed border-[#cc785c] no-print"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-[#fcfaf2] dark:bg-[#252320] border-4 border-[#111111] dark:border-[#e6dfd8] p-12 text-center vintage-shadow max-w-md pointer-events-none">
            <Upload className="h-16 w-16 text-[#cc785c] mx-auto mb-4 animate-bounce" />
            <h2 className="font-blackletter text-3xl mb-2">Drop Markdown File</h2>
            <p className="font-mono text-xs opacity-70">
              Release to load content directly into the draft terminal
            </p>
          </div>
        </div>
      )}

      {/* Main Tool Bar */}
      <header className="flex flex-col md:flex-row items-center justify-between px-4 py-3 shrink-0 border-b-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] gap-4 z-10 no-print select-none">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/tools" className="flex items-center gap-1 hover:text-[#cc785c] transition-colors pr-3 border-r-2 border-current/20 text-[10px] font-mono uppercase tracking-wider">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <div>
            <h1 className="font-blackletter text-xl tracking-wide text-[#cc785c] flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Markdown Dispatch Previewer
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-wider opacity-60">
              Retro Editorial & Mermaid Compositor
            </p>
          </div>
        </div>

        {/* Toolbar Center / Mode Switches */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-start md:justify-center">
          <div className="flex rounded-none border-2 border-current p-0.5 bg-background select-none">
            <button
              onClick={() => setViewMode("split")}
              className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewMode === "split" ? "bg-[#cc785c] text-white" : "hover:bg-[#cc785c]/10 text-current"
              }`}
              title="Split Screen"
            >
              <Split className="h-3 w-3" />
              Split
            </button>
            <button
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewMode === "edit" ? "bg-[#cc785c] text-white" : "hover:bg-[#cc785c]/10 text-current"
              }`}
              title="Edit Mode"
            >
              <Edit2 className="h-3 w-3" />
              Draft
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                viewMode === "preview" ? "bg-[#cc785c] text-white" : "hover:bg-[#cc785c]/10 text-current"
              }`}
              title="Preview Mode"
            >
              <Eye className="h-3 w-3" />
              Proof
            </button>
          </div>
        </div>

        {/* Toolbar Right / Document Actions */}
        <div className="flex items-center justify-end gap-2 w-full md:w-auto">
          {/* Load Sample & Clear */}
          <button
            onClick={() => setMarkdown(DEFAULT_SAMPLE_MD)}
            className="border-2 border-current px-3 py-1.5 font-mono text-[10px] font-bold uppercase hover:text-[#cc785c] hover:border-[#cc785c] hover:bg-[#cc785c]/10 transition-colors duration-150 flex items-center gap-1.5 bg-transparent"
            title="Load Demo template"
          >
            <Sparkles className="h-3 w-3" />
            Sample
          </button>
          
          <button
            onClick={() => {
              if (confirm("Clear current draft?")) setMarkdown("");
            }}
            className="border-2 border-current px-3 py-1.5 font-mono text-[10px] font-bold uppercase hover:bg-red-800 hover:text-white hover:border-red-800 transition-colors flex items-center gap-1.5 text-red-700 dark:text-red-400 bg-transparent"
            title="Clear manuscript"
          >
            <Trash2 className="h-3 w-3" />
            Clear
          </button>

          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-current px-3 py-1.5 font-mono text-[10px] font-bold uppercase hover:text-[#cc785c] hover:border-[#cc785c] hover:bg-[#cc785c]/10 transition-colors duration-150 flex items-center gap-1.5 bg-transparent"
            title="Import Markdown file"
          >
            <Upload className="h-3.5 w-3.5" />
            Import
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".md,.txt" 
            className="hidden" 
          />

          {/* Copy Button */}
          <button
            onClick={handleCopyMarkdown}
            className="border-2 border-current px-3 py-1.5 font-mono text-[10px] font-bold uppercase hover:text-[#cc785c] hover:border-[#cc785c] hover:bg-[#cc785c]/10 transition-colors duration-150 flex items-center gap-1.5 bg-transparent"
            title="Copy Markdown Source"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#5db872]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Source
              </>
            )}
          </button>

          {/* Export Dropdown Trigger */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="border-2 border-current px-3 py-1.5 font-mono text-[10px] font-bold uppercase hover:text-[#cc785c] hover:border-[#cc785c] hover:bg-[#cc785c]/10 transition-colors duration-150 flex items-center gap-1.5 bg-transparent"
              title="Export File"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 border-2 border-current bg-background divide-y-2 divide-current/10 shadow-[4px_4px_0px_#111111] z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={downloadMd}
                  className="w-full text-left px-4 py-2 font-mono text-[10px] font-bold uppercase hover:text-[#cc785c] hover:bg-[#cc785c]/10 flex items-center gap-2 transition-colors duration-150"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Markdown (.md)
                </button>
                <button
                  onClick={downloadHtml}
                  className="w-full text-left px-4 py-2 font-mono text-[10px] font-bold uppercase hover:text-[#cc785c] hover:bg-[#cc785c]/10 flex items-center gap-2 transition-colors duration-150"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  Static HTML (.html)
                </button>
                <button
                  onClick={handleCopyHtml}
                  className="w-full text-left px-4 py-2 font-mono text-[10px] font-bold uppercase hover:text-[#cc785c] hover:bg-[#cc785c]/10 flex items-center gap-2 transition-colors duration-150"
                >
                  <Copy className="h-3.5 w-3.5" />
                  HTML Content
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full text-left px-4 py-2 font-mono text-[10px] font-bold uppercase hover:text-[#cc785c] hover:bg-[#cc785c]/10 flex items-center gap-2 border-t border-current/10 transition-colors duration-150"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Save PDF
                </button>
              </div>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="border-2 border-current px-2.5 py-1.5 font-mono text-[10px] font-bold hover:text-[#cc785c] hover:border-[#cc785c] hover:bg-[#cc785c]/10 transition-colors duration-150 flex items-center bg-transparent"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </header>

      {/* Editor & Preview Pane Workspace */}
      <main ref={containerRef} className="flex-1 flex min-h-0 relative select-text bg-[#faf9f5] dark:bg-[#181715]">
        
        {/* Editor Area (Visible in 'split' and 'edit' modes) */}
        {(viewMode === "split" || viewMode === "edit") && (
          <div 
            className="flex flex-col h-full min-w-0 bg-[#fdfdfc] dark:bg-[#1a1917] relative"
            style={{ 
              width: viewMode === "split" ? `${splitWidth}%` : "100%",
              flexGrow: 0,
              flexShrink: 0
            }}
          >
            {/* Panel Label */}
            <div className="px-4 py-1.5 bg-[#fcfaf2] dark:bg-[#252320] border-b-2 border-current/25 font-mono text-[9px] uppercase tracking-wider text-current/60 flex items-center justify-between shrink-0 select-none">
              <span>MANUSCRIPT TERMINAL</span>
              <span>UTF-8</span>
            </div>

            {/* Input Gutter + Textarea */}
            <div className="flex-1 flex min-h-0 relative">
              {/* Line Numbers Gutter */}
              <div 
                ref={gutterRef}
                className="w-11 bg-[#efe9de]/40 dark:bg-[#252320]/20 border-r-2 border-current/10 font-mono text-[10px] text-current/30 text-right pr-2 py-4 select-none overflow-hidden h-full leading-[1.6]"
              >
                {lineNumbers.map((num) => (
                  <div key={num}>{num}</div>
                ))}
              </div>

              {/* Textarea Input */}
              <textarea
                ref={editorRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onScroll={handleEditorScroll}
                onKeyDown={handleKeyDown}
                placeholder="Compose your markdown manuscript here..."
                className="flex-1 h-full p-4 font-mono text-sm leading-[1.6] bg-transparent border-none resize-none focus:outline-none focus:ring-0 overflow-y-auto selection:bg-[#cc785c]/35 selection:text-black select-text text-foreground [scrollbar-width:thin]"
                style={{ tabSize: 2 }}
              />
            </div>
          </div>
        )}

        {/* Separator Line (Only in Split View) */}
        {viewMode === "split" && (
          <div 
            onMouseDown={startResizing}
            className="w-2.5 self-stretch cursor-col-resize shrink-0 select-none no-print relative group flex items-center justify-center transition-colors hover:bg-[#cc785c]/25 active:bg-[#cc785c]/40 z-10 font-sans"
            title="Drag to resize panels"
          >
            <div className="w-0.5 h-16 bg-current/20 group-hover:bg-[#cc785c] group-active:bg-[#cc785c] transition-colors" />
          </div>
        )}

        {/* Preview Area (Visible in 'split' and 'preview' modes) */}
        {(viewMode === "split" || viewMode === "preview") && (
          <div 
            className="flex flex-col h-full min-w-0 bg-[#faf9f5] dark:bg-[#181715] relative"
            style={{ 
              width: viewMode === "split" ? `${100 - splitWidth}%` : "100%",
              flexGrow: 0,
              flexShrink: 0
            }}
          >
            {/* Panel Label */}
            <div className="px-4 py-1.5 bg-[#fcfaf2] dark:bg-[#252320] border-b-2 border-current/25 font-mono text-[9px] uppercase tracking-wider text-current/60 flex items-center justify-between shrink-0 select-none">
              <span>EDITORIAL PROOF</span>
              <span>STANDARD DOCUMENT</span>
            </div>

            {/* Rendered View */}
            <div 
              ref={previewRef}
              onScroll={handlePreviewScroll}
              className="flex-1 overflow-y-auto p-8 md:p-12 [scrollbar-width:thin] select-text"
            >
              {markdown.trim() === "" ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-45 select-none py-12">
                  <FileText className="h-12 w-12 mb-3 stroke-1" />
                  <p className="font-serif italic text-base">The dispatch manuscript is currently empty.</p>
                  <p className="font-mono text-[10px] mt-1 uppercase">Enter markdown on the left to output formatted proof</p>
                </div>
              ) : (
                <div 
                  id="printable-preview-area"
                  className="markdown-content text-inherit text-sm md:text-base leading-relaxed font-serif prose dark:prose-invert py-4 selection:bg-[#cc785c]/35 selection:text-black"
                >
                  <MarkdownRenderer
                    content={markdown}
                    components={customMarkdownComponents}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Live Status Bar */}
      <footer className="bg-[#111111] text-[#faf9f5] border-t-2 border-[#111111] dark:border-[#e6dfd8] px-4 py-1.5 flex flex-wrap items-center justify-between font-mono text-[9px] uppercase tracking-wider shrink-0 select-none z-10 no-print">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-[#cc785c]">
            <span className="h-1.5 w-1.5 bg-[#cc785c] rounded-full animate-pulse" />
            ENGINE STANDBY
          </span>
          <span>Lines: {stats.lines}</span>
          <span>Words: {stats.wordCount}</span>
          <span>Chars: {stats.charCount}</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span>Speed: CLIENT-SIDE INSTANT</span>
          <span>Est. Reading: {stats.readTime} min</span>
          <span className="text-[#cc785c]">GFM Document Style</span>
        </div>
      </footer>
    </div>
  );
}
