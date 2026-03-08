import type { Annotation } from "@/types";

const RISK_BADGE: Record<string, string> = {
  HIGH: "bg-red-500/20 text-red-300 border border-red-500/30",
  MEDIUM: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  LOW: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
};

const RISK_BORDER: Record<string, string> = {
  HIGH: "border-red-500/30",
  MEDIUM: "border-amber-500/30",
  LOW: "border-sky-500/30",
};

export function AnnotationTooltip({
  annotation,
}: {
  annotation: Annotation;
}) {
  return (
    <div
      className={`absolute z-50 left-full ml-3 top-0 w-80 bg-[#1a1a2e]/95 backdrop-blur-xl 
                    rounded-xl shadow-2xl shadow-black/50 border ${RISK_BORDER[annotation.riskLevel]} 
                    p-5 pointer-events-none`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-white text-sm">
          {annotation.riskType}
        </span>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${RISK_BADGE[annotation.riskLevel]}`}
        >
          {annotation.riskLevel}
        </span>
      </div>

      {/* Flagged text */}
      <p className="text-xs text-gray-400 italic border-l-2 border-gray-600 pl-3 mb-4 line-clamp-2 leading-relaxed">
        &ldquo;{annotation.text}&rdquo;
      </p>

      {/* Explanation */}
      <div className="mb-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
          Why this is risky
        </p>
        <p className="text-xs text-gray-300 leading-relaxed">
          {annotation.explanation}
        </p>
      </div>

      {/* Recommendation */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
          Recommendation
        </p>
        <p className="text-xs text-emerald-300 leading-relaxed">
          {annotation.recommendation}
        </p>
      </div>
    </div>
  );
}
