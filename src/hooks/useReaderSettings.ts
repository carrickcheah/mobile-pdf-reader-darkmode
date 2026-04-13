import { useState, useCallback } from "react";

export interface ReaderSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  margin: number;
}

const SETTINGS_KEY = "pdf-dark-settings";

const DEFAULTS: ReaderSettings = {
  fontSize: 18,
  fontFamily: "sans-serif",
  lineHeight: 1.7,
  margin: 24,
};

function load(): ReaderSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function useReaderSettings() {
  const [settings, setSettings] = useState<ReaderSettings>(load);

  const update = useCallback((partial: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(SETTINGS_KEY);
    setSettings(DEFAULTS);
  }, []);

  return { settings, update, reset };
}
