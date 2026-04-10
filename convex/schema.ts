import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  documents: defineTable({
    userId: v.string(),
    fileName: v.string(),
    fileStorageId: v.string(),
    fileUrl: v.string(),
    status: v.union(
      v.literal("uploading"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("error")
    ),
    pageCount: v.optional(v.number()),
    uploadedAt: v.number(),
  }).index("by_user", ["userId"]),

  annotations: defineTable({
    documentId: v.id("documents"),
    pageNumber: v.number(),
    text: v.string(),
    riskType: v.string(),
    riskLevel: v.union(
      v.literal("HIGH"),
      v.literal("MEDIUM"),
      v.literal("LOW")
    ),
    explanation: v.string(),
    recommendation: v.string(),
    category: v.optional(v.string()),
    proposedSolution: v.optional(v.string()),
    replacementClause: v.optional(v.string()),
    boundingBox: v.object({
      x: v.number(),
      y: v.number(),
      width: v.number(),
      height: v.number(),
    }),
  }).index("by_document", ["documentId"]),
});
