export const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
export const DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
]);
export const ALLOWED_UPLOAD_TYPES = new Set([...IMAGE_TYPES, ...DOCUMENT_TYPES]);

const BLOCKED_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "com",
  "msi",
  "scr",
  "js",
  "mjs",
  "cjs",
  "sh",
  "ps1",
  "php",
  "html",
  "htm",
  "svg",
  "xml",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

export function extensionOf(filename: string) {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
}

export function isSafeUpload(file: File) {
  const ext = extensionOf(file.name);
  if (!ext || BLOCKED_EXTENSIONS.has(ext)) {
    return { ok: false as const, message: "That file type is not allowed." };
  }
  if (!ALLOWED_UPLOAD_TYPES.has(file.type)) {
    return { ok: false as const, message: "Only JPEG, PNG, WebP, GIF, PDF, Word, Excel, and text files are accepted." };
  }
  const limit = IMAGE_TYPES.has(file.type) ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
  if (file.size > limit) {
    return {
      ok: false as const,
      message: IMAGE_TYPES.has(file.type) ? "Images must be 5MB or smaller." : "Documents must be 10MB or smaller.",
    };
  }
  return { ok: true as const, ext };
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / 1024 / 102.4) / 10} MB`;
}

export function fileTypeLabel(mime?: string | null, filename?: string | null) {
  if (mime === "application/pdf" || filename?.toLowerCase().endsWith(".pdf")) return "PDF";
  if (mime?.includes("word") || filename?.match(/\.docx?$/i)) return "Word";
  if (mime?.includes("sheet") || filename?.match(/\.xlsx?$/i)) return "Excel";
  if (mime?.startsWith("image/")) return mime.replace("image/", "").toUpperCase();
  if (mime === "text/plain") return "Text";
  return filename ? extensionOf(filename).toUpperCase() : "File";
}
