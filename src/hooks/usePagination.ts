import { useState, useCallback, useEffect, useRef } from "react";
import type { ReaderSettings } from "./useReaderSettings";

export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  pageContent: string[];
  goNext: () => void;
  goPrev: () => void;
  goTo: (page: number) => void;
  progress: number;
}

export function usePagination(
  paragraphs: string[],
  settings: ReaderSettings,
  containerRef: React.RefObject<HTMLDivElement | null>
): PaginationResult {
  const [pages, setPages] = useState<string[][]>([[]]);
  const [currentPage, setCurrentPage] = useState(0);
  const paginatingRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || paragraphs.length === 0 || paginatingRef.current) return;

    paginatingRef.current = true;
    const measure = document.createElement("div");

    try {
      measure.style.cssText = `
        position: absolute; visibility: hidden; pointer-events: none;
        width: ${container.clientWidth - settings.margin * 2}px;
        font-size: ${settings.fontSize}px;
        font-family: ${settings.fontFamily};
        line-height: ${settings.lineHeight};
        padding: ${settings.margin}px;
      `;
      document.body.appendChild(measure);

      const availableHeight = container.clientHeight - settings.margin * 2;
      const result: string[][] = [];
      let currentPageParagraphs: string[] = [];
      let currentHeight = 0;

      const paraSpacing = settings.fontSize * settings.lineHeight * 0.7;

      for (const para of paragraphs) {
        const el = document.createElement("p");
        el.style.marginBottom = `${paraSpacing}px`;
        el.textContent = para;
        measure.appendChild(el);
        const paraHeight = el.offsetHeight + paraSpacing;
        measure.removeChild(el);

        if (currentHeight + paraHeight > availableHeight && currentPageParagraphs.length > 0) {
          result.push(currentPageParagraphs);
          currentPageParagraphs = [para];
          currentHeight = paraHeight;
        } else {
          currentPageParagraphs.push(para);
          currentHeight += paraHeight;
        }
      }

      if (currentPageParagraphs.length > 0) {
        result.push(currentPageParagraphs);
      }

      setPages(result.length > 0 ? result : [[]]);
      setCurrentPage((prev) => Math.min(prev, Math.max(0, result.length - 1)));
    } finally {
      if (measure.parentNode) document.body.removeChild(measure);
      paginatingRef.current = false;
    }
  }, [paragraphs, settings, containerRef]);

  const goNext = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
  }, [pages.length]);

  const goPrev = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 0));
  }, []);

  const goTo = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(0, Math.min(page, pages.length - 1)));
    },
    [pages.length]
  );

  const progress = pages.length > 1 ? currentPage / (pages.length - 1) : 0;

  return {
    currentPage: currentPage + 1,
    totalPages: pages.length,
    pageContent: pages[currentPage] ?? [],
    goNext,
    goPrev,
    goTo,
    progress,
  };
}
