"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { DocumentUploader } from "@/components/document-uploader";
import Link from "next/link";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  uploading: {
    label: "Uploading",
    color: "text-blue-300",
    bg: "bg-blue-500/20 border-blue-500/30",
  },
  processing: {
    label: "Analyzing",
    color: "text-amber-300",
    bg: "bg-amber-500/20 border-amber-500/30",
  },
  ready: {
    label: "Ready",
    color: "text-emerald-300",
    bg: "bg-emerald-500/20 border-emerald-500/30",
  },
  error: {
    label: "Error",
    color: "text-red-300",
    bg: "bg-red-500/20 border-red-500/30",
  },
};

export default function DashboardPage() {
  const documents = useQuery(api.documents.getByUser);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Documents</h1>
        <p className="text-gray-500">
          Upload a legal document to get started with AI-powered risk analysis.
        </p>
      </div>

      {/* Uploader */}
      <DocumentUploader />

      {/* Document list */}
      {documents === undefined ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
          <span className="ml-3 text-gray-400 text-sm">
            Loading documents...
          </span>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 text-sm">
            No documents yet. Upload your first one above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span>Your Documents</span>
            <span className="text-xs text-gray-500 font-normal">
              ({documents.length})
            </span>
          </h2>

          <div className="grid gap-3">
            {documents.map((doc: any) => {
              const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.error;
              return (
                <Link
                  key={doc._id}
                  href={`/document/${doc._id}`}
                  className="group flex items-center justify-between p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    {/* File icon */}
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/10 shrink-0">
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
                    </div>

                    <div>
                      <p className="font-medium text-white text-sm group-hover:text-indigo-300 transition-colors">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>

                    {/* Arrow */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
