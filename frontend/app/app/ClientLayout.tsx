"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  // Check if user is logged in
  useEffect(() => {
    // In a real app, this would check for auth tokens/cookies
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/sign-in")
    }
  }, [router])

  return <>{children}</>
}
