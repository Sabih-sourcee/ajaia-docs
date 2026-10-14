// Pure validation logic for the "Import file" feature, testable without a
// real File/FormData object (handy in Node/Vitest).

export const MAX_UPLOAD_BYTES = 1 * 1024 * 1024; // 1MB
export const ALLOWED_EXTENSIONS = [".txt", ".md"] as const;

export type FileValidationResult = { ok: true } | { ok: false; error: string };

export function validateUploadFile(name: string, sizeBytes: number): FileValidationResult {
  const lower = name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));

  if (!hasAllowedExtension) {
    return { ok: false, error: "Only .txt and .md files are supported." };
  }

  if (sizeBytes > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "File is too large. Maximum size is 1MB." };
  }

  if (sizeBytes <= 0) {
    return { ok: false, error: "File is empty." };
  }

  return { ok: true };
}

export function isMarkdownFile(name: string): boolean {
  return name.toLowerCase().endsWith(".md");
}
