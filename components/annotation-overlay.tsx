"use client";

import { useState } from "react";
import { AnnotationTooltip } from "./annotation-tooltip";
import type { Annotation } from "@/types";

const RISK_COLORS: Record<string, string> = {
  HIGH: "bg-red-400/25 border-l-red-500 hover:bg-red-400/40",
  MEDIUM: "bg-amber-400/25 border-l-amber-500 hover:bg-amber-400/40",
  LOW: "bg-sky-400/25 border-l-sky-500 hover:bg-sky-400/40",
};

type Props = {
  annotations: Annotation[];
  pageWidth: number;
};

export function AnnotationOverlay({ annotations, pageWidth }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {annotations.map((ann) => (
        <div
          key={ann._id}
          className={`absolute border-l-4 cursor-pointer pointer-events-auto 
                      transition-all duration-200 rounded-sm backdrop-blur-[1px]
                      ${RISK_COLORS[ann.riskLevel] || RISK_COLORS.MEDIUM}`}
          style={{
            left: `${ann.boundingBox.x}%`,
            top: `${ann.boundingBox.y}%`,
            width: `${ann.boundingBox.width}%`,
            height: `${ann.boundingBox.height}%`,
            minHeight: "1.5rem",
          }}
          onMouseEnter={() => setActiveId(ann._id)}
          onMouseLeave={() => setActiveId(null)}
        >
          {activeId === ann._id && <AnnotationTooltip annotation={ann} />}
        </div>
      ))}
    </div>
  );
}
