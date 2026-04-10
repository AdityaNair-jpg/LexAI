"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { Annotation } from "@/types";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, Shield } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const RISK_COLORS: Record<string, string> = {
  HIGH: "bg-red-500/10 border-l-red-500 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
  MEDIUM: "bg-[#9a7b4f]/10 border-l-[#9a7b4f] hover:bg-[#9a7b4f]/20 shadow-[0_0_15px_rgba(154,123,79,0.1)]",
  LOW: "bg-blue-500/10 border-l-blue-500 hover:bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
};

type Props = {
  fileUrl: string;
  annotations: Annotation[];
  onViewSolution?: (annotation: Annotation) => void;
};

export function PdfCanvasViewer({ fileUrl, annotations, onViewSolution }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState(1.1);
  const [hoveredAnnotation, setHoveredAnnotation] = useState<Annotation | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setLoading(false);
      }
    };
    loadPdf();
  }, [fileUrl]);

  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      const outputScale = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * outputScale);
      canvas.height = Math.floor(viewport.height * outputScale);
      canvas.style.width = Math.floor(viewport.width) + "px";
      canvas.style.height = Math.floor(viewport.height) + "px";

      const transform = outputScale !== 1
        ? [outputScale, 0, 0, outputScale, 0, 0]
        : undefined;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        transform: transform,
        canvas: canvas,
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error("Error rendering page:", error);
    }
  }, [pdfDoc, currentPage, scale]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < numPages) setCurrentPage(currentPage + 1);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    const hoveredAnn = annotations.find(
      (ann) =>
        ann.pageNumber === currentPage &&
        xPercent >= ann.boundingBox.x &&
        xPercent <= ann.boundingBox.x + ann.boundingBox.width &&
        yPercent >= ann.boundingBox.y &&
        yPercent <= ann.boundingBox.y + ann.boundingBox.height
    );

    if (hoveredAnn) {
      setHoveredAnnotation(hoveredAnn);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredAnnotation(null);
    }
  };

  const pageAnnotations = annotations.filter((ann) => ann.pageNumber === currentPage);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-12 w-12 rounded-full border-2 border-stone-100 border-t-[#9a7b4f] animate-spin" />
        <p className="text-stone-400 font-serif text-sm italic">Synthesizing document...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Canvas Toolset */}
      <div className="flex items-center justify-between w-full bg-stone-50/50 p-3 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-2 hover:bg-white disabled:opacity-20 rounded-xl transition-all border border-transparent hover:border-stone-200"
          >
            <ChevronLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div className="px-4 py-1.5 bg-white border border-stone-200 rounded-xl shadow-sm">
            <span className="text-xs font-bold text-stone-900 tabular-nums">
              {currentPage} <span className="text-stone-300 font-normal mx-1">/</span> {numPages}
            </span>
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage >= numPages}
            className="p-2 hover:bg-white disabled:opacity-20 rounded-xl transition-all border border-transparent hover:border-stone-200"
          >
            <ChevronRight className="w-5 h-5 text-stone-600" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.2))}
            className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-stone-200"
          >
            <Minus className="w-4 h-4 text-stone-600" />
          </button>
          <div className="w-16 text-center">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest tabular-nums">
              {Math.round(scale * 100)}%
            </span>
          </div>
          <button
            onClick={() => setScale(Math.min(2.5, scale + 0.2))}
            className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-stone-200"
          >
            <Plus className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden cursor-crosshair group shadow-inner bg-stone-50 select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredAnnotation(null)}
      >
        <canvas ref={canvasRef} className="block shadow-2xl shadow-stone-400/20" />
        
        {/* Risk Injection Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {pageAnnotations.map((ann) => (
            <div
              key={ann._id}
              onClick={(e) => {
                e.stopPropagation();
                onViewSolution?.(ann);
              }}
              className={`absolute border-l-2 cursor-pointer pointer-events-auto transition-all duration-300 ${
                RISK_COLORS[ann.riskLevel] || ""
              } ${hoveredAnnotation?._id === ann._id ? "scale-[1.01] z-10" : "z-0"}`}
              style={{
                left: `${ann.boundingBox.x}%`,
                top: `${ann.boundingBox.y}%`,
                width: `${ann.boundingBox.width}%`,
                height: `${Math.max(ann.boundingBox.height, 2.5)}%`,
                minHeight: "1.4rem",
              }}
            />
          ))}
        </div>
      </div>

      {/* Audit Tooltip (Portal) */}
      {isClient && hoveredAnnotation && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in duration-200"
          style={{
            left: Math.min(tooltipPosition.x + 24, window.innerWidth - 380),
            top: Math.min(tooltipPosition.y + 12, window.innerHeight - 300),
          }}
        >
          <div className="w-80 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 ${
                  hoveredAnnotation.riskLevel === "HIGH" ? "text-red-500" : 
                  hoveredAnnotation.riskLevel === "MEDIUM" ? "text-[#9a7b4f]" : "text-blue-500"
                }`} />
                <span className="font-serif font-medium text-stone-900 text-sm">
                  {hoveredAnnotation.category || "Audit Point"}
                </span>
              </div>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                  hoveredAnnotation.riskLevel === "HIGH"
                    ? "bg-red-50 text-red-600"
                    : hoveredAnnotation.riskLevel === "MEDIUM"
                    ? "bg-[#9a7b4f]/10 text-[#9a7b4f]"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {hoveredAnnotation.riskLevel}
              </span>
            </div>
            
            <p className="text-xs text-stone-700 leading-relaxed font-serif mb-5 line-clamp-4">
              {hoveredAnnotation.explanation}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewSolution?.(hoveredAnnotation);
              }}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 rounded-xl text-[10px] font-bold text-[#c5a368] uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] pointer-events-auto"
            >
              Examine Proposed Solution
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
