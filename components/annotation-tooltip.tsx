import type { Annotation } from "@/types";

//badge
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
  position = "left",
  pageWidth = 800,
}: {
  annotation: Annotation;
  position?: "left" | "right";
  pageWidth?: number;
}) {
  const tooltipWidth = 320;
  const showOnRight = position === "right";
  
  // Calculate position to keep tooltip within page bounds
  const isRightSide = annotation.boundingBox.x > 50;
  const adjustedPosition = isRightSide ? "right" : "left";

  return (
    <div
      className={`absolute z-50 top-0 w-80 max-w-[90vw] bg-[#1a1a2e]/95 backdrop-blur-xl 
                  rounded-xl shadow-2xl shadow-black/50 border ${RISK_BORDER[annotation.riskLevel]} 
                  p-4 pointer-events-none animate-in fade-in zoom-in-95 duration-200`}
      style={{
        [adjustedPosition === "left" ? "right" : "left"]: "calc(100% + 12px)",
        maxWidth: `${Math.min(320, pageWidth - 50)}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-white text-sm truncate pr-2">
          {annotation.riskType}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase shrink-0 ${RISK_BADGE[annotation.riskLevel]}`}
        >
          {annotation.riskLevel}
        </span>
      </div>

      {/* Flagged text */}
      <p className="text-xs text-gray-400 italic border-l-2 border-gray-600 pl-2 mb-3 line-clamp-2">
        &ldquo;{annotation.text}&rdquo;
      </p>

      {/* Explanation */}
      <div className="mb-2">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
          Why risky
        </p>
        <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
          {annotation.explanation}
        </p>
      </div>

      {/* Recommendation */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
          Recommendation
        </p>
        <p className="text-xs text-emerald-300 leading-relaxed line-clamp-2">
          {annotation.recommendation}
        </p>
      </div>
    </div>
  );
}
