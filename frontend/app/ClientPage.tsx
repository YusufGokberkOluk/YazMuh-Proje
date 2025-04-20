"use client"

import ClientLayout from "./ClientLayout"
import type React from "react"

export default function ClientPage({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}
