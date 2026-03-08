import { HfInference } from "@huggingface/inference";

type HFResponse = {
  riskType: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendation: string;
  isFlagged: boolean;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function analyzeClause(
  clause: string
): Promise<HFResponse | null> {
  const hf = new HfInference(process.env.HF_API_TOKEN);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await hf.chatCompletion({
        model: "meta-llama/Llama-3.2-3B-Instruct",
        messages: [
          {
            role: "system",
            content: `You are LexAI, a Senior Corporate Legal Risk Advisor. Analyze the following contract clause.
Respond ONLY in this exact JSON format with no extra text:
{
  "riskType": "clause type name",
  "riskLevel": "HIGH" or "MEDIUM" or "LOW",
  "explanation": "why this clause is risky in 2 sentences",
  "recommendation": "what the user should do in 1 sentence",
  "isFlagged": true or false
}
If there is no risk, set isFlagged to false.`,
          },
          {
            role: "user",
            content: `CLAUSE: ${clause.slice(0, 800)}`,
          },
        ],
        max_tokens: 250,
        temperature: 0.1,
      });

      const rawText = response.choices[0]?.message?.content || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
         console.warn("Hugging Face did not return JSON:", rawText);
         return null;
      }

      const parsed = JSON.parse(jsonMatch[0]) as HFResponse;
      return parsed;
    } catch (error: any) {
      console.error(`Error analyzing clause (attempt ${attempt + 1}):`, error.message || error);
      
      // If it's a 4xx error (like Model Too Large or Unauthorized), stop retrying
      if (error.message?.includes("40") || error.message?.includes("not found") || error.message?.includes("too large")) {
        console.error("Fatal HF API configuration error. Check model compatibility and token.");
        break;
      }

      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  return null;
}
