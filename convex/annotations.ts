import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createMany = mutation({
  args: {
    documentId: v.id("documents"),
    annotations: v.array(
      v.object({
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
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const ann of args.annotations) {
      await ctx.db.insert("annotations", {
        documentId: args.documentId,
        ...ann,
      });
    }
  },
});

export const getByDocument = query({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("annotations")
      .withIndex("by_document", (q) => q.eq("documentId", args.documentId))
      .collect();
  },
});
