"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SearchBox } from "@/features/search/search-box";
import type { CollectionGroups } from "@/server/data/repository";

export type ActiveItem = "home" | "characters" | "weapons" | "game-data";
type CollectionMenuKey = "characters" | "weapons";
type MenuKey = CollectionMenuKey | "game-data";

const GAME_DATA_LINKS = [
  { href: "/game-data/characters", label: "Characters" },
  { href: "/game-data/weapons", label: "Weapons" },
  { href: "/game-data/economy", label: "Economy" },
];

type Props = {
  activeItemID: ActiveItem;
  groups: CollectionGroups;
};

function navLinkClass(active: boolean) {
  return [
    "rounded-md px-3 py-2 text-sm font-medium transition",
    active ? "bg-soft text-primary" : "text-muted hover:bg-soft hover:text-ink",
  ].join(" ");
}

function collectionCount(value: number) {
  return value.toLocaleString("en");
}

function GameDataDropdown({
  active,
  open,
  onOpen,
  onClose,
}: {
  active: boolean;
  open: boolean;
  onOpen: (menu: MenuKey) => void;
  onClose: () => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open Game Data menu"
        aria-expanded={open}
        aria-controls="game-data-menu"
        onClick={() => (open ? onClose() : onOpen("game-data"))}
        className={`${navLinkClass(active)} flex items-center gap-1`}
      >
        Game Data
        <ChevronDown
          aria-hidden="true"
          className={`h-3.5 w-3.5 text-muted transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div
          id="game-data-menu"
          role="menu"
          aria-label="Game data views"
          className="absolute left-0 top-full z-40 mt-2 w-56 rounded-md border border-line bg-elevated p-2 shadow-xl"
        >
          {GAME_DATA_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              role="menuitem"
              className="block rounded px-3 py-2 text-sm font-medium text-ink transition hover:bg-soft"
            >
              {link.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
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
  menuKey: CollectionMenuKey;
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
          className="absolute left-0 top-full z-40 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-md border border-line bg-elevated p-2 shadow-xl"
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
                collections.reduce(
                  (total, collection) => total + collection.nftCount,
                  0,
                ),
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
  menuKey: CollectionMenuKey;
  label: string;
  allHref: string;
  allLabel: string;
  open: boolean;
  collections: { id: string; name: string; nftCount: number }[];
  onToggle: (menu: CollectionMenuKey) => void;
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
            collections.reduce(
              (total, collection) => total + collection.nftCount,
              0,
            ),
          )}
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open ? (
        <div
          id={`mobile-${menuKey}`}
          className="max-h-72 overflow-y-auto border-t border-line p-2"
        >
          <Link
            href={allHref}
            onClick={onClose}
            className="grid grid-cols-[1fr_auto] gap-3 rounded px-3 py-2 text-sm font-semibold text-ink transition hover:bg-soft"
          >
            <span>{allLabel}</span>
            <span className="text-xs text-muted">
              {collectionCount(
                collections.reduce(
                  (total, collection) => total + collection.nftCount,
                  0,
                ),
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

function MobileGameDataSection({
  open,
  active,
  onToggle,
  onClose,
}: {
  open: boolean;
  active: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  return (
    <section className="rounded-md border border-line bg-canvas">
      <button
        type="button"
        aria-label={`${open ? "Hide" : "Show"} game data views`}
        aria-expanded={open}
        aria-controls="mobile-game-data"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-semibold ${
          active ? "text-primary" : "text-ink"
        }`}
      >
        <span>Game Data</span>
        <span className="inline-flex items-center gap-2 text-xs font-medium text-muted">
          {GAME_DATA_LINKS.length}
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open ? (
        <div
          id="mobile-game-data"
          className="grid gap-1 border-t border-line p-2"
        >
          {GAME_DATA_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="rounded px-3 py-2 text-sm font-medium text-muted transition hover:bg-soft hover:text-ink"
            >
              {link.label}
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
  const [openMobileSection, setOpenMobileSection] = useState<MenuKey | null>(
    null,
  );
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpenDesktopMenu(null);
        setMobileOpen(false);
        setOpenMobileSection(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDesktopMenu(null);
        setMobileOpen(false);
        setOpenMobileSection(null);
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
    setOpenMobileSection(null);
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
          <GameDataDropdown
            active={activeItemID === "game-data"}
            open={openDesktopMenu === "game-data"}
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
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-elevated px-4 py-4 shadow-xl lg:hidden"
        >
          <div className="mx-auto grid max-w-7xl gap-3">
            <SearchBox compact />
            <div className="grid gap-2">
              <Link
                href="/"
                onClick={closeMenus}
                className={`${navLinkClass(activeItemID === "home")} flex items-center justify-center border border-line bg-canvas`}
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
                setOpenMobileSection((current) =>
                  current === menu ? null : menu,
                )
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
                setOpenMobileSection((current) =>
                  current === menu ? null : menu,
                )
              }
              onClose={closeMenus}
            />
            <MobileGameDataSection
              active={activeItemID === "game-data"}
              open={openMobileSection === "game-data"}
              onToggle={() =>
                setOpenMobileSection((current) =>
                  current === "game-data" ? null : "game-data",
                )
              }
              onClose={closeMenus}
            />
          </div>
        </div>
      ) : null}
    </header>
  );
}
