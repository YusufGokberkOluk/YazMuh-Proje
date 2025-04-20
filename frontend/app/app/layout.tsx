import type React from "react"
import ClientLayout from "./ClientLayout"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientLayout>
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>
    </ClientLayout>
  )
}
