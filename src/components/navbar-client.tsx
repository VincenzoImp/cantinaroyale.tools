"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SearchBox } from "@/features/search/search-box";
import type { CollectionGroups } from "@/server/data/repository";

export type ActiveItem = "home" | "characters" | "weapons";
type MenuKey = "characters" | "weapons";

type Props = {
  activeItemID: ActiveItem;
  groups: CollectionGroups;
};

function navLinkClass(active: boolean) {
  return [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    active
      ? "bg-soft text-primary"
      : "text-muted hover:bg-soft hover:text-ink",
  ].join(" ");
}

function collectionCount(value: number) {
  return value.toLocaleString("en");
}

function CollectionDropdown({
  menuKey,
  label,
  active,
  open,
  allHref,
  allLabel,
  collections,
  onOpen,
  onClose,
}: {
  menuKey: MenuKey;
  label: string;
  active: boolean;
  open: boolean;
  allHref: string;
  allLabel: string;
  collections: { id: string; name: string; nftCount: number }[];
  onOpen: (menu: MenuKey) => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Open ${label} menu`}
        aria-expanded={open}
        aria-controls={`${menuKey}-menu`}
        onClick={() => (open ? onClose() : onOpen(menuKey))}
        className={`${navLinkClass(active)} flex items-center gap-1`}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 text-muted transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div
          id={`${menuKey}-menu`}
          role="menu"
          aria-label={`${label} collections`}
          className="absolute left-0 top-full z-40 mt-2 w-80 rounded-md border border-line bg-elevated p-2 shadow-xl"
        >
          <Link
            href={allHref}
            onClick={onClose}
            role="menuitem"
            className="grid grid-cols-[1fr_auto] gap-3 rounded px-3 py-2 text-sm font-semibold text-ink transition hover:bg-soft"
          >
            <span>{allLabel}</span>
            <span className="text-xs font-medium text-muted">
              {collectionCount(
                collections.reduce((total, collection) => total + collection.nftCount, 0),
              )}
            </span>
          </Link>
          <div className="my-2 h-px bg-line" />
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collection/${collection.id}`}
              onClick={onClose}
              role="menuitem"
              className="grid grid-cols-[1fr_auto] gap-3 rounded px-3 py-2 text-sm transition hover:bg-soft"
            >
              <span className="truncate text-ink">{collection.name}</span>
              <span className="text-xs text-muted">
                {collectionCount(collection.nftCount)}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function MobileSection({
  menuKey,
  label,
  allHref,
  allLabel,
  open,
  collections,
  onToggle,
  onClose,
}: {
  menuKey: MenuKey;
  label: string;
  allHref: string;
  allLabel: string;
  open: boolean;
  collections: { id: string; name: string; nftCount: number }[];
  onToggle: (menu: MenuKey) => void;
  onClose: () => void;
}) {
  return (
    <section className="rounded-md border border-line bg-canvas">
      <button
        type="button"
        aria-label={`${open ? "Hide" : "Show"} ${menuKey === "characters" ? "character" : "weapon"} collections`}
        aria-expanded={open}
        aria-controls={`mobile-${menuKey}`}
        onClick={() => onToggle(menuKey)}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-semibold text-ink"
      >
        <span>{label}</span>
        <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
          {collectionCount(
            collections.reduce((total, collection) => total + collection.nftCount, 0),
          )}
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open ? (
        <div id={`mobile-${menuKey}`} className="border-t border-line p-2">
          <Link
            href={allHref}
            onClick={onClose}
            className="grid grid-cols-[1fr_auto] gap-3 rounded px-3 py-2 text-sm font-semibold text-ink transition hover:bg-soft"
          >
            <span>{allLabel}</span>
            <span className="text-xs text-muted">
              {collectionCount(
                collections.reduce((total, collection) => total + collection.nftCount, 0),
              )}
            </span>
          </Link>
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collection/${collection.id}`}
              onClick={onClose}
              className="grid grid-cols-[1fr_auto] gap-3 rounded px-3 py-2 text-sm transition hover:bg-soft"
            >
              <span className="truncate text-muted">{collection.name}</span>
              <span className="text-xs text-muted">
                {collectionCount(collection.nftCount)}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function NavbarClient({ activeItemID, groups }: Props) {
  const [openDesktopMenu, setOpenDesktopMenu] = useState<MenuKey | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMobileSection, setOpenMobileSection] =
    useState<MenuKey | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
        setMobileOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const closeMenus = () => {
    setOpenDesktopMenu(null);
    setMobileOpen(false);
  };

  return (
    <header
      ref={rootRef}
      className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMenus}
          className="flex min-w-0 items-center gap-3"
        >
          <Image
            src="/images/cantina_logo.png"
            alt=""
            width={44}
            height={30}
            priority
            className="h-8 w-auto"
          />
          <span className="truncate text-base font-semibold text-ink">
            Cantina Royale Tools
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            onClick={closeMenus}
            className={navLinkClass(activeItemID === "home")}
          >
            Home
          </Link>
          <CollectionDropdown
            menuKey="characters"
            label="Characters"
            active={activeItemID === "characters"}
            open={openDesktopMenu === "characters"}
            allHref="/collection/All-Characters"
            allLabel="All Characters"
            collections={groups.characters}
            onOpen={setOpenDesktopMenu}
            onClose={() => setOpenDesktopMenu(null)}
          />
          <CollectionDropdown
            menuKey="weapons"
            label="Weapons"
            active={activeItemID === "weapons"}
            open={openDesktopMenu === "weapons"}
            allHref="/collection/All-Weapons"
            allLabel="All Weapons"
            collections={groups.weapons}
            onOpen={setOpenDesktopMenu}
            onClose={() => setOpenDesktopMenu(null)}
          />
        </div>

        <div className="hidden min-w-[320px] max-w-md flex-1 justify-end lg:flex">
          <SearchBox compact />
        </div>
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            setMobileOpen((current) => !current);
            setOpenDesktopMenu(null);
          }}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface text-ink shadow-sm lg:hidden"
        >
          {mobileOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </nav>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          role="dialog"
          aria-label="Site navigation"
          className="border-t border-line bg-elevated px-4 py-4 shadow-xl lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-3">
            <SearchBox compact />
            <div className="rounded-md border border-line bg-canvas px-3 py-2">
              <Link
                href="/"
                onClick={closeMenus}
                className={navLinkClass(activeItemID === "home")}
              >
                Home
              </Link>
            </div>
            <MobileSection
              menuKey="characters"
              label="Characters"
              allHref="/collection/All-Characters"
              allLabel="All Characters"
              open={openMobileSection === "characters"}
              collections={groups.characters}
              onToggle={(menu) =>
                setOpenMobileSection((current) => (current === menu ? null : menu))
              }
              onClose={closeMenus}
            />
            <MobileSection
              menuKey="weapons"
              label="Weapons"
              allHref="/collection/All-Weapons"
              allLabel="All Weapons"
              open={openMobileSection === "weapons"}
              collections={groups.weapons}
              onToggle={(menu) =>
                setOpenMobileSection((current) => (current === menu ? null : menu))
              }
              onClose={closeMenus}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
