"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/navigation";
import type { Id } from "../convex/_generated/dataModel";
import { Shield, Upload, FileText, Loader2 } from "lucide-react";

export function DocumentUploader() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const router = useRouter();
  const generateUploadUrl = useMutation(api.documents.generateUploadUrl);
  const createDocument = useMutation(api.documents.create);
  const updateStatus = useMutation(api.documents.updateStatus);
  const createAnnotations = useMutation(api.annotations.createMany);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;

      setUploading(true);
      setProgress("Securing document...");

      try {
        // 1. Get Convex upload URL
        const uploadUrl = await generateUploadUrl();

        // 2. Upload file to Convex storage
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await uploadRes.json();

        // 3. Create document record in DB
        setProgress("Parsing legal structure...");
        const { docId, fileUrl } = await createDocument({
          fileName: file.name,
          fileStorageId: storageId,
        });

        // 4. Trigger AI analysis
        setProgress("LexAI Engine: Identifying Risky Clauses...");
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl, documentId: docId }),
        });

        if (analyzeRes.ok) {
          const { annotations } = await analyzeRes.json();

          // 5. Store annotations in Convex
          if (annotations && annotations.length > 0) {
            setProgress("Optimizing results...");
            await createAnnotations({
              documentId: docId as Id<"documents">,
              annotations: annotations,
            });
          }

          // 6. Update status to ready
          await updateStatus({ documentId: docId, status: "ready" });
          
          // 7. Navigate to document view
          router.push(`/document/${docId}`);
        } else {
          try {
            const errorData = await analyzeRes.json();
            setProgress(`Analysis Error: ${errorData.error || "Unknown"}`);
          } catch (e) {
            setProgress(`API Error (${analyzeRes.status})`);
          }
          await updateStatus({ documentId: docId, status: "error" });
          
          setTimeout(() => {
            setUploading(false);
            setProgress("");
          }, 6000);
        }
      } catch (err: any) {
        console.error(err);
        setProgress(`Error: ${err.message || "Upload failed"}`);
        setTimeout(() => {
          setUploading(false);
          setProgress("");
        }, 6000);
      }
    },
    [generateUploadUrl, createDocument, updateStatus, router, createAnnotations]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`group relative overflow-hidden border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-500 ${
        isDragActive
          ? "border-[#9a7b4f] bg-[#9a7b4f]/5 scale-[1.01]"
          : "border-stone-200 bg-stone-50/50 hover:border-[#9a7b4f]/40 hover:bg-white"
      } ${uploading ? "pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />

      <div className="relative z-10">
        {uploading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-[#9a7b4f] animate-spin stroke-[1.5]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Shield className="h-6 w-6 text-stone-300" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-stone-900 font-serif text-2xl font-medium">{progress}</p>
              <p className="text-stone-400 text-sm max-w-xs mx-auto">
                Our AI model is currently auditing your document for potential legal liabilities.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <div className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white border border-stone-100 shadow-xl shadow-stone-200/50 group-hover:scale-110 group-hover:shadow-[#9a7b4f]/10 transition-all duration-500">
              <Upload className="h-8 w-8 text-[#9a7b4f] transition-transform group-hover:-translate-y-1" />
            </div>
            <div>
              <p className="text-2xl font-serif font-medium text-stone-900 mb-3 px-4">
                Begin your legal audit
              </p>
              <p className="text-stone-500 text-sm flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Upload PDF (Max 10MB) or click to browse
              </p>
            </div>
            <div className="mt-4 flex items-center gap-6 grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
              <div className="w-px h-8 bg-stone-200" />
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 group-hover:text-[#9a7b4f] uppercase tracking-widest transition-colors">
                <Shield className="w-3.5 h-3.5" />
                Secure Processing
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
