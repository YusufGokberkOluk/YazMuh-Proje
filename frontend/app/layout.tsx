import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import ClientPage from "./ClientPage"
import dynamic from "next/dynamic"

// Replace the direct imports with lazy loaded ones
const Header = dynamic(() => import("@/components/header"), {
  ssr: true,
  loading: () => <div className="w-full h-14 bg-[#13262F] animate-pulse" />,
})

const Footer = dynamic(() => import("@/components/footer"), {
  ssr: true,
  loading: () => <div className="w-full h-10 bg-white dark:bg-[#13262F] border-t border-[#ABD1B5]/20 animate-pulse" />,
})

export const metadata: Metadata = {
  title: "étude - Note Taking App",
  description: "A beautiful and functional note taking application",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ClientPage>{children}</ClientPage>
      </body>
    </html>
  )
}