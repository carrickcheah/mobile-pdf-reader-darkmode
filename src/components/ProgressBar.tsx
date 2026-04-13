interface Props {
  currentPage: number;
  totalPages: number;
  progress: number;
}

export default function ProgressBar({ currentPage, totalPages, progress }: Props) {
  const percent = Math.min(100, Math.max(0, Math.round(progress * 100)));

  return (
    <div style={styles.container}>
      <div style={styles.info}>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <span>{percent}%</span>
      </div>
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${percent}%`,
          }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "8px 20px 12px",
    background: "linear-gradient(rgba(18,18,18,0), #121212 30%)",
    zIndex: 10,
  },
  info: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 11,
    color: "#555",
    marginBottom: 6,
  },
  track: {
    height: 3,
    background: "#2a2a2a",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    background: "#4A9EFF",
    borderRadius: 2,
    transition: "width 0.2s ease",
  },
};
