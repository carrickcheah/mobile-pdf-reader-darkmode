import { useState, useEffect, useRef, useCallback } from "react";
import { downloadPdf } from "../lib/api";
import { parsePdf, type ParsedPdf } from "../lib/pdf-parser";
import { useReaderSettings } from "../hooks/useReaderSettings";
import { usePagination } from "../hooks/usePagination";
import ControlsBar from "./ControlsBar";
import ProgressBar from "./ProgressBar";

interface Props {
  bookId: string;
  onBack: () => void;
}

export default function Reader({ bookId, onBack }: Props) {
  const [parsed, setParsed] = useState<ParsedPdf | null>(null);
  const [parseProgress, setParseProgress] = useState("");
  const [showControls, setShowControls] = useState(false);
  const { settings, update } = useReaderSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchUsedRef = useRef(false);

  const allParagraphs = parsed?.pages.flatMap((p) => p.paragraphs) ?? [];

  const { currentPage, totalPages, pageContent, goNext, goPrev, progress } =
    usePagination(allParagraphs, settings, containerRef);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await downloadPdf(bookId);
        if (cancelled) return;
        const result = await parsePdf(data, (page, total) => {
          if (!cancelled) setParseProgress(`Parsing page ${page} of ${total}...`);
        });
        if (!cancelled) {
          setParsed(result);
          setParseProgress("");
        }
      } catch {
        if (!cancelled) setParseProgress("Failed to load book.");
      }
    })();
    return () => { cancelled = true; };
  }, [bookId]);

  const handleTap = useCallback(
    (clientX: number, width: number) => {
      const zone = clientX / width;
      if (zone < 0.3) goPrev();
      else if (zone > 0.7) goNext();
      else setShowControls(true);
    },
    [goNext, goPrev]
  );

  const handleClick = (e: React.MouseEvent) => {
    if (touchUsedRef.current) { touchUsedRef.current = false; return; }
    handleTap(e.clientX, window.innerWidth);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const start = touchStartRef.current;
    if (!start) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    touchUsedRef.current = true;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext();
      else goPrev();
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      handleTap(touch.clientX, window.innerWidth);
    }

    touchStartRef.current = null;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); goNext(); }
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); goPrev(); }
      else if (e.key === "Escape") showControls ? setShowControls(false) : onBack();
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) goNext();
      else if (e.deltaY < 0) goPrev();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [goNext, goPrev, onBack, showControls]);

  if (!parsed) {
    return (
      <div style={styles.loading}>
        <p style={styles.loadingText}>{parseProgress || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={styles.container}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          ...styles.content,
          fontSize: settings.fontSize,
          fontFamily: settings.fontFamily,
          lineHeight: settings.lineHeight,
          padding: settings.margin,
        }}
      >
        {pageContent.map((para, i) => (
          <p key={`${currentPage}-${i}`} style={styles.paragraph}>
            {para}
          </p>
        ))}
      </div>

      <ProgressBar
        currentPage={currentPage}
        totalPages={totalPages}
        progress={progress}
        onBack={onBack}
      />

      {showControls && (
        <ControlsBar
          settings={settings}
          onChange={update}
          onClose={() => setShowControls(false)}
        />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    position: "relative",
    overflow: "hidden",
    cursor: "default",
    userSelect: "text",
    background: "#121212",
  },
  content: {
    height: "100%",
    overflow: "hidden",
    background: "#121212",
  },
  paragraph: {
    marginBottom: "0.7em",
    color: "#e0e0e0",
    fontWeight: 600,
  },
  loading: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#555",
    fontSize: 14,
  },
};
