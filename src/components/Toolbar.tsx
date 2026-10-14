"use client";

import { Editor } from "@tiptap/react";

export function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  const buttons: { label: string; onClick: () => void; isActive: () => boolean }[] = [
    { label: "Bold", onClick: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive("bold") },
    { label: "Italic", onClick: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive("italic") },
    { label: "Underline", onClick: () => editor.chain().focus().toggleUnderline().run(), isActive: () => editor.isActive("underline") },
    { label: "H1", onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive("heading", { level: 1 }) },
    { label: "H2", onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive("heading", { level: 2 }) },
    { label: "• List", onClick: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive("bulletList") },
    { label: "1. List", onClick: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive("orderedList") },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-2">
      {buttons.map((b) => (
        <button
          key={b.label}
          type="button"
          onClick={b.onClick}
          className={`rounded px-2 py-1 text-sm font-medium ${
            b.isActive() ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          }`}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
