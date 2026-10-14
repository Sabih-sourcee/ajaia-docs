import { describe, it, expect } from "vitest";
import { validateUploadFile, isMarkdownFile, MAX_UPLOAD_BYTES } from "./fileValidation";

describe("validateUploadFile", () => {
  it("accepts a valid .txt file", () => {
    expect(validateUploadFile("notes.txt", 100)).toEqual({ ok: true });
  });

  it("accepts a valid .md file", () => {
    expect(validateUploadFile("README.md", 100)).toEqual({ ok: true });
  });

  it("rejects an unsupported extension", () => {
    const result = validateUploadFile("document.docx", 100);
    expect(result.ok).toBe(false);
  });

  it("rejects a file larger than 1MB", () => {
    const result = validateUploadFile("big.txt", MAX_UPLOAD_BYTES + 1);
    expect(result.ok).toBe(false);
  });

  it("rejects an empty file", () => {
    const result = validateUploadFile("empty.txt", 0);
    expect(result.ok).toBe(false);
  });

  it("is case-insensitive on extension", () => {
    expect(validateUploadFile("NOTES.TXT", 100)).toEqual({ ok: true });
  });
});

describe("isMarkdownFile", () => {
  it("detects .md files", () => {
    expect(isMarkdownFile("a.md")).toBe(true);
    expect(isMarkdownFile("a.txt")).toBe(false);
  });
});
