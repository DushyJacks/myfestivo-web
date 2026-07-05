"use client"

import { createContext, useContext, useEffect } from "react"

type Theme = "dark"

const ThemeContext = createContext<{
  theme: Theme
  toggle: () => void
}>({ theme: "dark", toggle: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Always enforce dark mode — light mode is disabled
    const root = document.documentElement
    root.classList.add("dark")
    root.style.colorScheme = "dark"
    localStorage.setItem("myfestivo-theme", "dark")
  }, [])

  // No-op toggle since light mode is hidden
  const toggle = () => {}

  return (
    <ThemeContext.Provider value={{ theme: "dark", toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
