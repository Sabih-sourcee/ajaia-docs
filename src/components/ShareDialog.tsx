"use client";

import { useState } from "react";
import { useUser } from "./UserProvider";
import { useToast } from "./ToastProvider";
import { MOCK_USERS } from "@/lib/users";

export function ShareDialog({
  docId,
  sharedUserIds,
  ownerId,
  onChange,
}: {
  docId: string;
  sharedUserIds: string[];
  ownerId: string;
  onChange: (ids: string[]) => void;
}) {
  const { userId } = useUser();
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const shareable = MOCK_USERS.filter((u) => u.id !== ownerId);

  async function addShare(targetId: string) {
    if (!userId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/${docId}/share`, {
        method: "POST",
        headers: { "x-user-id": userId, "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to share document.");
        return;
      }
      onChange([...sharedUserIds, targetId]);
      showToast("Shared.", "success");
    } catch {
      showToast("Failed to share document.");
    } finally {
      setBusy(false);
    }
  }

  async function removeShare(targetId: string) {
    if (!userId) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/documents/${docId}/share`, {
        method: "DELETE",
        headers: { "x-user-id": userId, "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetId }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to remove access.");
        return;
      }
      onChange(sharedUserIds.filter((id) => id !== targetId));
    } catch {
      showToast("Failed to remove access.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
      >
        Share
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-md border border-gray-200 bg-white p-3 shadow-lg">
          <h3 className="mb-2 text-sm font-semibold">People with access</h3>
          <ul className="mb-3 space-y-1">
            {sharedUserIds.length === 0 && <li className="text-sm text-gray-400">Only you.</li>}
            {sharedUserIds.map((id) => {
              const u = MOCK_USERS.find((m) => m.id === id);
              return (
                <li key={id} className="flex items-center justify-between text-sm">
                  <span>{u?.name ?? id}</span>
                  <button
                    disabled={busy}
                    onClick={() => removeShare(id)}
                    className="text-xs text-red-600 hover:underline disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
          <h3 className="mb-1 text-sm font-semibold">Add person</h3>
          <div className="flex flex-col gap-1">
            {shareable
              .filter((u) => !sharedUserIds.includes(u.id))
              .map((u) => (
                <button
                  key={u.id}
                  disabled={busy}
                  onClick={() => addShare(u.id)}
                  className="rounded px-2 py-1 text-left text-sm hover:bg-gray-100 disabled:opacity-50"
                >
                  {u.name}
                </button>
              ))}
            {shareable.every((u) => sharedUserIds.includes(u.id)) && (
              <p className="text-xs text-gray-400">Everyone already has access.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
