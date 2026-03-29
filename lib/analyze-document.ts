type HFResponse = {
  riskType: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  recommendation: string;
  isFlagged: boolean;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CLAUSE_TYPES = [
  "Indemnification",
  "Limitation of Liability",
  "Auto-renewal",
  "Termination",
  "Confidentiality",
  "Non-disclosure",
  "Force Majeure",
  "Governing Law",
  "Jurisdiction",
  "Intellectual Property",
  "Payment Terms",
  "Warranty",
  "Disclaimer",
  "Assignment",
  "Transfer",
  "Notice Period",
  "Dispute Resolution",
  "Arbitration",
  "Data Privacy",
  "GDPR",
  "Liability Cap",
  "Exclusivity",
  "Non-compete",
  "Non-solicitation",
  "Entire Agreement",
  "Amendment",
  "Waiver",
  "Severability",
  "Counterparts",
  "Other"
].join(", ");

export async function analyzeClause(
  clause: string
): Promise<HFResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error("[OpenAI] No API key found. Set OPENAI_API_KEY in .env.local");
    return null;
  }

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      console.log(`[OpenAI] Calling API (attempt ${attempt + 1})...`);
      
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are LexAI, a Senior Corporate Legal Risk Advisor specializing in contract analysis. Analyze each clause carefully for potential risks to the client."
              },
              {
                role: "user",
                content: `Analyze the following contract clause for legal risks.

Identify the clause type from this list: ${CLAUSE_TYPES}

Return ONLY a valid JSON object with these exact fields:
{
  "riskType": "The specific type from the list above (e.g., Indemnification, Limitation of Liability)",
  "riskLevel": "HIGH if the clause significantly disadvantages the client, MEDIUM if moderately risky, LOW if minor concern",
  "explanation": "2-3 sentence explanation of why this clause is risky and what specific language is concerning",
  "recommendation": "1-2 sentence recommendation on how to address this clause",
  "isFlagged": true if this clause poses any risk (riskLevel HIGH, MEDIUM, or LOW), false only if completely standard and fair
}

Be strict with flagging - err on the side of flagging potentially problematic clauses.

CLAUSE:
${clause.slice(0, 2000)}`
              }
            ],
            temperature: 0.2,
            max_tokens: 600,
            response_format: { type: "json_object" }
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[OpenAI] API error (${response.status}):`, errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("[OpenAI] Response received");
      
      const rawText = data.choices?.[0]?.message?.content || "";
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.warn("[OpenAI] No JSON found in response:", rawText);
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]) as HFResponse;
      
      if (parsed.riskLevel) {
        parsed.riskLevel = parsed.riskLevel.toUpperCase() as "HIGH" | "MEDIUM" | "LOW";
        if (!["HIGH", "MEDIUM", "LOW"].includes(parsed.riskLevel)) {
          parsed.riskLevel = "MEDIUM";
        }
      }

      if (!parsed.riskType) {
        parsed.riskType = "Other";
      }
      
      return parsed;
    } catch (error: any) {
      console.error(`[OpenAI] Error (attempt ${attempt + 1}):`, error.message);

      if (attempt < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY_MS);
      }
    }
  }

  return null;
}
