"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { AnnotationOverlay } from "./annotation-overlay";
import type { Annotation } from "@/types";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
  fileUrl: string;
  annotations: Annotation[];
};

export function PDFViewer({ fileUrl, annotations }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageWidth = 800;

  return (
    <div className="flex flex-col items-center gap-6">
      {loading && (
        <div className="flex items-center gap-3 py-12">
          <div className="h-6 w-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <p className="text-gray-400 text-sm">Loading document...</p>
        </div>
      )}
      <Document
        file={fileUrl}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setLoading(false);
        }}
        onLoadError={(error) => {
          console.error("PDF load error:", error);
          setLoading(false);
        }}
        className="flex flex-col items-center gap-6"
      >
        {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
          <div
            key={page}
            className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10"
          >
            <Page
              pageNumber={page}
              width={pageWidth}
              renderTextLayer={true}
              renderAnnotationLayer={false}
            />
            <AnnotationOverlay
              annotations={annotations.filter((a) => a.pageNumber === page)}
              pageWidth={pageWidth}
            />
            {/* Page number indicator */}
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white/70 text-xs font-medium px-2.5 py-1 rounded-md">
              {page} / {numPages}
            </div>
          </div>
        ))}
      </Document>
    </div>
  );
}
