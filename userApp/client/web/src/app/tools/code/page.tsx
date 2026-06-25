"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import JSZip from "jszip";
import { Loader2, Power, Code2, SquareTerminal, File, Folder, Plus, FilePlus, FolderPlus, X, ChevronUp, ChevronDown, ChevronRight, Play, Trash2, LayoutTemplate, ArrowLeft, RefreshCw, Download, Upload, FolderUp, Copy, GitBranch } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { WebContainer } from "@webcontainer/api";
import { setupTypeAcquisition } from "@typescript/ata";
import ts from "typescript";



type FSNode = { name: string; isDirectory: boolean; path: string; depth: number };

type ContextMenuState = {
  x: number;
  y: number;
  type: 'explorer-file' | 'explorer-bg' | 'terminal';
  path?: string;
} | null;

export default function NodeSandbox() {
  const [bootStatus, setBootStatus] = useState<"idle" | "booting" | "ready" | "error">("idle");
  const [files, setFiles] = useState<FSNode[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [code, setCode] = useState("");
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder" | null>(null);

  // Terminal UI State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(250); // pixels
  const [sidebarWidth, setSidebarWidth] = useState(256); // pixels

  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubRepoInput, setGithubRepoInput] = useState('');
  const [tooltip, setTooltip] = useState<{ text: string, x: number, y: number } | null>(null);

  const handleMouseEnter = (text: string) => (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text,
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8
    });
  };
  const handleMouseLeave = () => setTooltip(null);
  
  const [collapsedFolders, setCollapsedFolders] = useState<Set<string>>(new Set());
  const ataRef = useRef<((code: string) => void) | null>(null);

  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const wcRef = useRef<WebContainer | null>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);


  useEffect(() => {
    return () => {
      killSandbox();
    };
  }, []);

  
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.crossOriginIsolated) {
      window.location.reload();
    }
  }, []);

  // Whenever terminal is toggled or resized, fit the xterm
  useEffect(() => {
    if (isTerminalOpen && fitAddonRef.current) {
      // Slight delay to ensure DOM is rendered before fitting
      setTimeout(() => fitAddonRef.current?.fit(), 50);
    }
  }, [isTerminalOpen, terminalHeight]);

  const killSandbox = () => {
    if (wcRef.current) {
      console.log("Tearing down WebContainer...");
      wcRef.current.teardown();
      wcRef.current = null;
    }
    if (xtermRef.current) {
      xtermRef.current.dispose();
      xtermRef.current = null;
    }
    setBootStatus("idle");
    setFiles([]);
    setIsTerminalOpen(false);
    setServerUrl(null);
  };

  const loadFileSystem = useCallback(async (dirPath: string = '/', depth: number = 0) => {
    if (!wcRef.current) return [];
    try {
      const entries = await wcRef.current.fs.readdir(dirPath, { withFileTypes: true });
      let result: FSNode[] = [];
      
      entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
      });

      for (const entry of entries) {
        if (entry.name === "node_modules" || entry.name === ".next") continue;
        const fullPath = dirPath === '/' ? `/${entry.name}` : `${dirPath}/${entry.name}`;
        
        result.push({ name: entry.name, isDirectory: entry.isDirectory(), path: fullPath, depth });
        
        if (entry.isDirectory()) {
          const subFiles = await loadFileSystem(fullPath, depth + 1);
          result = result.concat(subFiles);
        }
      }
      return result;
    } catch (err) {
      console.error("Failed to read dir:", err);
      return [];
    }
  }, []);

  const refreshFiles = useCallback(async () => {
    const fsTree = await loadFileSystem();
    setFiles(fsTree);
  }, [loadFileSystem]);

  const currentFileRef = useRef(currentFile);
  useEffect(() => {
    currentFileRef.current = currentFile;
  }, [currentFile]);

  // Poll files every 2 seconds to keep explorer and editor in sync with terminal changes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (bootStatus === "ready") {
      interval = setInterval(async () => {
        const fsTree = await loadFileSystem();
        setFiles(fsTree);
        
        // If files were deleted from terminal, update open files
        setOpenFiles(prev => {
          const next = prev.filter(p => fsTree.some(f => f.path === p));
          if (currentFileRef.current && !next.includes(currentFileRef.current)) {
            setCurrentFile("");
            setCode("");
          }
          return next;
        });
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [bootStatus, loadFileSystem]);

  const bootContainer = async () => {
    if (wcRef.current) return;
    setBootStatus("booting");

    try {
      const wc = await WebContainer.boot();
      wcRef.current = wc;

      await wc.mount({});

      wc.on('server-ready', (port, url) => {
        setServerUrl(url);
        console.log(`Server ready on port ${port} at ${url}`);
      });

      // We wait to initialize terminal until the user opens it or we just create it invisibly
      setIsTerminalOpen(true);

      await refreshFiles();
      setBootStatus("ready");
    } catch (err) {
      console.error("WebContainer boot failed:", err);
      setBootStatus("error");
    }
  };

  // Initialize terminal when container is ready AND terminal div is mounted
  useEffect(() => {
    const initTerminal = async () => {
      if (bootStatus === "ready" && wcRef.current && terminalRef.current && !xtermRef.current) {
        const terminal = new Terminal({
          convertEol: true,
          theme: { background: "#0a0400", foreground: "#fcfaf2", cursor: "#cc785c" },
          fontSize: 13,
          fontFamily: 'monospace, "Courier New"'
        });
        const fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);
        terminal.open(terminalRef.current);
        fitAddon.fit();
        
        xtermRef.current = terminal;
        fitAddonRef.current = fitAddon;

        const shellProcess = await wcRef.current.spawn('jsh');
        
        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              terminal.write(data);
            }
          })
        ).catch((err) => {
          console.log("Terminal output stream closed:", err?.message || err);
        });

        const inputWriter = shellProcess.input.getWriter();
        terminal.onData((data) => {
          inputWriter.write(data);
        });

        const resizeObserver = new ResizeObserver(() => {
          fitAddon.fit();
        });
        resizeObserver.observe(terminalRef.current);
      }
    };

    if (isTerminalOpen) {
      initTerminal();
    }
  }, [bootStatus, isTerminalOpen]);

  const handleFileSelect = async (path: string, isDirectory: boolean) => {
    if (isDirectory) {
      setCollapsedFolders(prev => {
        const next = new Set(prev);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
      return;
    }
    if (!wcRef.current) return;
    try {
      const content = await wcRef.current.fs.readFile(path, 'utf-8');
      setOpenFiles(prev => prev.includes(path) ? prev : [...prev, path]);
      setCurrentFile(path);
      setCode(content);
      setActiveTab("editor");
    } catch (err) {
      console.error("Failed to open file", err);
    }
  };

  const handleTabSelect = async (path: string) => {
    if (!wcRef.current) return;
    try {
      const content = await wcRef.current.fs.readFile(path, 'utf-8');
      setCurrentFile(path);
      setCode(content);
      setActiveTab("editor");
    } catch (err) {
      console.error("Failed to open file", err);
    }
  };

  const handleTabClose = (e: React.MouseEvent, path: string) => {
    e.stopPropagation();
    setOpenFiles(prev => {
      const next = prev.filter(p => p !== path);
      if (currentFile === path) {
        if (next.length > 0) {
          handleTabSelect(next[next.length - 1]);
        } else {
          setCurrentFile("");
          setCode("");
        }
      }
      return next;
    });
  };

  const downloadProjectAsZip = async () => {
    if (!wcRef.current) return;
    try {
      const zip = new JSZip();
      
      const readDirToZip = async (dirPath: string, zipFolder: JSZip) => {
        const entries = await wcRef.current!.fs.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name === "node_modules" || entry.name === ".next" || entry.name === ".git") continue;
          const fullPath = dirPath === "/" ? `/${entry.name}` : `${dirPath}/${entry.name}`;
          if (entry.isDirectory()) {
            const subFolder = zipFolder.folder(entry.name);
            if (subFolder) await readDirToZip(fullPath, subFolder);
          } else {
            const content = await wcRef.current!.fs.readFile(fullPath);
            zipFolder.file(entry.name, content);
          }
        }
      };
      
      await readDirToZip("/", zip);
      const blob = await zip.generateAsync({ type: "blob" });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sandbox-project.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download zip", err);
    }
  };

  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || "";
    setCode(newCode);
    if (wcRef.current && currentFile) {
      wcRef.current.fs.writeFile(currentFile, newCode).catch(console.error);
    }
    
    if (ataRef.current && (currentFile.endsWith('.js') || currentFile.endsWith('.ts') || currentFile.endsWith('.jsx') || currentFile.endsWith('.tsx'))) {
      ataRef.current(newCode);
    }
  };

  const handleCreateItem = async () => {
    if (!wcRef.current || !newItemName || !newItemType) return;
    try {
      const targetPath = `/${newItemName}`;
      if (newItemType === "folder") {
        await wcRef.current.fs.mkdir(targetPath);
      } else {
        await wcRef.current.fs.writeFile(targetPath, "");
        setOpenFiles(prev => prev.includes(targetPath) ? prev : [...prev, targetPath]);
        setCurrentFile(targetPath);
        setCode("");
      }
      setNewItemName("");
      setNewItemType(null);
      await refreshFiles();
    } catch (err) {
      console.error(`Failed to create ${newItemType}`, err);
    }
  };

  const handleDeleteFile = async (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!wcRef.current) return;
    try {
      await wcRef.current.fs.rm(path, { recursive: true });
      setOpenFiles(prev => {
        const next = prev.filter(p => !p.startsWith(path));
        if (currentFile.startsWith(path)) {
          if (next.length > 0) {
            handleTabSelect(next[next.length - 1]);
          } else {
            setCurrentFile("");
            setCode("");
          }
        }
        return next;
      });
      await refreshFiles();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };



  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processEntry = async (entry: any, path: string) => {
    if (!wcRef.current) return;
    
    if (entry.isFile) {
      const file = await new Promise<File>((resolve) => entry.file(resolve));
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await wcRef.current.fs.writeFile(path === '' ? `/${file.name}` : `${path}/${file.name}`, uint8Array);
    } else if (entry.isDirectory) {
      const dirPath = path === '' ? `/${entry.name}` : `${path}/${entry.name}`;
      try {
        await wcRef.current.fs.mkdir(dirPath);
      } catch (e) { /* ignore if exists */ }
      
      const dirReader = entry.createReader();
      const readEntries = async () => {
        let allEntries: any[] = [];
        let hasMore = true;
        while (hasMore) {
          const entries = await new Promise<any[]>((resolve) => {
            dirReader.readEntries(resolve);
          });
          if (entries.length === 0) {
            hasMore = false;
          } else {
            allEntries = allEntries.concat(entries);
          }
        }
        return allEntries;
      };
      
      const entries = await readEntries();
      for (const childEntry of entries) {
        await processEntry(childEntry, dirPath);
      }
    }
  };

  const confirmGithubImport = async () => {
    const repo = githubRepoInput.trim();
    if (!repo) return;
    if (!wcRef.current) return;
    setShowGithubModal(false);
    setGithubRepoInput('');
    
    let repoPath = repo;
    try {
      if (repo.includes('github.com/')) {
        const url = new URL(repo.startsWith('http') ? repo : `https://${repo}`);
        const parts = url.pathname.split('/').filter(Boolean);
        if (parts.length >= 2) {
          repoPath = `${parts[0]}/${parts[1]}`;
        }
      }
    } catch(e) {}
    
    try {
      setIsImporting(true);
      if (xtermRef.current) {
        xtermRef.current.write(`\r\n\x1b[36mImporting ${repoPath} from GitHub...\x1b[0m\r\n`);
      }
      
      const apiRes = await fetch(`https://api.github.com/repos/${repoPath}`);
      if (!apiRes.ok) throw new Error("Repository not found or private");
      const repoData = await apiRes.json();
      const branch = repoData.default_branch || 'main';
      
      if (xtermRef.current) xtermRef.current.write(`\x1b[36mDownloading zip archive...\x1b[0m\r\n`);
      const zipUrl = `https://corsproxy.io/?${encodeURIComponent(`https://codeload.github.com/${repoPath}/zip/refs/heads/${branch}`)}`;
      const zipRes = await fetch(zipUrl);
      if (!zipRes.ok) throw new Error("Failed to download repository archive");
      const arrayBuffer = await zipRes.arrayBuffer();
      
      if (xtermRef.current) xtermRef.current.write(`\x1b[36mExtracting files...\x1b[0m\r\n`);
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      for (const relativePath in zip.files) {
        const file = zip.files[relativePath];
        const parts = relativePath.split('/');
        parts.shift();
        const cleanPath = parts.join('/');
        if (!cleanPath) continue;
        if (file.dir) {
          await wcRef.current.fs.mkdir(cleanPath, { recursive: true });
        }
      }
      
      for (const relativePath in zip.files) {
        const file = zip.files[relativePath];
        const parts = relativePath.split('/');
        parts.shift();
        const cleanPath = parts.join('/');
        if (!cleanPath || file.dir) continue;
        
        const content = await file.async("uint8array");
        await wcRef.current.fs.writeFile(cleanPath, content);
      }
      
      await refreshFiles();
      if (xtermRef.current) xtermRef.current.write(`\r\n\x1b[32mSuccessfully imported ${repoPath}!\x1b[0m\r\n`);
    } catch (err: any) {
      console.error("Import failed", err);
      if (xtermRef.current) xtermRef.current.write(`\r\n\x1b[31mFailed to import ${repoPath}: ${err.message}\x1b[0m\r\n`);
      alert(`Failed to import repository: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!wcRef.current) return;

    const items = e.dataTransfer.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        if (entry) {
          await processEntry(entry, '');
        }
      }
    }
    await refreshFiles();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!wcRef.current || !e.target.files) return;
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const filePath = file.webkitRelativePath ? `/${file.webkitRelativePath}` : `/${file.name}`;
      
      if (file.webkitRelativePath) {
        const parts = file.webkitRelativePath.split('/');
        parts.pop(); 
        let currentPath = '';
        for (const part of parts) {
          currentPath += `/${part}`;
          try {
            await wcRef.current.fs.mkdir(currentPath);
          } catch (err) {
          }
        }
      }
      
      await wcRef.current.fs.writeFile(filePath, uint8Array);
    }
    await refreshFiles();
    if (e.target) e.target.value = '';
  };

  const getLanguage = (path: string) => {
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.py')) return 'python';
    if (path.endsWith('.log') || path.endsWith('.gitignore') || path.endsWith('.env') || path.endsWith('.txt') || path.endsWith('.md')) return 'plaintext';
    return 'javascript';
  };

  const handleEditorWillMount = (monaco: any) => {
    // 1. Configure JavaScript for Node.js
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    });

    // 2. Add basic Node.js and Express types
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
      `
      declare module 'os' { 
        function platform(): string; 
        function arch(): string; 
        function cpus(): any[]; 
        const os: { platform: typeof platform; arch: typeof arch; cpus: typeof cpus; };
        export default os;
      }
      declare module 'fs' { 
        function readFileSync(path: string, options?: any): any; 
        function writeFileSync(path: string, data: any, options?: any): void; 
        function readdirSync(path: string, options?: any): string[]; 
        function existsSync(path: string): boolean;
        function statSync(path: string, options?: any): any;
        namespace promises {
          function readFile(path: string, options?: any): Promise<any>;
          function writeFile(path: string, data: any, options?: any): Promise<void>;
          function readdir(path: string, options?: any): Promise<string[]>;
          function stat(path: string, options?: any): Promise<any>;
        }
        const fs: {
          readFileSync: typeof readFileSync;
          writeFileSync: typeof writeFileSync;
          readdirSync: typeof readdirSync;
          existsSync: typeof existsSync;
          statSync: typeof statSync;
          promises: typeof promises;
        };
        export default fs;
      }
      declare module 'path' { 
        function join(...paths: string[]): string; 
        function resolve(...paths: string[]): string; 
        function basename(path: string, ext?: string): string;
        function dirname(path: string): string;
        function extname(path: string): string;
        const path: {
          join: typeof join;
          resolve: typeof resolve;
          basename: typeof basename;
          dirname: typeof dirname;
          extname: typeof extname;
        };
        export default path;
      }
      `,
      'node_core.d.ts'
    );

    // 3. Add custom Python snippets (Monaco already handles HTML/CSS/JS well)
    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return {
          suggestions: [
            {
              label: 'def',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'def ${1:function_name}(${2:args}):\n\t${3:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Python Function Definition',
              range
            },
            {
              label: 'print',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'print(${1:message})',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Print statement',
              range
            },
            {
              label: 'class',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'class ${1:ClassName}:\n\tdef __init__(self):\n\t\t${2:pass}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Python Class Definition',
              range
            }
          ]
        };
      }
    });

    try {
      const ata = setupTypeAcquisition({
        projectName: 'WebContainerSandbox',
        typescript: ts,
        logger: console,
        delegate: {
          receivedFile: (code, path) => {
            monaco.languages.typescript.javascriptDefaults.addExtraLib(code, `file://${path}`);
          },
          started: () => console.log('ATA start'),
          progress: (downloaded, total) => console.log(`Got ${downloaded} out of ${total}`),
          finished: f => console.log('ATA done')
        }
      });
      ataRef.current = ata;
    } catch (e) {
      console.error("ATA setup failed", e);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    if (ataRef.current && code) {
      ataRef.current(code);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#111111] text-[#fcfaf2] overflow-hidden">
      <main className="flex-1 flex flex-col w-full h-full overflow-hidden">
        
        {/* Editor Toolbar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2 shrink-0 bg-[#1e1e1e] border-b border-black">
          <div className="flex items-center gap-3">
            <Link href="/tools" className="flex items-center gap-1 text-white/50 hover:text-[#cc785c] transition-colors pr-3 border-r border-white/10 text-[10px] font-mono uppercase tracking-wider">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            <h1 className="font-serif text-lg font-black uppercase tracking-tight font-newspaper flex items-center gap-2 text-[#cc785c]">
              <Code2 className="h-5 w-5" />
              DevBits IDE
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            {bootStatus === "ready" && (
              <button 
                onClick={downloadProjectAsZip}
                className="bg-[#1e1e1e] border border-white/20 text-white font-bold text-[10px] uppercase px-4 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-colors shadow-sm rounded-sm"
                onMouseEnter={handleMouseEnter("Download full project as .zip")} onMouseLeave={handleMouseLeave}
              >
                <Download className="h-3 w-3" />
                Export ZIP
              </button>
            )}

            {bootStatus === "idle" && (
              <button 
                onClick={bootContainer}
                className="bg-[#cc785c] text-white font-bold text-[10px] uppercase px-4 py-1.5 flex items-center gap-2 hover:bg-[#b06349] transition-colors shadow-sm rounded-sm"
              >
                <Power className="h-3 w-3" />
                Boot Engine
              </button>
            )}

            {bootStatus === "booting" && (
              <button disabled className="bg-white/10 text-white/70 font-bold text-[10px] uppercase px-4 py-1.5 flex items-center gap-2 rounded-sm cursor-wait">
                <Loader2 className="h-3 w-3 animate-spin" />
                Booting Micro-OS...
              </button>
            )}

            {bootStatus === "ready" && (
              <button 
                onClick={killSandbox}
                className="bg-red-900/80 text-white font-bold text-[10px] uppercase px-4 py-1.5 flex items-center gap-2 hover:bg-red-800 transition-colors shadow-sm border border-red-700/50 rounded-sm"
              >
                <Power className="h-3 w-3" />
                Kill Sandbox
              </button>
            )}
          </div>
        </header>

        {bootStatus === "idle" ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#141413]">
            <Code2 className="h-20 w-20 text-white/10 mb-6" />
            <h2 className="font-serif text-3xl font-black uppercase mb-3 text-white/80">Environment Offline</h2>
            <p className="font-mono text-sm text-white/50 max-w-lg text-center leading-relaxed">
              The WebAssembly runtime is currently suspended. Click the "Boot Engine" button above to allocate memory and spin up the secure client-side sandbox.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            
            {/* File Explorer Sidebar */}
            <div 
              className={`border-r border-black bg-[#181818] flex flex-col shrink-0 overflow-hidden transition-colors ${isDragging ? 'bg-[#2a2a2a] border-[#cc785c] border-2 border-dashed' : ''}`}
              style={{ width: `${sidebarWidth}px` }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="bg-[#1e1e1e] p-2 flex items-center justify-between shrink-0">
                <span className="font-mono text-[10px] text-white/50 font-bold uppercase tracking-widest">Explorer</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors"
                    onMouseEnter={handleMouseEnter("Upload File")} onMouseLeave={handleMouseLeave}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => folderInputRef.current?.click()}
                    className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors"
                    onMouseEnter={handleMouseEnter("Upload Folder")} onMouseLeave={handleMouseLeave}
                  >
                    <FolderUp className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setShowGithubModal(true)}
                    disabled={isImporting}
                    className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors disabled:opacity-50"
                    onMouseEnter={handleMouseEnter("Import from GitHub")} onMouseLeave={handleMouseLeave}
                  >
                    {isImporting ? <Loader2 className="h-3.5 w-3.5 animate-spin text-[#cc785c]" /> : <GitBranch className="h-3.5 w-3.5" />}
                  </button>
                  <button 
                    onClick={() => refreshFiles()}
                    className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors"
                    onMouseEnter={handleMouseEnter("Refresh")} onMouseLeave={handleMouseLeave}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setNewItemType(newItemType === "file" ? null : "file")}
                    className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors"
                    onMouseEnter={handleMouseEnter("New File")} onMouseLeave={handleMouseLeave}
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setNewItemType(newItemType === "folder" ? null : "folder")}
                    className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors"
                    onMouseEnter={handleMouseEnter("New Folder")} onMouseLeave={handleMouseLeave}
                  >
                    <FolderPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {newItemType && (
                <div className="p-2 border-b border-black/50 flex items-center gap-2 bg-[#cc785c]/20">
                  {newItemType === "folder" ? <Folder className="h-3 w-3 shrink-0 text-[#cc785c]" /> : <File className="h-3 w-3 shrink-0 text-[#cc785c]" />}
                  <input 
                    type="text" 
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateItem();
                      if (e.key === "Escape") setNewItemType(null);
                    }}
                    placeholder={`new ${newItemType}...`}
                    autoFocus
                    className="bg-transparent border-b border-[#cc785c] text-xs font-mono text-white w-full focus:outline-none placeholder:text-white/30"
                  />
                </div>
              )}

              <div 
                className="flex-1 overflow-y-auto py-2 space-y-px"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, type: 'explorer-bg' });
                }}
              >
                {files.filter(file => {
                  return Array.from(collapsedFolders).every(collapsed => 
                    !(file.path.startsWith(collapsed + '/') && file.path !== collapsed)
                  );
                }).map((file) => (
                  <div
                    key={file.path}
                    className={`w-full group flex items-center justify-between px-2 py-1.5 text-left font-mono text-xs transition-colors cursor-pointer ${
                      currentFile === file.path ? 'bg-[#cc785c]/20 text-[#cc785c]' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                    style={{ paddingLeft: `${(file.depth * 12) + 8}px` }}
                    onClick={() => handleFileSelect(file.path, file.isDirectory)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextMenu({ x: e.clientX, y: e.clientY, type: 'explorer-file', path: file.path });
                    }}
                  >
                    <div className="flex items-center gap-1 overflow-hidden">
                      {file.isDirectory ? (
                        <>
                          {collapsedFolders.has(file.path) ? (
                            <ChevronRight className={`h-3 w-3 shrink-0 ${currentFile === file.path ? 'text-[#cc785c]' : 'text-[#cc785c]/70'}`} />
                          ) : (
                            <ChevronDown className={`h-3 w-3 shrink-0 ${currentFile === file.path ? 'text-[#cc785c]' : 'text-[#cc785c]/70'}`} />
                          )}
                          <Folder className={`h-3.5 w-3.5 shrink-0 ${currentFile === file.path ? 'text-[#cc785c]' : 'text-[#cc785c]/70'}`} />
                        </>
                      ) : (
                        <File className="h-3.5 w-3.5 shrink-0 opacity-70 ml-[16px]" />
                      )}
                      <span className="truncate">{file.name}</span>
                    </div>
                    {file.name !== "package.json" && (
                      <button 
                        onClick={(e) => handleDeleteFile(file.path, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition-opacity"
                        onMouseEnter={handleMouseEnter("Delete")} onMouseLeave={handleMouseLeave}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Resizer Handle */}
            <div 
              className="w-1 -ml-1 cursor-ew-resize hover:bg-[#cc785c] shrink-0 z-10 transition-colors relative"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = sidebarWidth;
                
                const onMouseMove = (moveEvent: MouseEvent) => {
                  const newWidth = startWidth + (moveEvent.clientX - startX);
                  // clamp width between 150px and 800px
                  setSidebarWidth(Math.max(150, Math.min(800, newWidth)));
                };
                
                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };
                
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
            />

            {/* Middle: Editor + Terminal */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0 overflow-hidden relative">
              
              {/* Editor Tabs Area */}
              <div className="bg-[#2d2d2d] flex items-center justify-between border-b border-black shrink-0 pr-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center min-w-max">
                  {openFiles.map(path => (
                    <div 
                      key={path}
                      onClick={() => handleTabSelect(path)}
                      className={`text-[10px] font-mono px-3 py-2 border-r border-black flex items-center gap-2 transition-colors cursor-pointer group ${
                        activeTab === "editor" && currentFile === path 
                          ? "bg-[#1e1e1e] text-[#cc785c] border-t-2 border-t-[#cc785c]" 
                          : "bg-[#2d2d2d] text-white/50 hover:text-white border-t-2 border-t-transparent"
                      }`}
                    >
                      <File className="h-3 w-3" />
                      <span>{path.split('/').pop()}</span>
                      <button 
                        onClick={(e) => handleTabClose(e, path)}
                        className={`p-0.5 rounded-sm transition-colors ${
                          activeTab === "editor" && currentFile === path
                            ? "opacity-100 hover:bg-[#cc785c]/20"
                            : "opacity-0 group-hover:opacity-100 hover:bg-white/10"
                        }`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {serverUrl && (
                    <button 
                      onClick={() => setActiveTab("preview")}
                      className={`text-[10px] font-mono px-4 py-2 border-r border-black flex items-center gap-2 transition-colors shrink-0 ${
                        activeTab === "preview" ? "bg-[#1e1e1e] text-emerald-400 border-t-2 border-t-emerald-400" : "bg-[#2d2d2d] text-white/50 hover:text-white border-t-2 border-t-transparent"
                      }`}
                    >
                      <Play className="h-3 w-3" />
                      <span>Browser Preview</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Main Area (Editor or Preview) */}
              <div className="flex-1 relative overflow-hidden">
                {activeTab === "preview" && serverUrl ? (
                  <div className="w-full h-full bg-white flex flex-col">
                    <div className="bg-gray-100 border-b border-gray-300 p-2 flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 bg-white border border-gray-300 rounded px-3 py-1 text-xs font-mono text-gray-600 truncate flex items-center justify-between">
                        <span>{serverUrl}</span>
                        <button onClick={() => {
                          const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                          if (iframe) iframe.src = iframe.src;
                        }} className="hover:text-black">↻</button>
                      </div>
                    </div>
                    <iframe 
                      id="preview-iframe"
                      src={serverUrl} 
                      className="w-full flex-1 border-none bg-white" 
                      allow="cross-origin-isolated"
                    />
                  </div>
                ) : currentFile ? (
                  <Editor
                    height="100%"
                    language={getLanguage(currentFile)}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      fontFamily: '"Fira Code", monospace',
                      padding: { top: 16 },
                      lineHeight: 1.6,
                      renderLineHighlight: "all",
                      smoothScrolling: true,
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-white/20 font-mono text-sm">
                    Select a file from the explorer to view its contents.
                  </div>
                )}
              </div>

              {/* Status Bar / Terminal Toggle */}
              <div className="bg-[#007acc] text-white flex items-center justify-between px-3 py-1 font-mono text-[10px] uppercase shrink-0 select-none z-10">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1"><Code2 className="h-3 w-3" /> IDE Active</span>
                  <span>{currentFile}</span>
                </div>
                <button 
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className="flex items-center gap-1 hover:bg-white/20 px-2 py-0.5 rounded transition-colors"
                >
                  <SquareTerminal className="h-3 w-3" />
                  Terminal {isTerminalOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
                </button>
              </div>

              {/* VS Code Style Bottom Terminal Pane */}
              <div 
                className={`bg-[#1e1e1e] border-t border-black shrink-0 flex flex-col relative z-0 ${isTerminalOpen ? '' : 'hidden'}`}
                style={{ height: `${terminalHeight}px` }}
              >
                  {/* Resizer Handle */}
                  <div 
                    className="absolute top-0 left-0 w-full h-1 cursor-ns-resize hover:bg-[#cc785c] z-10 transition-colors"
                    onMouseDown={(e) => {
                      const startY = e.clientY;
                      const startHeight = terminalHeight;
                      
                      const onMouseMove = (moveEvent: MouseEvent) => {
                        const newHeight = startHeight - (moveEvent.clientY - startY);
                        // clamp height between 100px and 800px
                        setTerminalHeight(Math.max(100, Math.min(800, newHeight)));
                      };
                      
                      const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                      };
                      
                      document.addEventListener('mousemove', onMouseMove);
                      document.addEventListener('mouseup', onMouseUp);
                    }}
                  />

                  {/* Terminal Header Tabs */}
                  <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5 shrink-0">
                    <div className="flex gap-4 uppercase font-mono text-[10px] tracking-wider">
                      <span className="text-white border-b border-[#cc785c] pb-1 cursor-default">Terminal</span>
                    </div>
                    <button 
                      onClick={() => setIsTerminalOpen(false)}
                      className="text-white/50 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Terminal Content */}
                  <div 
                    className="flex-1 relative p-2 overflow-hidden bg-[#0a0400]"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setContextMenu({ x: e.clientX, y: e.clientY, type: 'terminal' });
                    }}
                  >
                    <div ref={terminalRef} className="absolute inset-2" />
                  </div>
                </div>

            </div>
          </div>
        )}
      </main>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        multiple 
      />
      <input 
        type="file" 
        ref={folderInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        {...{ webkitdirectory: "" } as any}
      />

      {/* Custom Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-50 bg-[#181818] border-2 border-[#cc785c]/50 shadow-2xl font-mono text-xs py-1 min-w-[180px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'explorer-bg' && (
            <>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#cc785c]/20 text-[#cc785c] flex items-center gap-2"
                onClick={() => { setNewItemType('file'); setContextMenu(null); }}
              >
                <FilePlus className="h-3.5 w-3.5" /> New File
              </button>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#cc785c]/20 text-[#cc785c] flex items-center gap-2"
                onClick={() => { setNewItemType('folder'); setContextMenu(null); }}
              >
                <FolderPlus className="h-3.5 w-3.5" /> New Folder
              </button>
              <div className="h-px bg-[#cc785c]/20 my-1 mx-2" />
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#cc785c]/20 text-[#cc785c] flex items-center gap-2 font-bold"
                onClick={() => { downloadProjectAsZip(); setContextMenu(null); }}
              >
                <Download className="h-3.5 w-3.5" /> Download ZIP
              </button>
            </>
          )}
          
          {contextMenu.type === 'explorer-file' && (
            <>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2"
                onClick={(e) => { 
                  if (contextMenu.path && contextMenu.path !== '/package.json') {
                    handleDeleteFile(contextMenu.path, e as any); 
                  }
                  setContextMenu(null); 
                }}
                disabled={contextMenu.path === '/package.json'}
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}

          {contextMenu.type === 'terminal' && (
            <>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#cc785c]/20 text-[#cc785c] flex items-center gap-2"
                onClick={async () => {
                  try {
                    const selectedText = xtermRef.current?.getSelection();
                    if (selectedText) {
                      await navigator.clipboard.writeText(selectedText);
                    }
                  } catch (e) {
                    console.error("Copy failed", e);
                  }
                  setContextMenu(null);
                }}
              >
                <Copy className="h-3.5 w-3.5" /> Copy
              </button>
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#cc785c]/20 text-[#cc785c] flex items-center gap-2"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (xtermRef.current) xtermRef.current.paste(text);
                  } catch (e) {
                    console.error("Paste failed", e);
                  }
                  setContextMenu(null);
                }}
              >
                <SquareTerminal className="h-3.5 w-3.5" /> Paste
              </button>
              <div className="h-px bg-[#cc785c]/20 my-1 mx-2" />
              <button 
                className="w-full text-left px-4 py-2 hover:bg-[#cc785c]/20 text-[#cc785c] flex items-center gap-2"
                onClick={() => { 
                  if (xtermRef.current) xtermRef.current.clear(); 
                  setContextMenu(null); 
                }}
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Terminal
              </button>
            </>
          )}
        </div>
      )}

      {/* Custom Github Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e1e1e] border border-[#cc785c]/30 rounded-lg shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="h-6 w-6 text-[#cc785c]" />
              <h3 className="text-white font-serif text-xl font-bold uppercase tracking-wider">Import Repository</h3>
            </div>
            <p className="text-white/50 text-xs font-mono mb-6 leading-relaxed">
              Enter a GitHub repository (e.g., <span className="text-white/80 bg-white/10 px-1 py-0.5 rounded">facebook/react</span>) or URL. We will pull down the latest code directly into your workspace.
            </p>
            <input 
              type="text" 
              value={githubRepoInput}
              onChange={e => setGithubRepoInput(e.target.value)}
              placeholder="username/repo"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') confirmGithubImport();
                if (e.key === 'Escape') setShowGithubModal(false);
              }}
              className="w-full bg-[#111111] border border-white/10 rounded px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-[#cc785c] transition-colors mb-6"
            />
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowGithubModal(false)}
                className="px-4 py-2 text-xs font-mono font-bold uppercase text-white/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmGithubImport}
                className="bg-[#cc785c] hover:bg-[#b06349] text-white px-5 py-2 rounded text-xs font-mono font-bold uppercase transition-colors shadow-lg"
              >
                Import Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Tooltip */}
      {tooltip && (
        <div 
          className="fixed z-[100] flex flex-col items-center pointer-events-none animate-in fade-in zoom-in-95 duration-100"
          style={{ top: tooltip.y, left: tooltip.x, transform: 'translateX(-50%)' }}
        >
          <div className="w-2 h-2 -mb-1 bg-[#1e1e1e] rotate-45 border-t border-l border-[#cc785c]/50"></div>
          <div className="bg-[#1e1e1e] text-[#cc785c] text-[10px] font-mono px-3 py-1.5 rounded border border-[#cc785c]/50 shadow-2xl whitespace-nowrap font-bold uppercase tracking-wider backdrop-blur-md">
            {tooltip.text}
          </div>
        </div>
      )}

    </div>
  );
}
