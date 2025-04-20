"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const mockUser = {
  email: "kullanici@etude.app",
  password: "password123",
}

export default function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    // In a real app, this would check for auth tokens/cookies
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (isLoggedIn) {
      router.push("/app")
    }
  }, [router])

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Sign in attempt", { email, password })

    // Compare input credentials with mock user
    if (email === mockUser.email && password === mockUser.password) {
      console.log("Login successful! (Mock)")
      setError("")
      setIsRedirecting(true)

      // Set mock login state
      localStorage.setItem("isLoggedIn", "true")

      // Use Next.js router for navigation
      setTimeout(() => {
        router.push("/app")
      }, 1500)
    } else {
      console.log("Login failed! Email or password incorrect. (Mock)")
      setError("Invalid email or password. Please try again.")
    }
  }

  const handleForgotPassword = () => {
    console.log("Navigate to Forgot Password")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8faf8]">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-sm border border-[#ABD1B5]/10">
        <div className="text-center">
          <div className="flex justify-center mb-2">
            <div className="text-[#79B791] font-semibold text-2xl relative">
              <span className="inline-block rounded-full bg-[#79B791] text-white px-2 py-0.5">é</span>
              <span className="text-[#13262F] ml-1">tude</span>
            </div>
          </div>
          <h2 className="text-2xl font-medium text-[#13262F]">Sign in to étude</h2>
          <p className="mt-2 text-sm text-[#13262F]/60">Enter your details to access your account</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#13262F]/80 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-[#13262F] bg-white border border-[#ABD1B5]/40 rounded-md focus:outline-none focus:ring-1 focus:ring-[#79B791] focus:border-[#79B791] text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-[#13262F]/80">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-[#79B791] hover:text-[#ABD1B5] focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-[#13262F] bg-white border border-[#ABD1B5]/40 rounded-md focus:outline-none focus:ring-1 focus:ring-[#79B791] focus:border-[#79B791] text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-white bg-[#79B791] rounded-md hover:bg-[#ABD1B5] focus:outline-none focus:ring-2 focus:ring-[#79B791] focus:ring-offset-2 transition-colors duration-200 text-sm font-medium"
            >
              Sign In
            </button>
          </div>
          {error && <div className="mt-2 text-red-500 text-xs text-center">{error}</div>}

          {isRedirecting && (
            <div className="mt-2 text-[#79B791] text-xs flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-3 w-3 text-[#79B791]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Logging in...
            </div>
          )}
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-[#13262F]/70">
            Don't have an account?{" "}
            <Link href="/sign-up" className="font-medium text-[#79B791] hover:text-[#ABD1B5] focus:outline-none">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
