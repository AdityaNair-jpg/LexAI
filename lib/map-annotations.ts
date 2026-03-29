import { findBestMatchingTextItem, TextItem, PageDimensions } from "./extract-text-coordinates";

type RawAnnotation = {
  riskType: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendation: string;
};

type TextItemInput = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  pageNumber: number;
};

type PageDimInput = Map<number, { width: number; height: number }>;

export function mapAnnotations(
  clauses: string[],
  results: (RawAnnotation | null)[],
  fullText: string,
  textItems?: TextItemInput[],
  pageDimensions?: PageDimInput
): Array<{
  pageNumber: number;
  text: string;
  riskType: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendation: string;
  boundingBox: { x: number; y: number; width: number; height: number };
}> {
  const annotations = [];

  for (let i = 0; i < clauses.length; i++) {
    const result = results[i];
    if (!result) continue;

    const totalFlagged = results.filter(r => r !== null).length || 1;
    const positionIndex = results.slice(0, i).filter(r => r !== null).length;
    
    const baseY = 5 + (positionIndex / Math.max(totalFlagged - 1, 1)) * 80;
    const xOffset = (i % 3) * 3;
    const clauseLength = clauses[i].length;
    const heightBasedOnLength = Math.max(4, Math.min(12, clauseLength / 80));

    let boundingBox: { x: number; y: number; width: number; height: number };
    let pageNumber = 1;

    if (textItems && pageDimensions && textItems.length > 0) {
      const match = findBestMatchingTextItem(
        clauses[i],
        textItems as TextItem[],
        pageDimensions as Map<number, PageDimensions>
      );
      
      if (match) {
        boundingBox = {
          x: match.x,
          y: match.y,
          width: match.width,
          height: match.height,
        };
        pageNumber = match.pageNumber || 1;
      } else {
        boundingBox = {
          x: 3 + xOffset,
          y: baseY,
          width: 94,
          height: heightBasedOnLength,
        };
      }
    } else {
      boundingBox = {
        x: 3 + xOffset,
        y: baseY,
        width: 94,
        height: heightBasedOnLength,
      };
    }

    annotations.push({
      pageNumber,
      text: clauses[i].slice(0, 200),
      riskType: result.riskType || "Unknown",
      riskLevel: result.riskLevel || "MEDIUM",
      explanation: result.explanation || "",
      recommendation: result.recommendation || "",
      boundingBox,
    });
  }

  return annotations;
}
