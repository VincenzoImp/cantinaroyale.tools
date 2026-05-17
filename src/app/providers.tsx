// src/app/providers.tsx
"use client";

import { ThemeProvider } from "@/features/theme/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
