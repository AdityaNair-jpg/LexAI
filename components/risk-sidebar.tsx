"use client";

import { useState } from "react";
import type { Annotation, RiskLevel } from "@/types";
import { Copy, Check, MessageSquare, ChevronDown, ChevronRight } from "lucide-react";

const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; bg: string; border: string; icon: string }
> = {
  HIGH: {
    color: "text-red-300",
    bg: "bg-red-900/20",
    border: "border-red-800/30",
    icon: "⚖️",
  },
  MEDIUM: {
    color: "text-amber-300",
    bg: "bg-amber-900/20",
    border: "border-amber-800/30",
    icon: "⚠️",
  },
  LOW: {
    color: "text-blue-300",
    bg: "bg-blue-900/20",
    border: "border-blue-800/30",
    icon: "📋",
  },
};

type Props = {
  annotations: Annotation[];
  activeAnnotationId: string | null;
  onAnnotationClick: (id: string) => void;
  onAskAI?: (annotation: Annotation) => void;
};

export function RiskSidebar({
  annotations,
  activeAnnotationId,
  onAnnotationClick,
  onAskAI,
}: Props) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const groupedByCategory = annotations.reduce(
    (acc, ann) => {
      const category = ann.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(ann);
      return acc;
    },
    {} as Record<string, Annotation[]>
  );

  const categories = Object.keys(groupedByCategory).sort();

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        <div className="flex gap-2 mt-3 flex-wrap">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors"
            >
              <span>{category}</span>
              <span className="bg-white/10 px-1.5 rounded-full">{items.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable annotation list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {categories.map((category) => {
          const items = groupedByCategory[category];
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="border border-white/10 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-semibold text-white">{category}</span>
                </div>
                <span className="text-xs text-gray-500">{items.length} items</span>
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="space-y-2 p-3 pt-0">
                  {items.map((ann) => {
                    const config = RISK_CONFIG[ann.riskLevel as RiskLevel];
                    const isActive = activeAnnotationId === ann._id;

                    return (
                      <button
                        key={ann._id}
                        id={`annotation-${ann._id}`}
                        onClick={() => onAnnotationClick(ann._id)}
                        className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                          isActive
                            ? `${config.bg} ${config.border} ring-1 ring-white/10`
                            : "border-white/5 hover:border-white/10 hover:bg-white/5"
                        }`}
                      >
                        {/* Risk Type & Level */}
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-white">
                            {ann.riskType}
                          </p>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase ${
                              ann.riskLevel === "HIGH"
                                ? "bg-red-500/20 text-red-300"
                                : ann.riskLevel === "MEDIUM"
                                ? "bg-amber-500/20 text-amber-300"
                                : "bg-sky-500/20 text-sky-300"
                            }`}
                          >
                            {ann.riskLevel}
                          </span>
                        </div>

                        {/* Original Clause */}
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-2 italic">
                          &ldquo;{ann.text}&rdquo;
                        </p>

                        {/* Explanation */}
                        <p className="text-[11px] text-gray-300 leading-relaxed mb-2">
                          {ann.explanation}
                        </p>

                        {/* Proposed Solution - Highlighted */}
                        {ann.proposedSolution && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2 mb-2">
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
                              ✅ Proposed Solution
                            </p>
                            <p className="text-xs text-emerald-300 leading-relaxed">
                              {ann.proposedSolution}
                            </p>
                          </div>
                        )}

                        {/* Replacement Clause */}
                        {ann.replacementClause && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mb-2">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                📋 Replacement Clause
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(ann.replacementClause || "", ann._id);
                                }}
                                className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                {copiedId === ann._id ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-[11px] text-blue-200/80 leading-relaxed font-mono">
                              {ann.replacementClause.slice(0, 150)}
                              {ann.replacementClause.length > 150 ? "..." : ""}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {onAskAI && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAskAI(ann);
                            }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-[11px] text-amber-300 transition-colors w-full justify-center"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Ask AI about this
                          </button>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
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
