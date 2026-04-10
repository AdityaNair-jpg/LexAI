"use client";

import React from "react";

// Simple analytics panel showing counts by document status.
// Optionally accepts counts via props to avoid hard coupling to data layer.
export function AnalyticsPanel({ counts }: { counts?: {
  uploading: number;
  processing: number;
  ready: number;
  error: number;
} }) {
  const c = counts ?? { uploading: 0, processing: 0, ready: 0, error: 0 };

  const Tile = (label: string, count: number, color: string, border: string) => (
    <div className={`rounded-xl p-4 border ${border} ${color} shadow-sm`} style={{minWidth: 0}}>
      <div className="text-xs font-semibold uppercase tracking-widest text-stone-600 mb-1">
        {label}
      </div>
      <div className="text-xl font-semibold text-stone-900">{count}</div>
    </div>
  );

  return (
    <section className="p-6">
      <h3 className="text-lg font-serif font-medium text-stone-900 mb-4">Analytics</h3>
      <div className="grid grid-cols-4 gap-4">
        {Tile("Uploading", c.uploading, "bg-blue-50", "border-blue-200")}
        {Tile("Processing", c.processing, "bg-amber-50", "border-amber-200")}
        {Tile("Ready", c.ready, "bg-emerald-50", "border-emerald-200")}
        {Tile("Error", c.error, "bg-red-50", "border-red-200")}
      </div>
    </section>
  );
}
