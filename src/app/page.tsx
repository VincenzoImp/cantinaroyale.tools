// src/app/page.tsx - Enhanced home page following existing theme style
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { contents, variables } from "@/lib/data";
import { themeClasses } from "@/utils/theme";

const home = contents.pages.home;

export const metadata: Metadata = {
  title: home.title
};

export default function Home() {
  return (
    <div className={`${themeClasses.pageBackground} flex flex-col`}>
      <Navbar activeItemID="home" />

      <main className="flex-1 w-full mx-auto max-w-screen-xl px-4">
        {/* Hero Section */}
        <section className="text-center py-16 space-y-8">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-theme-text transition-colors duration-300">
              {home.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-theme-muted max-w-2xl mx-auto transition-colors duration-300">
              {home.heroDescription}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <a
              href={`/collection/${variables.collections.allCharacters}`}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-lg px-8 py-4 transition-all duration-200 shadow-lg hover:shadow-xl dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Explore Characters →
            </a>
            <a
              href={`/collection/${variables.collections.allWeapons}`}
              className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-lg px-8 py-4 transition-all duration-200 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              Browse Weapons
            </a>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-theme-text mb-4 transition-colors duration-300">
              Powerful Features
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* NFT Explorer */}
            <div className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-theme-text mb-3 transition-colors duration-300">
                NFT Explorer
              </h3>
              <p className="text-theme-muted mb-4 transition-colors duration-300">
                Browse and search through all NFT collections with advanced filtering and detailed metadata.
              </p>
              <ul className="space-y-1 text-sm text-theme-muted transition-colors duration-300">
                <li>• Character browser with stats</li>
                <li>• Weapon performance metrics</li>
                <li>• Advanced search functionality</li>
                <li>• Collection filtering & sorting</li>
              </ul>
            </div>

            {/* Character Analytics */}
            <div className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-theme-text mb-3 transition-colors duration-300">
                Character Analytics
              </h3>
              <p className="text-theme-muted mb-4 transition-colors duration-300">
                Deep dive into character abilities, ultimate skills, and progression systems.
              </p>
              <ul className="space-y-1 text-sm text-theme-muted transition-colors duration-300">
                <li>• Ultimate abilities breakdown</li>
                <li>• Charging mechanics analysis</li>
                <li>• Stat progressions by level</li>
                <li>• Health, shield & speed data</li>
              </ul>
            </div>

            {/* Weapon Statistics */}
            <div className="bg-theme-surface border border-theme-border rounded-lg p-6 shadow-lg transition-all duration-300 hover:shadow-xl">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚔️</span>
              </div>
              <h3 className="text-xl font-semibold text-theme-text mb-3 transition-colors duration-300">
                Weapon Statistics
              </h3>
              <p className="text-theme-muted mb-4 transition-colors duration-300">
                Comprehensive weapon data including damage values, ranges, and upgrade paths.
              </p>
              <ul className="space-y-1 text-sm text-theme-muted transition-colors duration-300">
                <li>• Damage & range analysis</li>
                <li>• Reload time comparisons</li>
                <li>• Star level progressions</li>
                <li>• Projectile mechanics</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}