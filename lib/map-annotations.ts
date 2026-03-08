type RawAnnotation = {
  riskType: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendation: string;
};

export function mapAnnotations(
  clauses: string[],
  results: (RawAnnotation | null)[],
  fullText: string
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

    // Estimate vertical position based on clause index within the text
    const estimatedY = (i / clauses.length) * 100;

    annotations.push({
      pageNumber: 1,
      text: clauses[i].slice(0, 200),
      riskType: result.riskType || "Unknown",
      riskLevel: result.riskLevel || "MEDIUM",
      explanation: result.explanation || "",
      recommendation: result.recommendation || "",
      boundingBox: {
        x: 5,
        y: estimatedY,
        width: 90,
        height: Math.max(3, (clauses[i].length / fullText.length) * 100),
      },
    });
  }

  return annotations;
}
