"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  CaretDown,
  MapPin,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import {
  entityFilterFromPath,
  pathFromEntityFilter,
} from "@/lib/explore-routes";
import type { EntityFilter } from "@/store/explore-store";

export type ExploreEntity = "locations" | "people";

const SEARCH_OPTIONS: { value: ExploreEntity; label: string; icon: Icon }[] = [
  { value: "people", label: "People", icon: UsersThree },
  { value: "locations", label: "Places", icon: MapPin },
];

const NAV_LINKS: {
  href: string;
  label: string;
  icon: Icon;
  isActive: (pathname: string) => boolean;
}[] = [
  {
    href: "/places",
    label: "Places",
    icon: MapPin,
    isActive: (pathname) =>
      pathname === "/places" || pathname.startsWith("/place/"),
  },
  {
    href: "/people",
    label: "People",
    icon: UsersThree,
    isActive: (pathname) =>
      pathname === "/people" || pathname.startsWith("/person/"),
  },
];

function exploreEntityFromFilter(filter: EntityFilter): ExploreEntity {
  return filter === "people" ? "people" : "locations";
}

export function ExploreNavLinks() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Explore"
      className="flex shrink-0 items-center justify-center gap-1"
    >
      {NAV_LINKS.map(({ href, label, icon: IconComponent, isActive }) => {
        const active = isActive(pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold transition ${
              active
                ? "bg-brand text-brand-foreground shadow-[0_1px_2px_rgba(58,52,43,0.12)]"
                : "text-ink-secondary hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <IconComponent size={15} weight="bold" className="shrink-0" />
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
  const selected =
    SEARCH_OPTIONS.find((option) => option.value === value) ?? SEARCH_OPTIONS[1];
  const selectedLabel = selected?.label ?? "Places";
  const SelectedIcon = selected?.icon ?? MapPin;

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
          {SEARCH_OPTIONS.map(({ value: optionValue, label, icon: IconComponent }) => {
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
                className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-medium transition hover:bg-surface-muted ${
                  active ? "bg-surface-muted text-ink" : "text-ink-secondary"
                }`}
              >
                <IconComponent size={16} weight="bold" className="shrink-0" />
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
        className="inline-flex h-full shrink-0 items-center gap-1.5 rounded-l-full px-3.5 pr-2 text-sm font-semibold leading-none text-ink transition hover:bg-surface-muted"
      >
        <SelectedIcon size={15} weight="bold" className="shrink-0" />
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
