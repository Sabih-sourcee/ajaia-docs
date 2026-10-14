"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useRouter } from "next/navigation";
import { useUser } from "./UserProvider";
import { useToast } from "./ToastProvider";
import { Toolbar } from "./Toolbar";
import { ShareDialog } from "./ShareDialog";
import { MOCK_USERS } from "@/lib/users";

type DocumentData = {
  id: string;
  title: string;
  content: unknown;
  owner_id: string;
};

type SaveState = "saved" | "saving" | "error";

export function DocumentEditor({ docId }: { docId: string }) {
  const { userId } = useUser();
  const { showToast } = useToast();
  const router = useRouter();

  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [sharedUserIds, setSharedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [loadError, setLoadError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(true);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
    onUpdate: () => scheduleSave(),
  });

  const scheduleSave = useCallback(() => {
    if (skipNextSave.current) return;
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveContent();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveContent() {
    if (!userId || !editor) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "x-user-id": userId, "Content-Type": "application/json" },
        body: JSON.stringify({ content: editor.getJSON() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to save.");
        setSaveState("error");
        return;
      }
      setSaveState("saved");
    } catch {
      showToast("Failed to save. Check your connection.");
      setSaveState("error");
    }
  }

  // Load the document once the editor instance and user are ready.
  useEffect(() => {
    if (!userId || !editor) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/documents/${docId}`, { headers: { "x-user-id": userId as string } });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setLoadError(res.status === 403 ? "You don't have access to this document." : data.error || "Document not found.");
          return;
        }
        setDoc(data.document);
        setIsOwner(data.isOwner);
        setSharedUserIds(data.sharedUserIds ?? []);
        setTitle(data.document.title);

        const content = data.document.content as
          | { type: "html-import"; html: string }
          | Record<string, unknown>
          | null;
        if (content && typeof content === "object" && "type" in content && content.type === "html-import") {
          editor!.commands.setContent((content as { html: string }).html);
        } else {
          editor!.commands.setContent(content ?? "");
        }
        // Allow updates to trigger autosave only after initial load settles.
        setTimeout(() => {
          skipNextSave.current = false;
        }, 300);
      } catch {
        if (!cancelled) setLoadError("Failed to load document.");
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, editor, docId]);

  async function handleTitleBlur() {
    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError("Title cannot be empty.");
      setTitle(doc?.title ?? "");
      return;
    }
    setTitleError("");
    if (trimmed === doc?.title) return;
    if (!userId) return;
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PATCH",
        headers: { "x-user-id": userId, "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Failed to rename document.");
        return;
      }
      setDoc(data.document);
    } catch {
      showToast("Failed to rename document.");
    }
  }

  if (loadError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-lg font-medium text-gray-700">{loadError}</p>
        <button onClick={() => router.push("/")} className="text-sm text-blue-600 hover:underline">
          Back to documents
        </button>
      </div>
    );
  }

  if (!doc) {
    return <div className="flex flex-1 items-center justify-center text-gray-400">Loading…</div>;
  }

  const owner = MOCK_USERS.find((u) => u.id === doc.owner_id);

  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col p-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex-1">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="w-full border-none bg-transparent text-2xl font-bold outline-none focus:ring-0"
          />
          {titleError && <p className="mt-1 text-sm text-red-600">{titleError}</p>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : "Saved"}
          </span>
          {isOwner ? (
            <ShareDialog
              docId={docId}
              sharedUserIds={sharedUserIds}
              ownerId={doc.owner_id}
              onChange={setSharedUserIds}
            />
          ) : (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
              Shared by {owner?.name ?? "someone"}
            </span>
          )}
        </div>
      </div>

      <Toolbar editor={editor} />
      <div className="mt-4 flex-1">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
