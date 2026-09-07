import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeScript } from "@/features/theme/theme-script";

export const metadata: Metadata = {
  title: {
    default: "Cantina Royale Tools",
    template: "%s | Cantina Royale Tools",
  },
  description:
    "Browse Cantina Royale characters, weapons, prices, rarity, perks, gameplay charts, and upgrade economy.",
  metadataBase: new URL("https://cantinaroyale-tools.vercel.app/"),
  openGraph: {
    title: "Cantina Royale Tools",
    description:
      "Browse Cantina Royale characters, weapons, prices, rarity, perks, gameplay charts, and upgrade economy.",
    type: "website",
    images: [
      {
        url: "/images/cantina_logo.png",
        width: 550,
        height: 375,
        type: "image/png",
        alt: "Cantina Royale logo",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#111412" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <Providers>
          <ErrorBoundary>
            <div className="flex min-h-screen flex-col">{children}</div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
