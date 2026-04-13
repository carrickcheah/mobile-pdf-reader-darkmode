import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

const app = new Hono();

// Azure Blob setup
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
const containerName = process.env.AZURE_STORAGE_PDF_CONTAINER || "pdfs";
const blobService = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobService.getContainerClient(containerName);

// Ensure container exists on startup
await containerClient.createIfNotExists();

app.use("*", cors());

// Upload PDF
app.post("/api/pdfs", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return c.json({ error: "No file provided" }, 400);

  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const buffer = await file.arrayBuffer();

  // Upload blob
  const blobClient = containerClient.getBlockBlobClient(`${id}.pdf`);
  await blobClient.uploadData(Buffer.from(buffer), {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });

  // Upload metadata
  const meta = {
    id,
    name: file.name.replace(/\.pdf$/i, ""),
    addedAt: Date.now(),
    size: buffer.byteLength,
  };
  const metaClient = containerClient.getBlockBlobClient(`${id}.json`);
  await metaClient.uploadData(Buffer.from(JSON.stringify(meta)), {
    blobHTTPHeaders: { blobContentType: "application/json" },
  });

  return c.json(meta);
});

// List all PDFs
app.get("/api/pdfs", async (c) => {
  const pdfs: any[] = [];
  for await (const blob of containerClient.listBlobsFlat({
    prefix: "",
  })) {
    if (!blob.name.endsWith(".json")) continue;
    const client = containerClient.getBlockBlobClient(blob.name);
    const resp = await client.download();
    const text = await streamToString(resp.readableStreamBody!);
    pdfs.push(JSON.parse(text));
  }
  pdfs.sort((a, b) => b.addedAt - a.addedAt);
  return c.json(pdfs);
});

// Download PDF
app.get("/api/pdfs/:id", async (c) => {
  const id = c.req.param("id");
  const blobClient = containerClient.getBlockBlobClient(`${id}.pdf`);

  try {
    const resp = await blobClient.download();
    const buffer = await streamToBuffer(resp.readableStreamBody!);
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": buffer.byteLength.toString(),
      },
    });
  } catch {
    return c.json({ error: "Not found" }, 404);
  }
});

// Delete PDF
app.delete("/api/pdfs/:id", async (c) => {
  const id = c.req.param("id");
  await containerClient.getBlockBlobClient(`${id}.pdf`).deleteIfExists();
  await containerClient.getBlockBlobClient(`${id}.json`).deleteIfExists();
  return c.json({ ok: true });
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Serve static frontend
app.use("/*", serveStatic({ root: "./dist" }));
app.get("*", serveStatic({ root: "./dist", path: "/index.html" }));

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf-8");
}

async function streamToBuffer(
  stream: NodeJS.ReadableStream
): Promise<ArrayBuffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).buffer as ArrayBuffer;
}

const port = Number(process.env.PORT) || 3099;
console.log(`Server running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
