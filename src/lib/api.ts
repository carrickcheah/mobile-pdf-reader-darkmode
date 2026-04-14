const API = "/api";
const CACHE_DB = "pdf-cache";
const CACHE_STORE = "data";

export interface PdfMeta {
  id: string;
  name: string;
  addedAt: number;
  size: number;
}

export async function uploadPdf(file: File): Promise<PdfMeta> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API}/pdfs`, { method: "POST", body: form });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function listPdfs(): Promise<PdfMeta[]> {
  const res = await fetch(`${API}/pdfs`);
  if (!res.ok) throw new Error("Failed to list PDFs");
  return res.json();
}

export async function downloadPdf(id: string): Promise<ArrayBuffer> {
  // Check local cache first
  const cached = await getFromCache(id);
  if (cached) return cached;

  // Download from server
  const res = await fetch(`${API}/pdfs/${id}`);
  if (!res.ok) throw new Error("Failed to download PDF");
  const data = await res.arrayBuffer();

  // Cache locally for next time
  await saveToCache(id, data);
  return data;
}

export async function deletePdfApi(id: string): Promise<void> {
  await fetch(`${API}/pdfs/${id}`, { method: "DELETE" });
  await deleteFromCache(id);
}

// --- IndexedDB cache layer ---

function openCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(CACHE_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(CACHE_STORE)) {
        req.result.createObjectStore(CACHE_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getFromCache(id: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openCache();
    return new Promise((resolve) => {
      const tx = db.transaction(CACHE_STORE, "readonly");
      const req = tx.objectStore(CACHE_STORE).get(id);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function saveToCache(id: string, data: ArrayBuffer): Promise<void> {
  try {
    const db = await openCache();
    const tx = db.transaction(CACHE_STORE, "readwrite");
    tx.objectStore(CACHE_STORE).put(data, id);
  } catch {}
}

async function deleteFromCache(id: string): Promise<void> {
  try {
    const db = await openCache();
    const tx = db.transaction(CACHE_STORE, "readwrite");
    tx.objectStore(CACHE_STORE).delete(id);
  } catch {}
}
