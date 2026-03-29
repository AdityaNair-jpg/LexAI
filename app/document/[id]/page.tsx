"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PdfCanvasViewer } from "@/components/pdf-canvas-viewer";
import { RiskSidebar } from "@/components/risk-sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { Navbar } from "@/components/navbar";
import { useState, useRef, useEffect } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Annotation } from "@/types";

export default function DocumentPage() {
  const params = useParams();
  const documentId = params.id as string;
  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string>("");
  const [documentText, setDocumentText] = useState<string>("");
  const sidebarRef = useRef<HTMLDivElement>(null);

  const document = useQuery(api.documents.getById, {
    id: documentId as Id<"documents">,
  });
  const annotations = useQuery(api.annotations.getByDocument, {
    documentId: documentId as Id<"documents">,
  });

  if (document === undefined || annotations === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
            <p className="text-gray-400 text-sm">Loading document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="text-5xl mb-4">📄</div>
            <p className="text-white font-semibold text-lg mb-2">
              Document Not Found
            </p>
            <p className="text-gray-500 text-sm">
              This document may have been deleted or you don&apos;t have access.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const typedAnnotations: Annotation[] = (annotations || []).map(
    (ann: any) => ({
      _id: ann._id,
      documentId: ann.documentId,
      pageNumber: ann.pageNumber,
      text: ann.text,
      riskType: ann.riskType,
      riskLevel: ann.riskLevel,
      explanation: ann.explanation,
      recommendation: ann.recommendation,
      category: ann.category,
      proposedSolution: ann.proposedSolution,
      replacementClause: ann.replacementClause,
      boundingBox: ann.boundingBox,
    })
  );

  const handleViewSolution = (annotation: Annotation) => {
    setActiveAnnotationId(annotation._id);
    
    setTimeout(() => {
      const element = window.document.getElementById(`annotation-${annotation._id}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ring-2", "ring-indigo-500");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-indigo-500");
        }, 2000);
      }
    }, 100);
  };

  const handleAskAI = (annotation: Annotation) => {
    const message = `Explain the risks of this ${annotation.category || annotation.riskType} clause and how the proposed solution protects me. The clause states: "${annotation.text.slice(0, 200)}..."`;
    setChatInitialMessage(message);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Navbar />

      {/* Processing state */}
      {document.status === "processing" && (
        <div className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-b border-indigo-500/20">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
            <div className="h-4 w-4 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin" />
            <p className="text-sm text-indigo-300">
              LexAI is waking up and analyzing your document. This may take ~30
              seconds...
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {document.status === "error" && (
        <div className="bg-red-500/10 border-b border-red-500/20">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-3">
            <span className="text-red-400">⚠️</span>
            <p className="text-sm text-red-300">
              Analysis failed. Please try re-uploading the document.
            </p>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)]">
        {/* PDF Viewer */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
          {/* Document header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white flex items-center gap-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-indigo-400"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              {document.fileName}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Uploaded{" "}
              {new Date(document.uploadedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <PdfCanvasViewer 
            fileUrl={document.fileUrl} 
            annotations={typedAnnotations}
            onViewSolution={handleViewSolution}
          />
        </div>

        {/* Risk Sidebar */}
        <div ref={sidebarRef} className="w-96 border-l border-white/[0.06] bg-[#0f0f18] overflow-hidden shrink-0">
          <RiskSidebar
            annotations={typedAnnotations}
            activeAnnotationId={activeAnnotationId}
            onAnnotationClick={(id) =>
              setActiveAnnotationId(
                activeAnnotationId === id ? null : id
              )
            }
            onAskAI={handleAskAI}
          />
        </div>
      </div>

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatInitialMessage("");
        }}
        documentText={documentText}
        annotations={typedAnnotations}
        initialMessage={chatInitialMessage}
      />
    </div>
  );
}
