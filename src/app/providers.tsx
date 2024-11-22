// src/app/providers.tsx
'use client'

import { HeroUIProvider } from "@heroui/react";
import { useRouter } from 'next/navigation'
import { ThemeProvider } from '@/contexts/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ThemeProvider>
      <HeroUIProvider navigate={router.push}>
        {children}
      </HeroUIProvider>
    </ThemeProvider>
  )
}