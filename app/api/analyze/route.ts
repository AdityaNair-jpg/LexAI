import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractTextFromPDF, splitIntoClauses } from "@/lib/extract-text";
import { extractTextWithCoordinates } from "@/lib/extract-text-coordinates";
import { analyzeClause } from "@/lib/analyze-document";
import { mapAnnotations } from "@/lib/map-annotations";

export async function POST(req: NextRequest) {
  try {
    const authResult = await auth();
    const userId = authResult.userId;
    
    if (!userId) {
      console.error("[API/analyze] Unauthorized: No userId from Clerk");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileUrl, documentId } = await req.json();
    console.log(`[API/analyze] Starting analysis for doc: ${documentId}, url: ${fileUrl}`);

    // 1. Fetch the PDF file
    console.log("[API/analyze] Fetching PDF from Convex storage...");
    let fileRes;
    try {
      fileRes = await fetch(fileUrl);
    } catch (e: any) {
      console.error("[API/analyze] Fetch network error:", e);
      return NextResponse.json({ error: `Fetch failed: ${e.message}` }, { status: 500 });
    }

    if (!fileRes.ok) {
      const text = await fileRes.text();
      console.error(`[API/analyze] Convex storage fetch failed: ${fileRes.status} - ${text}`);
      return NextResponse.json(
        { error: `Failed to fetch PDF from storage (${fileRes.status})` },
        { status: 500 }
      );
    }
    
    console.log("[API/analyze] Reading arrayBuffer...");
    const arrayBuffer = await fileRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract text from PDF
    console.log(`[API/analyze] Extracting text from buffer of size ${buffer.length}...`);
    let fullText = "";
    let textItems: any[] = [];
    let pageDimensions: any = new Map();
    
    try {
      const result = await extractTextFromPDF(buffer);
      fullText = result.text;
      console.log(`[API/analyze] Extracted ${fullText.length} characters of text`);
    } catch (e: any) {
      console.error("[API/analyze] PDF-parse error:", e);
      return NextResponse.json({ error: `PDF extraction failed: ${e.message}` }, { status: 500 });
    }

    // 2b. Extract text with coordinates for accurate bounding boxes
    try {
      const coordResult = await extractTextWithCoordinates(buffer);
      textItems = coordResult.textItems;
      pageDimensions = coordResult.pageDimensions;
      console.log(`[API/analyze] Extracted ${textItems.length} text items with coordinates`);
    } catch (e: any) {
      console.warn("[API/analyze] Coordinate extraction failed, using estimates:", e);
    }

    // 3. Split into clauses
    const clauses = splitIntoClauses(fullText);
    console.log(`[API/analyze] Split into ${clauses.length} clauses`);

    if (clauses.length === 0) {
      return NextResponse.json({ annotations: [] });
    }

    // 4. Analyze each clause
    console.log("[API/analyze] Sending clauses to HuggingFace...");
    const results = [];
    try {
      for (const clause of clauses) {
        const result = await analyzeClause(clause);
        if (result && result.isFlagged) {
          results.push(result);
        } else {
          results.push(null);
        }
      }
    } catch (e: any) {
      console.error("[API/analyze] HuggingFace analysis error:", e);
      // We don't fail the whole route if one clause fails, but if HF outright fails:
      return NextResponse.json({ error: `AI Analysis failed: ${e.message}` }, { status: 500 });
    }

    // 5. Map results
    console.log("[API/analyze] Mapping annotations...");
    const annotations = mapAnnotations(
      clauses, 
      results, 
      fullText, 
      textItems.length > 0 ? textItems : undefined,
      pageDimensions.size > 0 ? pageDimensions : undefined
    );
    
    console.log(`[API/analyze] Successfully returning ${annotations.length} annotations`);
    return NextResponse.json({ annotations, documentId });
    
  } catch (error: any) {
    console.error("[API/analyze] Unhandled top-level error:", error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || String(error)}` },
      { status: 500 }
    );
  }
}
