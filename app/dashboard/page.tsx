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
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
  },
  processing: {
    label: "Analyzing",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  ready: {
    label: "Ready",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
  },
  error: {
    label: "Error",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
  },
};

export default function DashboardPage() {
  const documents = useQuery(api.documents.getByUser);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-serif font-medium text-stone-950">Documents</h1>
        <p className="text-stone-500 text-lg">
          Upload and manage your legal documents.
        </p>
      </div>

      {/* Uploader Section */}
      <div className="p-8 bg-white rounded-3xl border border-stone-200 shadow-sm">
        <DocumentUploader />
      </div>

      {/* Document list */}
      <div className="space-y-6">
        <h2 className="text-xl font-serif font-medium text-stone-950 flex items-center gap-3">
          <span>Recent Documents</span>
          {documents && documents.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-sans font-normal">
              {documents.length}
            </span>
          )}
        </h2>

        {documents === undefined ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="h-10 w-10 rounded-full border-3 border-stone-100 border-t-[#9a7b4f] animate-spin" />
            <span className="text-stone-400 text-sm font-medium">
              Retrieving your library...
            </span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-32 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50">
            <p className="text-stone-400 italic font-serif text-lg">
              No documents found. Start by uploading a file above.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc: any) => {
              const status = STATUS_CONFIG[doc.status] || STATUS_CONFIG.error;
              return (
                <Link
                  key={doc._id}
                  href={`/document/${doc._id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-2xl border border-stone-200 bg-white hover:border-[#9a7b4f]/30 hover:shadow-lg hover:shadow-stone-200/40 transition-all duration-300"
                >
                  <div className="flex items-center gap-5">
                    {/* File icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-50 border border-stone-100 group-hover:bg-[#fbf9f6] group-hover:border-[#9a7b4f]/20 transition-colors">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6 text-stone-400 group-hover:text-[#9a7b4f] transition-colors"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>

                    <div>
                      <p className="font-serif font-medium text-stone-900 text-lg group-hover:text-stone-950 transition-colors">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-stone-400 font-medium mt-0.5">
                        {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border ${status.bg} ${status.color}`}
                    >
                      {status.label}
                    </span>
                    <div className="h-8 w-8 flex items-center justify-center rounded-full bg-stone-50 text-stone-300 group-hover:bg-[#9a7b4f] group-hover:text-white transition-all duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
