"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "./UserProvider";
import { useToast } from "./ToastProvider";

export function ImportFileButton() {
  const { userId } = useUser();
  const { showToast } = useToast();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: userId ? { "x-user-id": userId } : {},
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to import file.");
        return;
      }
      showToast("File imported.", "success");
      router.push(`/doc/${data.document.id}`);
    } catch {
      showToast("Failed to import file.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        {busy ? "Importing…" : "Import file"}
      </button>
      <p className="mt-1 text-xs text-gray-400">Accepts .txt and .md files up to 1MB.</p>
      <input ref={inputRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFile} />
    </div>
  );
}
