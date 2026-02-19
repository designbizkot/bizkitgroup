"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isDisabled = !email.trim() || !password.trim() || loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid credentials")
        setLoading(false)
        return
      }

      window.location.href = "/"
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  // ✅ เพิ่มแค่นี้
  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google"
  }

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left panel - brand */}
      <div className="hidden flex-col items-center justify-center bg-[#092a32] p-12 lg:flex lg:w-[45%]">
        <div className="flex flex-col items-center gap-6">
          <Image
            src="/images/bizkit-logo-white.png"
            alt="Bizkit"
            width={200}
            height={52}
            className="h-12 w-auto"
          />
          <p className="mt-4 max-w-sm text-center text-sm leading-relaxed text-white/60">
            Manage your business, clients, projects, and teams all in one place.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 flex justify-center lg:hidden">
            <Image
              src="/images/bizkit-logo.png"
              alt="Bizkit"
              width={48}
              height={48}
              className="h-10 w-auto"
            />
          </div>

          <h1 className="text-2xl font-semibold text-[#092a32]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-[#737373]">
            Sign in to your Bizkit account
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#092a32]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-[#d6d6d6] bg-white px-3.5 py-2.5 text-sm text-[#092a32] placeholder:text-[#a3a3a3] focus:border-[#166a7d] focus:outline-none focus:ring-1 focus:ring-[#166a7d]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#092a32]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#d6d6d6] bg-white px-3.5 py-2.5 pr-10 text-sm text-[#092a32] placeholder:text-[#a3a3a3] focus:border-[#166a7d] focus:outline-none focus:ring-1 focus:ring-[#166a7d]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] transition-colors hover:text-[#092a32]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isDisabled}
              className="mt-2 rounded-lg bg-[#166a7d] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#12596a] disabled:cursor-not-allowed disabled:bg-[#D0E1E5] disabled:text-white disabled:opacity-100"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e5e5e5]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-[#a3a3a3]">
                  OR
                </span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="rounded-lg border border-[#d6d6d6] bg-white px-4 py-2.5 text-sm font-medium text-[#092a32] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="18"
                height="18"
              >
                <path fill="#EA4335" d="M24 9.5c3.4 0 6.3 1.2 8.6 3.2l6.4-6.4C34.9 2.3 29.8 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.7 6C12.1 13.6 17.5 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.5c-.5 2.7-2 5-4.3 6.5l6.7 5.2c3.9-3.6 6.2-8.9 6.2-16.2z" />
                <path fill="#FBBC05" d="M10.4 28.3c-1-2.7-1-5.6 0-8.3l-7.7-6C.9 17.2 0 20.5 0 24s.9 6.8 2.7 10l7.7-5.7z" />
                <path fill="#34A853" d="M24 48c5.8 0 10.7-1.9 14.2-5.2l-6.7-5.2c-1.9 1.3-4.4 2.1-7.5 2.1-6.5 0-11.9-4.1-13.6-9.8l-7.7 6C6.6 42.6 14.6 48 24 48z" />
              </svg>

              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
