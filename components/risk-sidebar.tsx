"use client";

import { useState } from "react";
import type { Annotation, RiskLevel } from "@/types";
import { Copy, Check, MessageSquare, ChevronRight, Shield, AlertCircle, FileText } from "lucide-react";

const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; bg: string; border: string; icon: any }
> = {
  HIGH: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-100",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  MEDIUM: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    icon: <Shield className="w-4 h-4" />,
  },
  LOW: {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    icon: <FileText className="w-4 h-4" />,
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Liability", "Indemnification"]));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const groupedByCategory = annotations.reduce(
    (acc, ann) => {
      const category = ann.category || "General";
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
    <div className="flex flex-col h-full bg-white select-none">
      {/* Header */}
      <div className="p-6 border-b border-stone-100 bg-stone-50/50">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-[#9a7b4f]" />
          <h2 className="font-serif font-medium text-stone-900 text-xl tracking-tight">Audit Findings</h2>
        </div>
        <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest">
          {totalCount} identified point{totalCount !== 1 ? "s" : ""} of interest
        </p>

        {/* Quick-filter badges */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {Object.entries(groupedByCategory).map(([category, items]) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className="flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white border border-stone-200 text-stone-500 hover:border-[#9a7b4f]/40 hover:text-[#9a7b4f] transition-all duration-300 shadow-sm"
            >
              <span>{category}</span>
              <span className="bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded-md min-w-[1.25rem] text-center">{items.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable findings list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin bg-white">
        {categories.map((category) => {
          const items = groupedByCategory[category];
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="rounded-2xl border border-stone-100 bg-white overflow-hidden shadow-sm shadow-stone-200/40">
              {/* Category Dropdown Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 bg-stone-50 border-b border-stone-100 hover:bg-stone-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : ""}`}>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                  <span className="text-sm font-serif font-medium text-stone-900">{category}</span>
                </div>
                <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{items.length} Findings</span>
              </button>

              {/* Finding Items */}
              {isExpanded && (
                <div className="p-2 space-y-2">
                  {items.map((ann) => {
                    const config = RISK_CONFIG[ann.riskLevel as RiskLevel];
                    const isActive = activeAnnotationId === ann._id;

                    return (
                      <div
                        key={ann._id}
                        id={`annotation-${ann._id}`}
                        onClick={() => onAnnotationClick(ann._id)}
                        className={`w-full text-left p-4 rounded-xl border transition-all duration-500 cursor-pointer ${
                          isActive
                            ? "bg-white border-[#9a7b4f]/40 shadow-xl shadow-[#9a7b4f]/5 ring-1 ring-[#9a7b4f]/10"
                            : "border-stone-100 bg-white hover:border-[#9a7b4f]/10 hover:bg-stone-50/50"
                        }`}
                      >
                        {/* Status Line */}
                        <div className="flex items-center justify-between mb-4">
                          <div className={`flex items-center gap-2 ${config.color}`}>
                            {config.icon}
                            <span className="text-[10px] font-bold uppercase tracking-widest">{ann.riskType}</span>
                          </div>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest ${
                              ann.riskLevel === "HIGH"
                                ? "bg-red-50 text-red-700"
                                : ann.riskLevel === "MEDIUM"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            Liability: {ann.riskLevel}
                          </span>
                        </div>

                        {/* Citation */}
                        <div className="relative pl-4 mb-3 border-l-2 border-stone-100 group">
                          <p className="text-[11px] text-stone-400 line-clamp-3 leading-relaxed italic group-hover:text-stone-500 transition-colors" title={ann.text}>
                            &ldquo;{ann.text}&rdquo;
                          </p>
                        </div>

                        {/* Professional Guidance */}
                        <p className="text-xs text-stone-700 leading-relaxed font-serif mb-4">
                          {ann.explanation}
                        </p>

                        {/* Strategy & Clause Injection */}
                        <div className="space-y-2">
                          {ann.proposedSolution && (
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3">
                              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1 shadow-sm">
                                Recommendation
                              </p>
                              <p className="text-xs text-emerald-700 leading-relaxed">
                                {ann.proposedSolution}
                              </p>
                            </div>
                          )}

                          {ann.replacementClause && (
                            <div className="bg-stone-900 rounded-xl p-4 transition-all duration-300">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-[9px] font-bold text-[#c5a368] uppercase tracking-widest">
                                  Injected Clause
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(ann.replacementClause || "", ann._id);
                                  }}
                                  className="flex items-center gap-1.5 text-[9px] font-bold text-[#c5a368] hover:text-white transition-colors"
                                >
                                  {copiedId === ann._id ? (
                                    <>
                                      <Check className="w-3 h-3" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <p className="text-[10px] text-stone-400 leading-relaxed font-mono">
                                {ann.replacementClause.slice(0, 150)}
                                {ann.replacementClause.length > 150 ? "..." : ""}
                              </p>
                            </div>
                          )}

                          {onAskAI && isActive && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAskAI(ann);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-[10px] font-bold text-stone-600 uppercase tracking-widest transition-all duration-300 mt-2 w-full justify-center shadow-sm active:scale-[0.98]"
                            >
                              <MessageSquare className="w-4 h-4 text-[#9a7b4f]" />
                              Consult AI Specialist
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {totalCount === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-stone-50/50 rounded-[32px] border-2 border-dashed border-stone-100">
            <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-white shadow-xl shadow-stone-200/50">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-stone-900 font-serif font-medium text-lg">No Risks Identified</p>
              <p className="text-stone-400 text-xs max-w-[180px]">
                The automated audit found no critical liabilities in this document.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
