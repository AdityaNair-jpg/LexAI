const pdf = require("pdf-parse");

export async function extractTextFromPDF(
  buffer: Buffer
): Promise<{ text: string; pageCount: number }> {
  const pdfData = await pdf(buffer);
  return {
    text: pdfData.text,
    pageCount: pdfData.numpages,
  };
}

function splitByLegalPatterns(text: string): string[] {
  const patterns = [
    "\nARTICLE ",
    "\nArticle ",
    "\nSECTION ",
    "\nSection ",
    "\n1. ",
    "\n2. ",
    "\n3. ",
    "\n4. ",
    "\n5. ",
    "\n6. ",
    "\n7. ",
    "\n8. ",
    "\n9. ",
    "\n§ ",
    "\nCLAUSE ",
    "\nDEFINITION",
    "\nINDEMNIFICATION",
    "\nLIABILITY",
    "\nTERMINATION",
    "\nCANCELLATION",
    "\nCONFIDENTIALITY",
    "\nNON-DISCLOSURE",
    "\nPAYMENT",
    "\nWARRANTY",
    "\nDISCLAIMER",
    "\nFORCE MAJEURE",
    "\nGOVERNING LAW",
    "\nJURISDICTION",
    "\nASSIGNMENT",
    "\nTRANSFER",
    "\nNOTICE Period",
    "\nDISPUTE",
    "\nARBITRATION",
    "\nDATA PRIVACY",
    "\nGDPR",
  ];

  let splitPoints: number[] = [0];

  for (const pattern of patterns) {
    let idx = 0;
    while ((idx = text.indexOf(pattern, idx)) !== -1) {
      splitPoints.push(idx);
      idx += pattern.length;
    }
  }

  splitPoints = [...new Set(splitPoints)].sort((a, b) => a - b);

  const clauses: string[] = [];
  for (let i = 0; i < splitPoints.length; i++) {
    const start = splitPoints[i];
    const end = i < splitPoints.length - 1 ? splitPoints[i + 1] : text.length;
    const clause = text.slice(start, end).trim().replace(/\s+/g, " ");
    if (clause.length > 30) {
      clauses.push(clause);
    }
  }

  return clauses;
}

export function splitIntoClauses(text: string): string[] {
  let clauses = splitByLegalPatterns(text);

  if (clauses.length < 3) {
    clauses = text
      .split(/\n{2,}/)
      .map((c) => c.trim())
      .filter((c) => c.length > 30);
  }

  const cleanedClauses = clauses
    .map((c) => c.replace(/\s+/g, " ").trim())
    .filter((c) => c.length > 30);

  const seen = new Set<string>();
  const uniqueClauses: string[] = [];
  
  for (const clause of cleanedClauses) {
    const normalized = clause.toLowerCase().slice(0, 50);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueClauses.push(clause);
    }
  }

  return uniqueClauses.slice(0, 50);
}
