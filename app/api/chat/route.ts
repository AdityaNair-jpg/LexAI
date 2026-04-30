import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, documentContext } = await req.json();

    const documentText = documentContext?.fullText || "No document text available";
    const annotations = documentContext?.annotations || [];

    const annotationsSummary = annotations
      .map((ann: any) => {
        return `- ${ann.riskType} (${ann.riskLevel} risk): ${ann.explanation}
  Proposed Solution: ${ann.proposedSolution || "Not provided"}
  Replacement Clause: ${ann.replacementClause || "Not provided"}`;
      })
      .join("\n\n");

    const systemPrompt = `You are LexAI, a Senior Corporate Legal Risk Advisor assistant. You are helpful, precise, and professional.

You have access to a legal contract document that has been analyzed for risks. You can answer questions about:
1. The document's content and clauses
2. Identified risks and their explanations
3. Proposed solutions for mitigating risks
4. Replacement clause suggestions
5. General legal contract questions

Here's the analyzed document:

=== DOCUMENT TEXT ===
${documentText}

=== IDENTIFIED RISKS ===
${annotationsSummary || "No risks identified"}

When answering questions:
- Be specific and reference the actual clauses when possible
- Provide actionable advice
- If asked about a specific risk, explain it clearly and suggest solutions
- If you don't know something, say so honestly
- Keep responses concise but comprehensive

Current date: ${new Date().toLocaleDateString()}`;

    const apiKey = process.env.HF_API_TOKEN;
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });
    const model = google("gemini-3-flash-preview");

    console.log("[Huggingface/Chat] Calling API...");

    const result = streamText({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("[Huggingface/Chat] Error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


