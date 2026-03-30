"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRouter } from "next/navigation";
import type { Id } from "../convex/_generated/dataModel";

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
      setProgress("Uploading document...");

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
        setProgress("Creating document record...");
        const { docId, fileUrl } = await createDocument({
          fileName: file.name,
          fileStorageId: storageId,
        });

        // 4. Trigger AI analysis
        setProgress("Analyzing with LexAI — this may take ~30 seconds...");
        const analyzeRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl, documentId: docId }),
        });

        if (analyzeRes.ok) {
          const { annotations } = await analyzeRes.json();

          // 5. Store annotations in Convex
          if (annotations && annotations.length > 0) {
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
      className={`group relative overflow-hidden border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "border-amber-500 bg-amber-500/10 scale-[1.02]"
          : "border-white/20 hover:border-amber-500/50 hover:bg-white/5"
      } ${uploading ? "pointer-events-none opacity-60" : ""}`}
    >
      <input {...getInputProps()} />

      {/* Gradient glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-yellow-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:via-yellow-500/5 group-hover:to-amber-500/5 transition-all duration-500" />

      <div className="relative z-10">
        {uploading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-amber-500/30 border-t-amber-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">⚖️</span>
              </div>
            </div>
            <p className="text-gray-300 font-medium text-lg">{progress}</p>
            <p className="text-gray-500 text-sm">
              LexAI is analyzing your document for risky clauses...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-10 w-10 text-amber-400"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-semibold text-white mb-1.5">
                Drop your legal document here
              </p>
              <p className="text-gray-500 text-sm">
                PDF files up to 10MB — or click to browse
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
