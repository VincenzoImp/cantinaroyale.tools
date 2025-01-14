import Link from "next/link";
import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function NotFound() {
  return (
    <>
      <Navbar activeItemID="home" />
      <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          404
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">
          We could not find that page
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
          The link does not match a Cantina Royale collection or NFT currently
          available here.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          Open home
        </Link>
      </main>
      <Footer />
    </>
  );
}
