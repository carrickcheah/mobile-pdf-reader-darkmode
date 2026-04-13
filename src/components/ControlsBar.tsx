import type { ReaderSettings } from "../hooks/useReaderSettings";

interface Props {
  settings: ReaderSettings;
  onChange: (partial: Partial<ReaderSettings>) => void;
  onClose: () => void;
}

const FONTS = [
  { label: "Sans", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "ui-monospace, 'SF Mono', Consolas, monospace" },
];

export default function ControlsBar({ settings, onChange, onClose }: Props) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.bar} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>Aa</span>
          <button onClick={onClose} style={styles.closeBtn}>
            &times;
          </button>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Font</span>
          <div style={styles.fontPicker}>
            {FONTS.map((f) => (
              <button
                key={f.label}
                onClick={() => onChange({ fontFamily: f.value })}
                style={{
                  ...styles.fontBtn,
                  ...(settings.fontFamily === f.value ? styles.fontBtnActive : {}),
                  fontFamily: f.value,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Size</span>
          <div style={styles.sliderRow}>
            <span style={{ fontSize: 12 }}>A</span>
            <input
              type="range"
              min={12}
              max={32}
              step={1}
              value={settings.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              style={styles.slider}
            />
            <span style={{ fontSize: 20 }}>A</span>
            <span style={styles.value}>{settings.fontSize}</span>
          </div>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Spacing</span>
          <div style={styles.sliderRow}>
            <input
              type="range"
              min={1.2}
              max={2.4}
              step={0.1}
              value={settings.lineHeight}
              onChange={(e) => onChange({ lineHeight: Number(e.target.value) })}
              style={styles.slider}
            />
            <span style={styles.value}>{settings.lineHeight.toFixed(1)}</span>
          </div>
        </div>

        <div style={styles.row}>
          <span style={styles.label}>Margin</span>
          <div style={styles.sliderRow}>
            <input
              type="range"
              min={8}
              max={48}
              step={4}
              value={settings.margin}
              onChange={(e) => onChange({ margin: Number(e.target.value) })}
              style={styles.slider}
            />
            <span style={styles.value}>{settings.margin}px</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 100,
    background: "rgba(0,0,0,0.4)",
  },
  bar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    background: "#1e1e1e",
    borderBottom: "1px solid #333",
    padding: "16px 20px 20px",
    animation: "slideDown 0.2s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 600,
    color: "#fff",
  },
  closeBtn: {
    fontSize: 24,
    color: "#666",
    padding: "4px 8px",
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  row: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
    display: "block",
    marginBottom: 8,
  },
  fontPicker: {
    display: "flex",
    gap: 8,
  },
  fontBtn: {
    flex: 1,
    padding: "10px 0",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#121212",
    color: "#888",
    fontSize: 14,
    cursor: "pointer",
  },
  fontBtnActive: {
    borderColor: "#4A9EFF",
    color: "#4A9EFF",
    background: "rgba(74, 158, 255, 0.08)",
  },
  sliderRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#888",
  },
  slider: {
    flex: 1,
    accentColor: "#4A9EFF",
    height: 4,
  },
  value: {
    fontSize: 12,
    color: "#666",
    minWidth: 32,
    textAlign: "right" as const,
  },
};
