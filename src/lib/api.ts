const API = "/api";

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
  const res = await fetch(`${API}/pdfs/${id}`);
  if (!res.ok) throw new Error("Failed to download PDF");
  return res.arrayBuffer();
}

export async function deletePdfApi(id: string): Promise<void> {
  await fetch(`${API}/pdfs/${id}`, { method: "DELETE" });
}
