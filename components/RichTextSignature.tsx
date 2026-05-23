"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import {TextStyle} from "@tiptap/extension-text-style";

type RichTextSignatureProps = {
  value: string;
  onChange: (html: string) => void;
};

export default function RichTextSignature({
  value,
  onChange,
}: RichTextSignatureProps) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, Color],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "min-h-28 rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-slate-900",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="min-h-28 rounded-xl border border-slate-300 bg-white p-3 text-slate-400">
        Loading editor...
      </div>
    );
  }

  const buttonClass = (active: boolean) =>
    active
      ? "rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
      : "rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200";

  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonClass(editor.isActive("underline"))}
        >
          Underline
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor("#dc2626").run()}
          className="rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
        >
          Red
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor("#2563eb").run()}
          className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-200"
        >
          Blue
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setColor("#16a34a").run()}
          className="rounded-lg bg-green-100 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-200"
        >
          Green
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().unsetColor().run()}
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          Clear Color
        </button>
      </div>

      <EditorContent editor={editor} />

      <p className="mt-2 text-xs text-slate-500">
        You can also type emoji directly, for example: 🔥 ⚡ 🏆
      </p>
    </div>
  );
}