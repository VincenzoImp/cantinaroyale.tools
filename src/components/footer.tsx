import Link from "next/link";
import { ThemeToggle } from "@/features/theme/theme-toggle";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 text-sm text-muted sm:px-6 md:grid-cols-[1fr_auto] md:items-center lg:grid-cols-[1fr_auto_auto] lg:px-8">
        <div className="min-w-0">
          <div className="font-semibold text-ink">Cantina Royale Tools</div>
          <p className="mt-1 max-w-xl leading-6">
            Public market and gameplay views for Cantina Royale characters and
            weapons.
          </p>
        </div>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          <Link
            href="https://cantinaroyale.io"
            className="font-medium text-ink transition hover:text-primary"
          >
            Cantina Royale
          </Link>
          <Link
            href="https://explorer.multiversx.com/accounts/erd1keu46ueul2pryusnrlrnz7xcvegucs323t5zd0ytsudgfr3zamfq9mg8lj"
            className="font-medium text-ink transition hover:text-primary"
          >
            Support @vincenzoimp
          </Link>
        </nav>

        <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-canvas px-3 py-2 md:justify-start">
          <span>Display</span>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
