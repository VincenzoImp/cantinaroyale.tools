"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AssetThumbnail } from "@/features/nft/asset-thumbnail";
import type { SearchResult } from "@/server/data/schema";

type SearchResponse = {
  results: SearchResult[];
};

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=6`,
          { signal: controller.signal },
        );
        const data = (await response.json()) as SearchResponse;
        setResults(data.results);
        setOpen(true);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setResults([]);
          setOpen(false);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const goTo = (identifier: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/nft/${identifier}`);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const exact = results.find(
      (result) => result.identifier.toLowerCase() === query.trim().toLowerCase(),
    );
    const target = exact ?? results[0];
    if (target) {
      goTo(target.identifier);
    }
  };

  return (
    <div
      ref={containerRef}
      className={compact ? "relative w-full" : "relative w-full max-w-xl"}
    >
      <form onSubmit={submit} role="search" className="relative">
        <label htmlFor={id} className="sr-only">
          Search NFTs
        </label>
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        />
        <input
          id={id}
          value={query}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            if (nextQuery.trim().length < 2) {
              setResults([]);
              setOpen(false);
            }
          }}
          onFocus={() => setOpen(results.length > 0)}
          placeholder="Search by name, collection, trait or owner"
          className="h-11 w-full rounded-md border border-line bg-surface py-2 pl-10 pr-10 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted hover:border-strong focus:border-primary focus:ring-2 focus:ring-focus/25"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted transition hover:bg-soft hover:text-ink"
            aria-label="Clear search"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && (
        <div className="absolute z-50 mt-2 max-h-96 w-full overflow-auto rounded-md border border-line bg-elevated p-1 shadow-xl">
          {loading && results.length === 0 ? (
            <div className="px-3 py-3 text-sm text-muted">Searching...</div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.identifier}
                type="button"
                onClick={() => goTo(result.identifier)}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-left transition hover:bg-soft focus-visible:bg-soft focus-visible:outline-none"
              >
                <AssetThumbnail
                  type={result.type}
                  url={result.url}
                  thumbnailUrl={result.thumbnailUrl}
                  className="h-10 w-10 rounded"
                  sizes="40px"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {result.name}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {result.identifier}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-sm text-muted">No matches</div>
          )}
        </div>
      )}
    </div>
  );
}
