"use client"

import type React from "react"
import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Suppress hydration warnings in development
    if (process.env.NODE_ENV === "development") {
      const originalError = console.error
      console.error = (...args) => {
        if (typeof args[0] === "string" && args[0].includes("Warning: Extra attributes from the server")) {
          return
        }
        if (typeof args[0] === "string" && args[0].includes("Hydration failed")) {
          return
        }
        originalError(...args)
      }
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      {children}
      <Toaster />
    </ThemeProvider>
  )
}
