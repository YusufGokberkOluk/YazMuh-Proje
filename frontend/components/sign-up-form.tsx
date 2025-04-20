"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignUpForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState("")

  // Check if user is already logged in
  useEffect(() => {
    // In a real app, this would check for auth tokens/cookies
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (isLoggedIn) {
      router.push("/app")
    }
  }, [router])

  const validatePasswords = () => {
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return false
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters")
      return false
    }

    setPasswordError("")
    return true
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!email || !password || !confirmPassword) {
      setFormError("All fields are required")
      return
    }

    if (validatePasswords()) {
      console.log("Sign up attempt", { email, password })
      setIsSubmitting(true)

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false)

        // In a real app, this would create a user account
        // For demo purposes, just redirect to sign-in
        router.push("/sign-in")
      }, 1500)
    }
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
          <h2 className="text-2xl font-medium text-[#13262F]">Create your account</h2>
          <p className="mt-2 text-sm text-[#13262F]/60">Sign up to get started with étude</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSignUp}>
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
              <label htmlFor="password" className="block text-sm font-medium text-[#13262F]/80 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-[#13262F] bg-white border border-[#ABD1B5]/40 rounded-md focus:outline-none focus:ring-1 focus:ring-[#79B791] focus:border-[#79B791] text-sm"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-[#13262F]/60">Password must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#13262F]/80 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={validatePasswords}
                className={`w-full px-3 py-2 text-[#13262F] bg-white border ${
                  passwordError ? "border-red-400" : "border-[#ABD1B5]/40"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-[#79B791] focus:border-[#79B791] text-sm`}
                placeholder="••••••••"
              />
              {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
            </div>
          </div>

          {formError && <p className="text-xs text-red-500 text-center">{formError}</p>}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 text-white bg-[#79B791] rounded-md hover:bg-[#ABD1B5] focus:outline-none focus:ring-2 focus:ring-[#79B791] focus:ring-offset-2 transition-colors duration-200 text-sm font-medium disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-[#13262F]/70">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-[#79B791] hover:text-[#ABD1B5] focus:outline-none">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
