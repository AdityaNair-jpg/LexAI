"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PdfCanvasViewer } from "@/components/pdf-canvas-viewer";
import { RiskSidebar } from "@/components/risk-sidebar";
import { ChatSidebar } from "@/components/chat-sidebar";
import { Navbar } from "@/components/navbar";
import { useState, useRef } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import type { Annotation } from "@/types";
import Link from "next/link";
import { Shield, FileText, Loader2, Scale, AlertCircle, Download } from "lucide-react";

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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-10 w-10 text-[#9a7b4f] animate-spin" />
          <p className="text-stone-400 text-sm font-medium mt-4">Retrieving analyze results...</p>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center space-y-4">
            <div className="text-6xl text-stone-200">🔍</div>
            <h2 className="text-stone-900 font-serif text-2xl font-medium">Document Not Found</h2>
            <p className="text-stone-500 max-w-sm mx-auto">
              This record may have been archived or removed from our secure repository.
            </p>
            <Link href="/dashboard" className="inline-block mt-4 text-[#9a7b4f] hover:underline font-medium">
              Return to Dashboard
            </Link>
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
        element.classList.add("ring-2", "ring-[#9a7b4f]");
        setTimeout(() => {
          element.classList.remove("ring-2", "ring-[#9a7b4f]");
        }, 2000);
      }
    }, 100);
  };

  const handleAskAI = (annotation: Annotation) => {
    const message = `Explain the risks of this ${annotation.category || annotation.riskType} clause and how the proposed solution protects me. The clause states: "${annotation.text.slice(0, 200)}..."`;
    setChatInitialMessage(message);
    setIsChatOpen(true);
  };

  const handleExportFindings = () => {
    // Export the document and its annotated findings as JSON
    const payload = {
      document: {
        id: document._id,
        fileName: document.fileName,
        uploadedAt: document.uploadedAt,
        status: document.status,
      },
      annotations: typedAnnotations,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = (globalThis as any).document.createElement("a");
    a.href = url;
    const safeName = (document.fileName || "document").replace(/[^a-z0-9]/gi, "_");
    a.download = `${safeName}_findings.json`;
    (globalThis as any).document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col overflow-hidden">
      <Navbar />

      {/* Processing state banner */}
      {document.status === "processing" && (
        <div className="bg-[#9a7b4f]/5 border-b border-[#9a7b4f]/20">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-3">
            <Loader2 className="h-4 w-4 text-[#9a7b4f] animate-spin" />
            <p className="text-sm font-medium text-stone-700">
              Auditing legal content...
            </p>
          </div>
        </div>
      )}

      {/* Error state banner */}
      {document.status === "error" && (
        <div className="bg-red-50 border-b border-red-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-center gap-3">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-sm font-medium text-red-700">
              Unable to complete automated analysis.
            </p>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)] flex-1">
        {/* PDF Viewer Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin bg-stone-100/50">
          <div className="max-w-4xl mx-auto">
            {/* Document Header Info */}
        <div className="mb-8 flex items-end justify-between border-b border-stone-200 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-[#9a7b4f]/10">
                    <Scale className="h-4 w-4 text-[#9a7b4f]" />
                  </div>
                  <h1 className="text-2xl font-serif font-medium text-stone-900 tracking-tight">
                    {document.fileName}
                  </h1>
                </div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest pl-11">
                  Vault record • {new Date(document.uploadedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl shadow-stone-300/40 p-4 border border-stone-200">
              <PdfCanvasViewer 
                fileUrl={document.fileUrl} 
                annotations={typedAnnotations}
                onViewSolution={handleViewSolution}
              />
            </div>
          </div>
        </div>

        {/* Audit Sidebar */}
        <div ref={sidebarRef} className="w-100 border-l border-stone-200 bg-white overflow-hidden shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
          <RiskSidebar
            annotations={typedAnnotations}
            activeAnnotationId={activeAnnotationId}
            onAnnotationClick={(id: string) =>
              setActiveAnnotationId(
                activeAnnotationId === id ? null : id
              )
            }
            onAskAI={handleAskAI}
          />
        </div>
        <button
          onClick={handleExportFindings}
          className="ml-4 px-3 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl border border-stone-600 hover:bg-stone-800"
          title="Export findings as JSON"
        >
          <Download className="w-4 h-4 inline-block mr-1" /> Export Findings
        </button>
      </div>

      {/* Interactive AI Counsel Sidebar */}
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
