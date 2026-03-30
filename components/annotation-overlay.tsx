"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
    const containerRect = containerRef.current?.getBoundingClientRect();
    
    if (containerRect) {
      // Calculate position relative to the viewport
      const x = rect.left + rect.width / 2;
      const y = rect.top;
      
      // Determine which side to show tooltip
      const side = x > window.innerWidth / 2 ? "left" : "right";
      
      setTooltip({
        annotation: ann,
        position: { x, y },
        side,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ annotation: null, position: { x: 0, y: 0 }, side: "left" });
  };

  return (
    <>
      <div ref={containerRef} className="absolute inset-0 pointer-events-none">
        {annotations.map((ann) => (
          <div
            key={ann._id}
            className={`absolute border-l-4 cursor-pointer pointer-events-auto 
                        transition-all duration-200 rounded-sm backdrop-blur-[1px]
                        ${RISK_COLORS[ann.riskLevel] || RISK_COLORS.MEDIUM}`}
            style={{
              left: `${Math.max(0, Math.min(95, ann.boundingBox.x))}%`,
              top: `${Math.max(0, Math.min(95, ann.boundingBox.y))}%`,
              width: `${Math.max(5, Math.min(90, ann.boundingBox.width))}%`,
              height: `${Math.max(3, Math.min(30, ann.boundingBox.height))}%`,
              minHeight: "1.5rem",
            }}
            onMouseEnter={(e) => handleMouseEnter(ann, e.currentTarget)}
            onMouseLeave={handleMouseLeave}
          />
        ))}
      </div>
      
      {isClient && tooltip.annotation && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: tooltip.side === "left" 
              ? Math.min(tooltip.position.x + 20, window.innerWidth - 340)
              : Math.max(tooltip.position.x - 340, 10),
            top: Math.min(tooltip.position.y - 10, window.innerHeight - 400),
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
