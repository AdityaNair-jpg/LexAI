"use client";

import type { Annotation, RiskLevel } from "@/types";

const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; bg: string; border: string; icon: string }
> = {
  HIGH: {
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "🔴",
  },
  MEDIUM: {
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "🟡",
  },
  LOW: {
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    icon: "🔵",
  },
};

type Props = {
  annotations: Annotation[];
  activeAnnotationId: string | null;
  onAnnotationClick: (id: string) => void;
};

export function RiskSidebar({
  annotations,
  activeAnnotationId,
  onAnnotationClick,
}: Props) {
  const grouped = annotations.reduce(
    (acc, ann) => {
      acc[ann.riskLevel] = acc[ann.riskLevel] || [];
      acc[ann.riskLevel].push(ann);
      return acc;
    },
    {} as Record<RiskLevel, Annotation[]>
  );

  const levels: RiskLevel[] = ["HIGH", "MEDIUM", "LOW"];
  const totalCount = annotations.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <h2 className="font-bold text-white text-lg mb-1">Risk Analysis</h2>
        <p className="text-gray-500 text-xs">
          {totalCount} clause{totalCount !== 1 ? "s" : ""} flagged
        </p>

        {/* Summary badges */}
        <div className="flex gap-2 mt-3">
          {levels.map((level) => {
            const count = grouped[level]?.length || 0;
            if (count === 0) return null;
            const config = RISK_CONFIG[level];
            return (
              <div
                key={level}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.border} border ${config.color}`}
              >
                <span>{config.icon}</span>
                <span>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable annotation list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {levels.map((level) => {
          const items = grouped[level];
          if (!items || items.length === 0) return null;
          const config = RISK_CONFIG[level];

          return (
            <div key={level} className="space-y-2">
              <h3
                className={`text-xs font-bold uppercase tracking-widest ${config.color} flex items-center gap-2 mb-2`}
              >
                <span>{config.icon}</span>
                {level} Risk ({items.length})
              </h3>
              {items.map((ann) => (
                <button
                  key={ann._id}
                  onClick={() => onAnnotationClick(ann._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    activeAnnotationId === ann._id
                      ? `${config.bg} ${config.border} ring-1 ring-${level === "HIGH" ? "red" : level === "MEDIUM" ? "amber" : "sky"}-500/30`
                      : "border-white/5 hover:border-white/10 hover:bg-white/5"
                  }`}
                >
                  <p className="text-xs font-semibold text-white mb-1">
                    {ann.riskType}
                  </p>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {ann.text}
                  </p>
                </button>
              ))}
            </div>
          );
        })}

        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-medium mb-1">All Clear</p>
            <p className="text-gray-500 text-xs">
              No risky clauses detected in this document.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
