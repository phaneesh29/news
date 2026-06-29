"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Copy, Download, Image as ImageIcon, Settings2, Trash2 } from "lucide-react";

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressedPreview, setCompressedPreview] = useState<string | null>(null);
  
  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const compressImage = async () => {
    if (!file || !preview) return;
    setIsCompressing(true);

    try {
      const img = new window.Image();
      img.src = preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) throw new Error("Could not get canvas context");
      
      ctx.drawImage(img, 0, 0, width, height);
      
      const mimeType = file.type === "image/png" && quality === 100 ? "image/png" : (file.type === "image/webp" ? "image/webp" : "image/jpeg");
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "-compressed." + mimeType.split("/")[1], {
              type: mimeType,
            });
            setCompressedFile(compressed);
            setCompressedPreview(URL.createObjectURL(compressed));
          }
          setIsCompressing(false);
        },
        mimeType,
        quality / 100
      );
    } catch (error) {
      console.error("Compression failed:", error);
      alert("Failed to compress image.");
      setIsCompressing(false);
    }
  };

  useEffect(() => {
    if (file) {
      compressImage();
    }
  }, [file, quality, maxWidth]); // Re-compress when settings change

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            processFile(pastedFile);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCompressedFile(null);
    setCompressedPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-background text-foreground newspaper-theme-layout p-4 sm:p-8 font-newspaper selection:bg-[#cc785c] selection:text-white pb-24">
      <div className="mx-auto max-w-5xl pt-8">
        
        <div className="mb-6">
          <Link href="/tools" className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-current hover:text-[#cc785c] transition-colors w-fit">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Tools Hub
          </Link>
        </div>

        <div className="mb-8 border-b-4 border-double border-current pb-6 flex items-center justify-between">
          <div>
            <h1 className="font-blackletter text-4xl sm:text-5xl text-current tracking-wide mb-2">Image Compressor</h1>
            <p className="font-sans text-sm italic opacity-80 uppercase tracking-widest flex items-center gap-2">
              <Settings2 className="h-4 w-4" /> Client-Side Processing • 100% Private
            </p>
          </div>
        </div>

        {!file ? (
          <div 
            className={`border-4 border-dashed ${isDragging ? 'border-[#cc785c] bg-[#cc785c]/10' : 'border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320]'} p-16 flex flex-col items-center justify-center transition-all duration-300 vintage-shadow cursor-pointer min-h-[400px]`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-20 w-20 mb-6 bg-current text-background flex items-center justify-center rounded-none rotate-3">
              <Upload className="h-10 w-10" />
            </div>
            <h2 className="font-blackletter text-2xl mb-3 text-center">Drop Image or Click to Upload</h2>
            <p className="font-mono text-sm opacity-70 text-center mb-6 max-w-md leading-relaxed">
              You can also <strong className="text-current underline decoration-wavy decoration-[#cc785c]">paste (Ctrl+V)</strong> an image directly from your clipboard. All processing happens in your browser.
            </p>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-4 vintage-shadow">
                  <div className="flex justify-between items-center mb-4 border-b-2 border-current pb-2">
                    <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" /> Original
                    </h3>
                    <span className="font-mono text-xs bg-current text-background px-2 py-1">
                      {formatSize(file.size)}
                    </span>
                  </div>
                  <div className="relative aspect-square w-full bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-current/20">
                    {preview && (
                      <img src={preview} alt="Original" className="max-w-full max-h-full object-contain p-2" />
                    )}
                  </div>
                </div>

                {/* Compressed Image */}
                <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-4 vintage-shadow relative">
                  <div className="flex justify-between items-center mb-4 border-b-2 border-current pb-2">
                    <h3 className="font-bold uppercase tracking-widest text-sm flex items-center gap-2 text-[#cc785c]">
                      <Settings2 className="h-4 w-4" /> Compressed
                    </h3>
                    {isCompressing ? (
                      <span className="font-mono text-xs animate-pulse">Processing...</span>
                    ) : (
                      compressedFile && (
                        <div className="flex gap-2">
                           <span className="font-mono text-xs border border-[#cc785c] text-[#cc785c] px-2 py-1">
                            -{Math.round((1 - compressedFile.size / file.size) * 100)}%
                          </span>
                          <span className="font-mono text-xs bg-[#cc785c] text-white px-2 py-1">
                            {formatSize(compressedFile.size)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                  <div className="relative aspect-square w-full bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-current/20">
                    {compressedPreview && !isCompressing && (
                      <img src={compressedPreview} alt="Compressed" className="max-w-full max-h-full object-contain p-2" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls sidebar */}
            <div className="lg:col-span-1">
              <div className="border-4 border-[#111111] dark:border-[#e6dfd8] bg-[#fcfaf2] dark:bg-[#252320] p-6 vintage-shadow sticky top-8">
                <h3 className="font-blackletter text-2xl mb-6 border-b-2 border-current pb-4">Settings</h3>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <label className="flex justify-between text-sm font-bold uppercase tracking-wider mb-3">
                      <span>Quality</span>
                      <span className="font-mono">{quality}%</span>
                    </label>
                    <input 
                      type="range" 
                      min="1" 
                      max="100" 
                      value={quality} 
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-[#cc785c]"
                    />
                    <div className="flex justify-between text-[10px] font-mono opacity-50 mt-1 uppercase">
                      <span>Smaller</span>
                      <span>Better</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-sm font-bold uppercase tracking-wider mb-3">
                      <span>Max Width</span>
                      <span className="font-mono">{maxWidth}px</span>
                    </label>
                    <input 
                      type="range" 
                      min="100" 
                      max="3840" 
                      step="100"
                      value={maxWidth} 
                      onChange={(e) => setMaxWidth(Number(e.target.value))}
                      className="w-full accent-[#cc785c]"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t-2 border-current">
                  {compressedFile && compressedPreview && (
                    <a 
                      href={compressedPreview}
                      download={compressedFile.name}
                      className="w-full bg-[#cc785c] hover:bg-[#b06148] text-white py-4 px-4 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors vintage-shadow-sm border-2 border-[#cc785c]"
                    >
                      <Download className="h-5 w-5" />
                      Download Image
                    </a>
                  )}
                  
                  <button 
                    onClick={reset}
                    className="w-full bg-transparent hover:bg-current hover:text-background text-current py-4 px-4 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-2 border-current"
                  >
                    <Trash2 className="h-5 w-5" />
                    Discard & Start Over
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
