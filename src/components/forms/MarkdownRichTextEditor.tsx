"use client";

import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  ListBullets,
  ListNumbers,
  TextB,
  TextItalic,
  TextH,
  LinkSimple,
} from "@phosphor-icons/react";
import { useEffect, useId, useState } from "react";
import { fieldClassName } from "@/components/forms/FormField";
import { htmlToMarkdown, markdownToHtml } from "@/lib/markdown-html";

type EditorMode = "rich" | "markdown";

interface MarkdownRichTextEditorProps {
  id?: string;
  value: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  rows?: number;
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      data-active={active || undefined}
      onMouseDown={(event) => {
        // Keep selection in the editor.
        event.preventDefault();
      }}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-secondary transition hover:bg-surface-muted hover:text-ink disabled:opacity-40 data-[active=true]:bg-brand/10 data-[active=true]:text-brand"
    >
      {children}
    </button>
  );
}

export function MarkdownRichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Write about this place…",
  rows = 12,
}: MarkdownRichTextEditorProps) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const [mode, setMode] = useState<EditorMode>("rich");
  const minHeight = Math.max(12, rows) * 1.5;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: markdownToHtml(value),
    editorProps: {
      attributes: {
        id: fieldId,
        class:
          "min-h-[inherit] px-3 py-2.5 text-sm leading-relaxed text-ink outline-none [&_a]:text-brand [&_a]:underline [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:first:mt-0 [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(htmlToMarkdown(current.getHTML()));
    },
  });

  // Keep the rich editor in sync when switching back from markdown or loading new value.
  useEffect(() => {
    if (!editor || mode !== "rich") return;
    const currentMarkdown = htmlToMarkdown(editor.getHTML());
    if (currentMarkdown === value.trim()) return;
    editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
  }, [editor, mode, value]);

  function setModeAndSync(next: EditorMode) {
    if (next === mode) return;
    if (next === "rich" && editor) {
      editor.commands.setContent(markdownToHtml(value), { emitUpdate: false });
    }
    setMode(next);
  }

  function promptForLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const next = window.prompt("Link URL", previous ?? "https://");
    if (next === null) return;
    const trimmed = next.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div
          role="tablist"
          aria-label="Editor mode"
          className="inline-flex rounded-full border border-border bg-surface-muted/50 p-0.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "rich"}
            onClick={() => setModeAndSync("rich")}
            className="rounded-full px-3 py-1 text-xs font-semibold transition data-[selected=true]:bg-surface data-[selected=true]:text-ink data-[selected=true]:shadow-sm text-ink-secondary"
            data-selected={mode === "rich"}
          >
            Rich text
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "markdown"}
            onClick={() => setModeAndSync("markdown")}
            className="rounded-full px-3 py-1 text-xs font-semibold transition data-[selected=true]:bg-surface data-[selected=true]:text-ink data-[selected=true]:shadow-sm text-ink-secondary"
            data-selected={mode === "markdown"}
          >
            Markdown
          </button>
        </div>
        <p className="text-[11px] text-ink-muted">
          {mode === "rich"
            ? "Edits save as Markdown on the public page."
            : "Raw Markdown — headings, bold, lists, and links."}
        </p>
      </div>

      {mode === "rich" ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface focus-within:border-brand focus-within:shadow-[0_0_0_3px_rgba(209,127,40,0.15)]">
          <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-muted/40 px-1.5 py-1">
            <ToolbarButton
              label="Bold"
              active={editor?.isActive("bold")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <TextB size={16} weight="bold" />
            </ToolbarButton>
            <ToolbarButton
              label="Italic"
              active={editor?.isActive("italic")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <TextItalic size={16} weight="bold" />
            </ToolbarButton>
            <ToolbarButton
              label="Heading"
              active={editor?.isActive("heading", { level: 2 })}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
            >
              <TextH size={16} weight="bold" />
            </ToolbarButton>
            <ToolbarButton
              label="Bullet list"
              active={editor?.isActive("bulletList")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <ListBullets size={16} weight="bold" />
            </ToolbarButton>
            <ToolbarButton
              label="Numbered list"
              active={editor?.isActive("orderedList")}
              disabled={!editor}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListNumbers size={16} weight="bold" />
            </ToolbarButton>
            <ToolbarButton
              label="Link"
              active={editor?.isActive("link")}
              disabled={!editor}
              onClick={promptForLink}
            >
              <LinkSimple size={16} weight="bold" />
            </ToolbarButton>
          </div>
          <div style={{ minHeight: `${minHeight}rem` }}>
            <EditorContent editor={editor} />
          </div>
        </div>
      ) : (
        <textarea
          id={fieldId}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${fieldClassName} resize-y font-mono text-sm`}
          placeholder={
            "Describe the community, practice style, and what visitors can expect.\n\n**bold**, *italic*, lists, [links](https://…), ## headings"
          }
        />
      )}
    </div>
  );
}
