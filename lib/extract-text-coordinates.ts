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

export async function extractTextWithCoordinates(
  buffer: Buffer
): Promise<{
  textItems: TextItem[];
  pageDimensions: Map<number, PageDimensions>;
}> {
  const pdfjs = await import("pdfjs-dist");
  
  const pdfData = await pdfjs.getDocument({ data: buffer }).promise;
  const textItems: TextItem[] = [];
  const pageDimensions = new Map<number, PageDimensions>();

  for (let pageNum = 1; pageNum <= pdfData.numPages; pageNum++) {
    const page = await pdfData.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    
    pageDimensions.set(pageNum, {
      width: viewport.width,
      height: viewport.height,
    });

    const textContent = await page.getTextContent();
    
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
      }
    }
  }

  return { textItems, pageDimensions };
}

export function findBestMatchingTextItem(
  clause: string,
  textItems: TextItem[],
  pageDimensions: Map<number, PageDimensions>,
  pageNum: number
): { x: number; y: number; width: number; height: number } | null {
  const pageItems = textItems.filter((item) => item.pageNumber === pageNum);
  
  let bestMatch: TextItem | null = null;
  let bestScore = 0;

  for (const item of pageItems) {
    const itemText = item.str.toLowerCase().replace(/\s+/g, " ");
    const clauseText = clause.toLowerCase().replace(/\s+/g, " ");
    
    if (itemText.includes(clauseText) || clauseText.includes(itemText)) {
      const score = Math.min(itemText.length, clauseText.length);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }
  }

  if (bestMatch) {
    const transform = bestMatch.transform;
    const pageDim = pageDimensions.get(pageNum) || { width: 612, height: 792 };
    return {
      x: (transform[4] / pageDim.width) * 100,
      y: (transform[5] / pageDim.height) * 100,
      width: (bestMatch.width / pageDim.width) * 100,
      height: (bestMatch.height / pageDim.height) * 100,
    };
  }

  return null;
}
