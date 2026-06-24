"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { Loader2, Power, Code2, SquareTerminal, File, Folder, Plus, FilePlus, FolderPlus, X, ChevronUp, ChevronDown, Play, Trash2 } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";
import { WebContainer } from "@webcontainer/api";

const INITIAL_CODE = `import os from 'os';

console.log("Hello from WebContainers!\\n");
console.log("Platform:", os.platform());
console.log("Architecture:", os.arch());

// Python is also supported! Just create a main.py file and type 'python main.py' in the terminal below.
`;

type FSNode = { name: string; isDirectory: boolean; path: string; depth: number };

export default function NodeSandbox() {
  const [bootStatus, setBootStatus] = useState<"idle" | "booting" | "ready" | "error">("idle");
  const [moduleType, setModuleType] = useState<"commonjs" | "module">("module");
  
  const [files, setFiles] = useState<FSNode[]>([]);
  const [currentFile, setCurrentFile] = useState<string>("/index.js");
  const [code, setCode] = useState(INITIAL_CODE);
  
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder" | null>(null);

  // Terminal UI State
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(250); // pixels

  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const wcRef = useRef<WebContainer | null>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  // Cleanup on unmount or navigation away
  useEffect(() => {
    return () => {
      killSandbox();
    };
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

  const bootContainer = async () => {
    if (wcRef.current) return;
    setBootStatus("booting");

    try {
      const wc = await WebContainer.boot();
      wcRef.current = wc;

      await wc.mount({
        'index.js': {
          file: { contents: INITIAL_CODE }
        },
        'package.json': {
          file: { 
            contents: JSON.stringify({ 
              name: "sandbox", 
              type: "module", 
              dependencies: {} 
            }, null, 2) 
          }
        }
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
        );

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
    if (isDirectory || !wcRef.current) return;
    try {
      const content = await wcRef.current.fs.readFile(path, 'utf-8');
      setCurrentFile(path);
      setCode(content);
    } catch (err) {
      console.error("Failed to open file", err);
    }
  };

  const handleCodeChange = (val: string | undefined) => {
    const newCode = val || "";
    setCode(newCode);
    if (wcRef.current && currentFile) {
      wcRef.current.fs.writeFile(currentFile, newCode).catch(console.error);
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
      if (currentFile === path) {
        setCurrentFile("");
        setCode("");
      }
      await refreshFiles();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleModuleTypeChange = async (type: "commonjs" | "module") => {
    setModuleType(type);
    if (wcRef.current) {
      try {
        const pkgJsonRaw = await wcRef.current.fs.readFile('/package.json', 'utf-8');
        const pkgJson = JSON.parse(pkgJsonRaw);
        pkgJson.type = type;
        await wcRef.current.fs.writeFile('/package.json', JSON.stringify(pkgJson, null, 2));
      } catch (err) {
        console.error("Failed to update package.json type", err);
      }
    }
  };

  const getLanguage = (path: string) => {
    if (path.endsWith('.json')) return 'json';
    if (path.endsWith('.html')) return 'html';
    if (path.endsWith('.css')) return 'css';
    if (path.endsWith('.py')) return 'python';
    return 'javascript';
  };

  return (
    <div className="h-screen flex flex-col bg-[#111111] text-[#fcfaf2] overflow-hidden">
      <Navbar />
      
      <main className="flex-1 flex flex-col w-full h-full overflow-hidden border-t-2 border-[#cc785c]/30">
        
        {/* Editor Toolbar */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-2 shrink-0 bg-[#1e1e1e] border-b border-black">
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-lg font-black uppercase tracking-tight font-newspaper flex items-center gap-2 text-[#cc785c]">
              <Code2 className="h-5 w-5" />
              DevBits IDE
            </h1>
            
            {bootStatus === "ready" && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-[10px] font-mono text-white/50 uppercase">Environment:</span>
                <select
                  value={moduleType}
                  onChange={(e) => handleModuleTypeChange(e.target.value as "commonjs" | "module")}
                  className="bg-black/50 border border-white/20 text-white font-mono text-[10px] uppercase px-2 py-1 focus:outline-none cursor-pointer rounded-sm"
                >
                  <option value="module">ES Modules</option>
                  <option value="commonjs">CommonJS</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
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
            <div className="w-64 border-r border-black bg-[#181818] flex flex-col shrink-0 overflow-hidden">
              <div className="bg-[#1e1e1e] p-2 flex items-center justify-between shrink-0">
                <span className="font-mono text-[10px] text-white/50 font-bold uppercase tracking-widest">Explorer</span>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setNewItemType(newItemType === "file" ? null : "file")}
                    className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors"
                    title="New File"
                  >
                    <FilePlus className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setNewItemType(newItemType === "folder" ? null : "folder")}
                    className="p-1 hover:bg-white/10 text-white/70 hover:text-white rounded transition-colors"
                    title="New Folder"
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

              <div className="flex-1 overflow-y-auto py-2 space-y-px">
                {files.map((file) => (
                  <div
                    key={file.path}
                    className={`w-full group flex items-center justify-between px-2 py-1.5 text-left font-mono text-xs transition-colors cursor-pointer ${
                      currentFile === file.path ? 'bg-[#cc785c]/20 text-[#cc785c]' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                    style={{ paddingLeft: `${(file.depth * 12) + 8}px` }}
                    onClick={() => handleFileSelect(file.path, file.isDirectory)}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      {file.isDirectory ? (
                        <Folder className={`h-3.5 w-3.5 shrink-0 ${currentFile === file.path ? 'text-[#cc785c]' : 'text-[#cc785c]/70'}`} />
                      ) : (
                        <File className="h-3.5 w-3.5 shrink-0 opacity-70" />
                      )}
                      <span className="truncate">{file.name}</span>
                    </div>
                    {file.name !== "package.json" && (
                      <button 
                        onClick={(e) => handleDeleteFile(file.path, e)}
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: Editor + Terminal */}
            <div className="flex-1 flex flex-col bg-[#1e1e1e] min-w-0 overflow-hidden relative">
              
              {/* Editor Tabs Area */}
              <div className="bg-[#2d2d2d] flex items-center border-b border-black shrink-0">
                {currentFile && (
                  <div className="bg-[#1e1e1e] text-[#cc785c] text-[10px] font-mono px-4 py-2 border-r border-black border-t-2 border-t-[#cc785c] flex items-center gap-2">
                    <File className="h-3 w-3" />
                    <span>{currentFile.split('/').pop()}</span>
                  </div>
                )}
              </div>
              
              {/* Editor Area */}
              <div className="flex-1 relative overflow-hidden">
                {currentFile ? (
                  <Editor
                    height="100%"
                    language={getLanguage(currentFile)}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
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
                  <div className="flex-1 relative p-2 overflow-hidden bg-[#0a0400]">
                    <div ref={terminalRef} className="absolute inset-2" />
                  </div>
                </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
