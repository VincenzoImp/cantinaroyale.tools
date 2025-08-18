import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { contents } from "@/app/layout";

const home = contents.pages.home;

export const metadata: Metadata = {
  title: home.title
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar activeItemID="home" />

      <main className="flex-1 flex items-center justify-center w-full mx-auto max-w-screen-xl px-4">
        <section className="text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white">
            {home.heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {home.heroDescription}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}