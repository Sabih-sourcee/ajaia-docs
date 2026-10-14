"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "./UserProvider";
import { useToast } from "./ToastProvider";
import { UserSwitcher } from "./UserSwitcher";
import { ImportFileButton } from "./ImportFileButton";

type DocSummary = { id: string; title: string; updated_at: string; owner_id: string };

export function Sidebar() {
  const { userId } = useUser();
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const [owned, setOwned] = useState<DocSummary[]>([]);
  const [shared, setShared] = useState<DocSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/documents", { headers: { "x-user-id": userId } });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to load documents.");
        return;
      }
      setOwned(data.owned ?? []);
      setShared(data.shared ?? []);
    } catch {
      showToast("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    load();
  }, [load, pathname]);

  async function createDoc() {
    if (!userId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "x-user-id": userId, "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled document" }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to create document.");
        return;
      }
      router.push(`/doc/${data.document.id}`);
    } catch {
      showToast("Failed to create document.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-gray-200 bg-white p-4">
      <h1 className="mb-1 text-lg font-bold">Ajaia Docs</h1>
      <div className="mb-4">
        <UserSwitcher />
      </div>

      <button
        type="button"
        disabled={creating}
        onClick={createDoc}
        className="mb-2 w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {creating ? "Creating…" : "+ New document"}
      </button>

      <div className="mb-4">
        <ImportFileButton />
      </div>

      <nav className="flex-1 overflow-y-auto">
        <DocList title="My documents" docs={owned} loading={loading} emptyText="No documents yet." />
        <DocList title="Shared with me" docs={shared} loading={loading} emptyText="Nothing shared yet." />
      </nav>
    </aside>
  );
}

function DocList({
  title,
  docs,
  loading,
  emptyText,
}: {
  title: string;
  docs: DocSummary[];
  loading: boolean;
  emptyText: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">{title}</h2>
      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-400">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {docs.map((d) => (
            <li key={d.id}>
              <Link
                href={`/doc/${d.id}`}
                className="block truncate rounded px-2 py-1 text-sm hover:bg-gray-100"
              >
                {d.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
