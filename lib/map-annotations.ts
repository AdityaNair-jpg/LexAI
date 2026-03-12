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

    let pageNumber = 1;
    let boundingBox: { x: number; y: number; width: number; height: number };

    if (textItems && pageDimensions) {
      const match = findBestMatchingTextItem(
        clauses[i],
        textItems as TextItem[],
        pageDimensions as Map<number, PageDimensions>,
        pageNumber
      );
      
      if (match) {
        boundingBox = match;
      } else {
        const estimatedY = (i / clauses.length) * 80 + 5;
        boundingBox = {
          x: 5,
          y: estimatedY,
          width: 90,
          height: Math.max(4, (clauses[i].length / fullText.length) * 50),
        };
      }
    } else {
      const estimatedY = (i / clauses.length) * 80 + 5;
      boundingBox = {
        x: 5,
        y: estimatedY,
        width: 90,
        height: Math.max(4, (clauses[i].length / fullText.length) * 50),
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
