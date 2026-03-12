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
                content: "You are LexAI, a Senior Corporate Legal Risk Advisor specializing in contract analysis."
              },
              {
                role: "user",
                content: `Analyze the following contract clause for legal risks.

Return ONLY a JSON object with these exact fields (no extra text):
{
  "riskType": "Type of risky clause (e.g., Indemnification, Limitation of Liability, Auto-renewal)",
  "riskLevel": "HIGH, MEDIUM, or LOW",
  "explanation": "Brief explanation of why this clause is risky",
  "recommendation": "What action the user should take",
  "isFlagged": true or false
}

If the clause is standard and has no significant risks, set isFlagged to false.

CLAUSE:
${clause.slice(0, 1500)}`
              }
            ],
            temperature: 0.1,
            max_tokens: 500,
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
