import { useEffect, useState, useRef } from "react";
import { getAllPdfs, savePdf, deletePdf, type PdfRecord } from "../lib/storage";
import { parsePdf } from "../lib/pdf-parser";

interface Props {
  onOpen: (id: string) => void;
  onLogout: () => void;
}

export default function Library({ onOpen, onLogout }: Props) {
  const [books, setBooks] = useState<PdfRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllPdfs()
      .then((pdfs) => {
        setBooks(pdfs.sort((a, b) => b.addedAt - a.addedAt));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.type !== "application/pdf") continue;
        const data = await file.arrayBuffer();
        const dataCopy = data.slice(0);
        const parsed = await parsePdf(data);
        const record: PdfRecord = {
          id: self.crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name.replace(/\.pdf$/i, ""),
          data: dataCopy,
          addedAt: Date.now(),
          pageCount: parsed.pageCount,
        };
        await savePdf(record);
      }
      const pdfs = await getAllPdfs();
      setBooks(pdfs.sort((a, b) => b.addedAt - a.addedAt));
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deletePdf(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      style={styles.container}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <header style={styles.header}>
        <h1 style={styles.title}>Library</h1>
        <button onClick={onLogout} style={styles.logoutBtn}>
          Sign Out
        </button>
      </header>

      <button
        onClick={() => fileRef.current?.click()}
        style={{
          ...styles.uploadBtn,
          ...(dragOver ? styles.uploadBtnDrag : {}),
        }}
        disabled={uploading}
      >
        {uploading ? "Processing..." : dragOver ? "Drop PDF here" : "+ Upload PDF"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".pdf"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      {loading ? (
        <p style={styles.empty}>Loading...</p>
      ) : books.length === 0 ? (
        <p style={styles.empty}>No books yet. Upload a PDF to get started.</p>
      ) : (
        <div style={styles.grid}>
          {books.map((book) => (
            <div
              key={book.id}
              style={styles.card}
              onClick={() => onOpen(book.id)}
            >
              <div style={styles.cardCover}>
                <span style={styles.cardIcon}>PDF</span>
              </div>
              <div style={styles.cardInfo}>
                <p style={styles.cardTitle}>{book.name}</p>
                <p style={styles.cardMeta}>{book.pageCount} pages</p>
              </div>
              <button
                onClick={(e) => handleDelete(e, book.id)}
                style={styles.deleteBtn}
                title="Remove"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    overflow: "auto",
    padding: "20px 20px 40px",
    background: "#121212",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: "#fff",
  },
  logoutBtn: {
    fontSize: 13,
    color: "#666",
    padding: "6px 12px",
  },
  uploadBtn: {
    width: "100%",
    padding: "40px 0",
    borderRadius: 12,
    border: "2px dashed #333",
    background: "#1a1a1a",
    color: "#888",
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 24,
    transition: "all 0.15s",
    cursor: "pointer",
  },
  uploadBtnDrag: {
    borderColor: "#4A9EFF",
    background: "rgba(74, 158, 255, 0.05)",
    color: "#4A9EFF",
  },
  empty: {
    color: "#555",
    fontSize: 14,
    textAlign: "center",
    marginTop: 60,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: 16,
  },
  card: {
    position: "relative",
    background: "#1e1e1e",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.15s",
  },
  cardCover: {
    height: 180,
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: {
    fontSize: 28,
    fontWeight: 700,
    color: "#4A9EFF",
    opacity: 0.6,
  },
  cardInfo: {
    padding: "10px 12px",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e0e0e0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cardMeta: {
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.6)",
    color: "#888",
    fontSize: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
};
