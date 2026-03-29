"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import type { Annotation } from "@/types";
import { createPortal } from "react-dom";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const RISK_COLORS: Record<string, string> = {
  HIGH: "bg-red-400/30 border-l-red-500 hover:bg-red-400/50",
  MEDIUM: "bg-amber-400/30 border-l-amber-500 hover:bg-amber-400/50",
  LOW: "bg-sky-400/30 border-l-sky-500 hover:bg-sky-400/50",
};

type Props = {
  fileUrl: string;
  annotations: Annotation[];
};

export function PdfCanvasViewer({ fileUrl, annotations }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [scale, setScale] = useState(1.2);
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

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
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
    const rect = e.currentTarget.getBoundingClientRect();
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
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-gray-400 text-sm ml-3">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredAnnotation(null)}
      >
        <canvas ref={canvasRef} className="block" />
        
        {/* Annotation Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {pageAnnotations.map((ann) => (
            <div
              key={ann._id}
              className={`absolute border-l-4 cursor-pointer pointer-events-auto transition-all duration-150 rounded-sm ${
                hoveredAnnotation?._id === ann._id
                  ? RISK_COLORS[ann.riskLevel]?.replace("/30", "/50") || ""
                  : RISK_COLORS[ann.riskLevel] || ""
              }`}
              style={{
                left: `${ann.boundingBox.x}%`,
                top: `${ann.boundingBox.y}%`,
                width: `${ann.boundingBox.width}%`,
                height: `${Math.max(ann.boundingBox.height, 3)}%`,
                minHeight: "1.5rem",
              }}
            />
          ))}
        </div>
      </div>

      {/* Page Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
        >
          ← Previous
        </button>
        <span className="text-gray-400 text-sm">
          Page {currentPage} of {numPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= numPages}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setScale(Math.max(0.5, scale - 0.2))}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
        >
          −
        </button>
        <span className="text-gray-400 text-xs w-16 text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale(Math.min(2.5, scale + 0.2))}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm"
        >
          +
        </button>
      </div>

      {/* Tooltip Portal */}
      {isClient && hoveredAnnotation && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: Math.min(tooltipPosition.x + 20, window.innerWidth - 350),
            top: Math.min(tooltipPosition.y - 20, window.innerHeight - 450),
          }}
        >
          <div className="w-80 bg-[#1a1a2e]/98 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white text-sm truncate pr-2">
                {hoveredAnnotation.riskType}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                  hoveredAnnotation.riskLevel === "HIGH"
                    ? "bg-red-500/20 text-red-300"
                    : hoveredAnnotation.riskLevel === "MEDIUM"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-sky-500/20 text-sky-300"
                }`}
              >
                {hoveredAnnotation.riskLevel}
              </span>
            </div>
            <p className="text-xs text-gray-400 italic border-l-2 border-gray-600 pl-2 mb-3 line-clamp-2">
              &ldquo;{hoveredAnnotation.text}&rdquo;
            </p>
            <div className="mb-2">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Why risky
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                {hoveredAnnotation.explanation}
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Recommendation
              </p>
              <p className="text-xs text-emerald-300">
                {hoveredAnnotation.recommendation}
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
