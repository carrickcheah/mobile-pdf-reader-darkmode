import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export interface ParsedPage {
  pageNumber: number;
  paragraphs: string[];
}

export interface ParsedPdf {
  pages: ParsedPage[];
  pageCount: number;
}

export async function parsePdf(
  data: ArrayBuffer,
  onProgress?: (page: number, total: number) => void
): Promise<ParsedPdf> {
  const pdf = await pdfjsLib.getDocument({ data }).promise;
  try {
    const pages: ParsedPage[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress?.(i, pdf.numPages);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const paragraphs: string[] = [];
      let currentLine = "";
      let lastY: number | null = null;

      for (const item of content.items) {
        if (!("str" in item)) continue;
        const textItem = item as { str: string; transform: number[] };
        const y = textItem.transform[5];

        if (lastY !== null && Math.abs(y - lastY) > 12) {
          if (currentLine.trim()) {
            paragraphs.push(currentLine.trim());
          }
          currentLine = textItem.str;
        } else {
          currentLine += textItem.str;
        }
        lastY = y;
      }

      if (currentLine.trim()) {
        paragraphs.push(currentLine.trim());
      }

      if (paragraphs.length > 0) {
        pages.push({ pageNumber: i, paragraphs });
      }
    }

    return { pages, pageCount: pdf.numPages };
  } finally {
    await pdf.destroy();
  }
}
