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

export function splitIntoClauses(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter((c) => c.length > 50)
    .slice(0, 20);
}
