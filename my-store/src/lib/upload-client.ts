// ==================== ⬆️ رفع الصور من المتصفح ====================
// الصور النقطية تُصغَّر وتُضغط إلى WebP قبل الرفع (أسرع وأخف على قاعدة البيانات).
// SVG وGIF تُرفع كما هي.

export type UploadErrorCode = "type" | "too_large" | "svg_unsafe" | "quota" | "network" | "unauthorized";

export class UploadError extends Error {
  constructor(public code: UploadErrorCode) {
    super(code);
  }
}

const RASTER = ["image/png", "image/jpeg", "image/webp", "image/avif", "image/bmp"];

async function compress(file: File, maxDim: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  // إن لم يكن الضغط مفيداً نرفع الأصل
  return blob && blob.size < file.size ? blob : file;
}

/** يرفع ملف صورة ويعيد رابطه على المنصة (/api/media/...) */
export async function uploadImage(file: File, opts: { maxDim?: number; quality?: number } = {}): Promise<string> {
  const type = file.type.toLowerCase();
  const isSvg = type === "image/svg+xml" || file.name.toLowerCase().endsWith(".svg");
  const isGif = type === "image/gif";
  if (!isSvg && !isGif && !RASTER.includes(type)) throw new UploadError("type");

  let body: Blob = file;
  let name = file.name || "image";
  if (!isSvg && !isGif) {
    body = await compress(file, opts.maxDim ?? 1600, opts.quality ?? 0.86);
    if (body.type === "image/webp") name = name.replace(/\.[a-z0-9]+$/i, "") + ".webp";
  }
  if (body.size > (isSvg ? 400 * 1024 : 3 * 1024 * 1024)) throw new UploadError("too_large");

  const form = new FormData();
  form.append("file", new File([body], name, { type: isSvg ? "image/svg+xml" : body.type || type }));

  let res: Response;
  try {
    res = await fetch("/api/media", { method: "POST", body: form });
  } catch {
    throw new UploadError("network");
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new UploadError("unauthorized");
  if (!res.ok || !data.url) throw new UploadError((data.error as UploadErrorCode) || "network");
  return data.url as string;
}

/** صور من حافظة اللصق أو السحب */
export function imageFilesFrom(list: FileList | DataTransferItemList | null | undefined): File[] {
  if (!list) return [];
  const out: File[] = [];
  for (const item of Array.from(list as ArrayLike<File | DataTransferItem>)) {
    const file = item instanceof File ? item : item.kind === "file" ? item.getAsFile() : null;
    if (file && (file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".svg"))) out.push(file);
  }
  return out;
}
