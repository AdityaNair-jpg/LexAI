import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

type HFResponse = {
  riskType: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendation: string;
  category: string;
  proposedSolution: string;
  replacementClause: string;
  isFlagged: boolean;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CATEGORIES = [
  "Liability",
  "Termination",
  "Data Privacy",
  "Payment",
  "Intellectual Property",
  "Confidentiality",
  "Dispute Resolution",
  "Governance",
  "Indemnification",
  "Warranty",
  "Force Majeure",
  "Assignment",
  "Notice",
  "Amendment",
  "Other"
].join(", ");

export async function analyzeClause(
  clause: string
): Promise<HFResponse | null> {
  const apiKey = process.env.HF_API_TOKEN;
  
  if (!apiKey) {
    console.error("[Huggingface] No API key found. Set HF_API_TOKEN in .env.local");
    return null;
  }

  const google = createGoogleGenerativeAI({
    apiKey: apiKey,
  });

  const model = google("gemini-3-flash-preview");

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[Huggingface] Calling API (attempt ${attempt + 1})...`);
      
      const { text } = await generateText({
        model: model,
        system: "You are LexAI, a Senior Corporate Legal Risk Advisor specializing in contract analysis. For each risky clause, you must provide not just identification but actionable PRESCRIPTIVE solutions.",
        prompt: `Analyze the following contract clause for legal risks and provide PRESCRIPTIVE solutions.

First, identify the clause category from this list: ${CATEGORIES}

Return ONLY a valid JSON object with these exact fields:
{
  "riskType": "The specific type (e.g., Indemnification, Limitation of Liability)",
  "category": "The category from the list above (e.g., Liability, Termination)",
  "riskLevel": "HIGH if significantly disadvantages client, MEDIUM if moderately risky, LOW if minor concern",
  "explanation": "2-3 sentence explanation of why this clause is risky and what specific language is concerning",
  "recommendation": "1-2 sentence recommendation on how to address this clause",
  "proposedSolution": "A clear, plain-English explanation of how to fix or mitigate this risk. Be specific and actionable.",
  "replacementClause": "A neutralized, fair legal clause text that achieves the same purpose but protects both parties. If not applicable, use null.",
  "isFlagged": true if this clause poses any risk, false only if completely standard and fair
}

Be strict with flagging. For every risky clause, provide a concrete proposed solution and, where possible, replacement clause text.

CLAUSE:
${clause.slice(0, 2000)}`,
        temperature: 0.2,
      });

      console.log("[Huggingface] Response received");
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.warn("[Huggingface] No JSON found in response:", text);
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]) as HFResponse;
      
      if (parsed.riskLevel) {
        parsed.riskLevel = (parsed.riskLevel as string).toUpperCase() as "HIGH" | "MEDIUM" | "LOW";
        if (!["HIGH", "MEDIUM", "LOW"].includes(parsed.riskLevel)) {
          parsed.riskLevel = "MEDIUM";
        }
      }

      if (!parsed.riskType) {
        parsed.riskType = "Other";
      }

      if (!parsed.category) {
        parsed.category = "Other";
      }

      if (!parsed.proposedSolution) {
        parsed.proposedSolution = parsed.recommendation || "Review with legal counsel";
      }

      if (!parsed.replacementClause) {
        parsed.replacementClause = "";
      }
      
      return parsed;
    } catch (error: any) {
      console.error(`[Huggingface] Error (attempt ${attempt + 1}):`, error.message);

      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  return null;
}


