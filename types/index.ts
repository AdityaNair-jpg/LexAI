export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export type Annotation = {
  _id: string;
  documentId: string;
  pageNumber: number;
  text: string;
  riskType: string;
  riskLevel: RiskLevel;
  explanation: string;
  recommendation: string;
  category?: string;
  proposedSolution?: string;
  replacementClause?: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type Document = {
  _id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  status: "uploading" | "processing" | "ready" | "error";
  pageCount?: number;
  uploadedAt: number;
};

export type AnalysisResult = {
  annotations: Omit<Annotation, "_id" | "documentId">[];
};
