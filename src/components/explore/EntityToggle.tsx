"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import { CaretDown } from "@phosphor-icons/react";
import { useNavLinksCollapsed } from "@/components/layout/NavBarLogoContext";
import { entityFilterFromPath, pathFromEntityFilter } from "@/lib/explore-routes";
import type { EntityFilter } from "@/store/explore-store";

export type ExploreEntity = "locations" | "people";

const OPTIONS: { value: ExploreEntity; label: string }[] = [
  { value: "people", label: "People" },
  { value: "locations", label: "Places" },
];

function exploreEntityFromFilter(filter: EntityFilter): ExploreEntity {
  return filter === "people" ? "people" : "locations";
}

export function ExploreNavLinks({
  linksRef,
}: {
  linksRef?: RefObject<HTMLElement | null>;
}) {
  const pathname = usePathname();
  const entityFilter = entityFilterFromPath(pathname);
  const collapsed = useNavLinksCollapsed();

  // Keep links measurable when collapsed (invisible + absolute) so collision
  // detection can decide to show them again without oscillating.
  const visibilityClass =
    collapsed === false
      ? "relative flex"
      : collapsed === true
        ? "pointer-events-none invisible absolute flex w-max"
        : "hidden md:flex";

  return (
    <nav
      ref={linksRef}
      aria-label="Explore"
      aria-hidden={collapsed === true ? true : undefined}
      className={`${visibilityClass} shrink-0 items-center gap-1 sm:gap-2`}
    >
      {OPTIONS.map(({ value, label }) => {
        const isActive = entityFilter === value;
        return (
          <Link
            key={value}
            href={pathFromEntityFilter(value)}
            tabIndex={collapsed === true ? -1 : undefined}
            aria-current={isActive ? "page" : undefined}
            className={`whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold transition sm:px-3 ${
              isActive
                ? "text-ink"
                : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SearchScopeDropdown({
  value,
  onChange,
}: {
  value: ExploreEntity;
  onChange: (value: ExploreEntity) => void;
}) {
  const selectedLabel =
    OPTIONS.find((option) => option.value === value)?.label ?? "Places";

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
      left: rect.left,
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
        aria-label="Search in"
        style={{
          position: "fixed",
          top: menuPosition.top,
          left: menuPosition.left,
        }}
        className="z-[1000] flex min-w-[10rem] flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-[var(--shadow-float)]"
      >
        <div className="py-1">
          {OPTIONS.map(({ value: optionValue, label }) => {
            const active = value === optionValue;
            return (
              <button
                key={optionValue}
                type="button"
                role="menuitem"
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  onChange(optionValue);
                  setMenuOpen(false);
                }}
                className={`block w-full px-4 py-2.5 text-left text-sm font-medium transition hover:bg-surface-muted ${
                  active ? "bg-surface-muted text-ink" : "text-ink-secondary"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          setMenuOpen((open) => !open);
          if (!menuOpen) updateMenuPosition();
        }}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={`Search in: ${selectedLabel}`}
        className="inline-flex shrink-0 items-center gap-1 rounded-l-full py-2.5 pl-3.5 pr-2 text-sm font-semibold text-ink transition hover:bg-surface-muted"
      >
        <span className="whitespace-nowrap">{selectedLabel}</span>
        <CaretDown
          size={14}
          weight="bold"
          className={`text-ink-muted transition ${menuOpen ? "rotate-180" : ""}`}
        />
      </button>
      {dropdown}
    </>
  );
}

export function useSearchScope(): {
  scope: ExploreEntity;
  setScope: (scope: ExploreEntity) => void;
} {
  const pathname = usePathname();
  const router = useRouter();
  const scope = exploreEntityFromFilter(entityFilterFromPath(pathname));

  const setScope = useCallback(
    (next: ExploreEntity) => {
      const href = pathFromEntityFilter(next);
      if (href !== pathname) {
        router.push(href);
      }
    },
    [pathname, router],
  );

  return { scope, setScope };
}

export function getSearchPlaceholder(entityFilter: EntityFilter): string {
  switch (exploreEntityFromFilter(entityFilter)) {
    case "people":
      return "Search people";
    default:
      return "Search locations";
  }
}
