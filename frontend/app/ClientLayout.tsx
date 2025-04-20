"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

type Theme = "light" | "dark"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    // Check for user preference in localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
    }
  }, [])

  useEffect(() => {
    // Update data attribute on document for Tailwind dark mode
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <html lang="en" className={theme}>
      <body
        className={`${inter.className} min-h-screen flex flex-col bg-[#f8faf8] dark:bg-[#13262F] text-[#13262F] dark:text-[#EDF4ED]`}
      >
        <Header toggleTheme={toggleTheme} theme={theme} />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
