import { marked } from "marked";

/** Converts markdown text to HTML, suitable for TipTap's setContent(html). */
export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

/** Wraps plain text in paragraph tags per line so TipTap renders it nicely. */
export function plainTextToHtml(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => `<p>${escapeHtml(line) || "<br/>"}</p>`)
    .join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
