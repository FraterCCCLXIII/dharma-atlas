"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function SiteMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateMenuPosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      left: rect.right,
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    updateMenuPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [menuOpen, updateMenuPosition]);

  const dropdown =
    menuOpen &&
    createPortal(
      <div
        ref={dropdownRef}
        role="menu"
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
          transform: "translateX(-100%)",
        }}
        className="z-[1000] min-w-[11rem] overflow-hidden rounded-xl border border-border bg-surface-elevated py-1 shadow-[var(--shadow-float)]"
      >
        <Link
          href="/submit"
          role="menuitem"
          onClick={() => setMenuOpen(false)}
          className="block w-full px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-surface-muted"
        >
          Submit entry
        </Link>
        <Link
          href="/claim"
          role="menuitem"
          onClick={() => setMenuOpen(false)}
          className="block w-full px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-surface-muted"
        >
          Claim location
        </Link>
        <Link
          href="/about"
          role="menuitem"
          onClick={() => setMenuOpen(false)}
          className="block w-full px-4 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-surface-muted"
        >
          About
        </Link>
      </div>,
      document.body,
    );

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => {
            setMenuOpen((open) => !open);
            if (!menuOpen) updateMenuPosition();
          }}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-ink-secondary transition hover:border-border-strong hover:bg-surface-muted hover:text-ink"
        >
          <span className="flex flex-col items-center justify-center gap-[5px]" aria-hidden>
            <span className="block h-0.5 w-[18px] rounded-full bg-current" />
            <span className="block h-0.5 w-[18px] rounded-full bg-current" />
            <span className="block h-0.5 w-[18px] rounded-full bg-current" />
          </span>
        </button>
      </div>

      {dropdown}
    </>
  );
}
