// src/app/page.tsx - Updated with theme system
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { contents } from "@/app/layout";
import { themeClasses } from "@/utils/theme";

const home = contents.pages.home;

export const metadata: Metadata = {
  title: home.title
};

export default function Home() {
  return (
    <div className={`${themeClasses.pageBackground} flex flex-col`}>
      <Navbar activeItemID="home" />

      <main className="flex-1 flex items-center justify-center w-full mx-auto max-w-screen-xl px-4">
        <section className="text-center space-y-8">
          {/* Hero Title with theme-aware styling */}
          <h1 className="text-4xl md:text-6xl font-bold text-theme-text transition-colors duration-300">
            {home.heroTitle}
          </h1>

          {/* Hero Description */}
          <p className="text-lg md:text-xl text-theme-muted max-w-2xl mx-auto transition-colors duration-300">
            {home.heroDescription}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}