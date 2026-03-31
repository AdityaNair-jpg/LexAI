import type { Annotation } from "@/types";

//badge
const RISK_BADGE: Record<string, string> = {
  HIGH: "bg-red-50 text-red-700 border border-red-100",
  MEDIUM: "bg-[#9a7b4f]/10 text-[#9a7b4f] border border-[#9a7b4f]/20",
  LOW: "bg-blue-50 text-blue-700 border border-blue-100",
};

const RISK_BORDER: Record<string, string> = {
  HIGH: "border-red-100 shadow-red-100/20",
  MEDIUM: "border-[#9a7b4f]/20 shadow-[#9a7b4f]/10",
  LOW: "border-blue-100 shadow-blue-100/20",
};

export function AnnotationTooltip({
  annotation,
  pageWidth = 800,
}: {
  annotation: Annotation;
  position?: "left" | "right";
  pageWidth?: number;
}) {
  const isRightSide = annotation.boundingBox.x > 50;
  const adjustedPosition = isRightSide ? "right" : "left";

  return (
    <div
      className={`absolute z-[100] top-0 w-80 max-w-[95vw] bg-white/95 backdrop-blur-2xl 
                  rounded-[2rem] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] border ${RISK_BORDER[annotation.riskLevel]} 
                  p-6 pointer-events-none animate-in fade-in zoom-in-95 duration-300 ring-1 ring-black/5`}
      style={{
        [adjustedPosition === "left" ? "right" : "left"]: "calc(100% + 16px)",
        maxWidth: `${Math.min(340, pageWidth - 40)}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-serif font-medium text-stone-900 text-sm truncate pr-2">
          {annotation.category || "Audit Point"}
        </span>
        <span
          className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest shrink-0 ${RISK_BADGE[annotation.riskLevel]}`}
        >
          {annotation.riskLevel}
        </span>
      </div>

      {/* Flagged text */}
      <div className="relative pl-3 mb-4 border-l-2 border-stone-100">
        <p className="text-[11px] text-stone-400 italic line-clamp-3 leading-relaxed">
          &ldquo;{annotation.text}&rdquo;
        </p>
      </div>

      {/* Explanation */}
      <div className="mb-4">
        <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest mb-1.5">
          Guidance
        </p>
        <p className="text-xs text-stone-700 leading-relaxed font-serif line-clamp-4">
          {annotation.explanation}
        </p>
      </div>

      {/* Recommendation */}
      <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
        <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5">
          Recommendation
        </p>
        <p className="text-xs text-emerald-700 leading-relaxed font-serif line-clamp-3">
          {annotation.recommendation}
        </p>
      </div>
    </div>
  );
}
