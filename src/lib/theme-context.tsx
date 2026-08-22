"use client"

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="myfestivo-theme"
    >
      {children}
    </NextThemesProvider>
  )
}

/**
 * Re-export useTheme from next-themes for consistent usage across the app.
 * Provides: { theme, setTheme, resolvedTheme, systemTheme, themes }
 */
export const useTheme = useNextTheme
