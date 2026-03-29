export interface TextItem {
  str: string;
  transform: number[];
  width: number;
  height: number;
  pageNumber: number;
}

export interface PageDimensions {
  width: number;
  height: number;
}

export interface TextMatchResult {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}

export async function extractTextWithCoordinates(
  buffer: Buffer
): Promise<{
  textItems: TextItem[];
  pageDimensions: Map<number, PageDimensions>;
  fullText: string;
}> {
  const pdfjs = await import("pdfjs-dist");
  
  const pdfData = await pdfjs.getDocument({ data: buffer }).promise;
  const textItems: TextItem[] = [];
  const pageDimensions = new Map<number, PageDimensions>();
  const allPageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdfData.numPages; pageNum++) {
    const page = await pdfData.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    
    pageDimensions.set(pageNum, {
      width: viewport.width,
      height: viewport.height,
    });

    const textContent = await page.getTextContent();
    let pageText = "";
    
    for (const item of textContent.items) {
      if ("str" in item && item.str.trim()) {
        const tx = item.transform;
        textItems.push({
          str: item.str,
          transform: tx,
          width: item.width || 0,
          height: item.height || 0,
          pageNumber: pageNum,
        });
        pageText += item.str + " ";
      }
    }
    allPageTexts.push(pageText.trim());
  }

  return { textItems, pageDimensions, fullText: allPageTexts.join("\n\n") };
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function calculateSimilarity(text1: string, text2: string): number {
  const norm1 = normalizeText(text1);
  const norm2 = normalizeText(text2);
  
  if (norm1.includes(norm2)) return norm2.length / norm1.length;
  if (norm2.includes(norm1)) return norm1.length / norm2.length;
  
  // Simple word overlap
  const words1 = new Set(norm1.split(" "));
  const words2 = new Set(norm2.split(" "));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  
  if (intersection.size === 0) return 0;
  
  return intersection.size / Math.max(words1.size, words2.size);
}

export function findBestMatchingTextItem(
  clause: string,
  textItems: TextItem[],
  pageDimensions: Map<number, PageDimensions>
): TextMatchResult | null {
  let bestMatch: { item: TextItem; score: number } | null = null;

  for (const item of textItems) {
    const itemText = item.str;
    const score = calculateSimilarity(itemText, clause);
    
    if (score > (bestMatch?.score || 0) && score > 0.3) {
      bestMatch = { item, score };
    }
  }

  if (bestMatch) {
    const matchItem = bestMatch.item;
    const pageNum = matchItem.pageNumber;
    const pageDim = pageDimensions.get(pageNum) || { width: 612, height: 792 };
    const transform = matchItem.transform;

    // PDF coordinates have origin at bottom-left, convert to top-left for web
    const x = (transform[4] / pageDim.width) * 100;
    const y = 100 - ((transform[5] + (matchItem.height || 10)) / pageDim.height) * 100;
    const width = ((matchItem.width || 100) / pageDim.width) * 100;
    const height = ((matchItem.height || 10) / pageDim.height) * 100;

    return {
      x: Math.max(0, Math.min(95, x)),
      y: Math.max(0, Math.min(95, y)),
      width: Math.max(5, Math.min(95, width)),
      height: Math.max(3, Math.min(30, height * 1.5)),
      pageNumber: pageNum,
    };
  }

  return null;
}
