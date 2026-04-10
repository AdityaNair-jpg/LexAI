"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnnotationTooltip } from "./annotation-tooltip";
import type { Annotation } from "@/types";

const RISK_COLORS: Record<string, string> = {
  HIGH: "bg-red-500/10 border-l-red-500 hover:bg-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]",
  MEDIUM: "bg-[#9a7b4f]/10 border-l-[#9a7b4f] hover:bg-[#9a7b4f]/20 shadow-[0_0_10px_rgba(154,123,79,0.05)]",
  LOW: "bg-blue-500/10 border-l-blue-500 hover:bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.05)]",
};

type Props = {
  annotations: Annotation[];
  pageWidth: number;
};

type TooltipState = {
  annotation: Annotation | null;
  position: { x: number; y: number };
  side: "left" | "right";
};

export function AnnotationOverlay({ annotations, pageWidth }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    annotation: null,
    position: { x: 0, y: 0 },
    side: "left",
  });
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMouseEnter = (ann: Annotation, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;
    const side = x > window.innerWidth / 2 ? "left" : "right";
    
    setTooltip({
      annotation: ann,
      position: { x, y },
      side,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ annotation: null, position: { x: 0, y: 0 }, side: "left" });
  };

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 pointer-events-none select-none">
        {annotations.map((ann) => (
          <div
            key={ann._id}
            className={`absolute border-l-2 cursor-pointer pointer-events-auto 
                        transition-all duration-300 rounded-sm
                        ${RISK_COLORS[ann.riskLevel] || RISK_COLORS.MEDIUM}`}
            style={{
              left: `${Math.max(0, Math.min(95, ann.boundingBox.x))}%`,
              top: `${Math.max(0, Math.min(95, ann.boundingBox.y))}%`,
              width: `${Math.max(5, Math.min(90, ann.boundingBox.width))}%`,
              height: `${Math.max(2.5, Math.min(30, ann.boundingBox.height))}%`,
              minHeight: "1.25rem",
            }}
            onMouseEnter={(e) => handleMouseEnter(ann, e.currentTarget)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
      
      {isClient && tooltip.annotation && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: tooltip.side === "left" 
              ? Math.min(tooltip.position.x + 24, window.innerWidth - 380)
              : Math.max(tooltip.position.x - 380, 20),
            top: Math.min(tooltip.position.y - 12, window.innerHeight - 450),
          }}
        >
          <AnnotationTooltip 
            annotation={tooltip.annotation}
            position={tooltip.side}
            pageWidth={pageWidth}
          />
        </div>,
        document.body
      )}
    </>
  );
}
