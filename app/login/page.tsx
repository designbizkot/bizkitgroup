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

      router.replace("/")
    } catch {
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
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
                placeholder="admin@bizkitgroup.com"
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
          </form>
        </div>
      </div>
    </div>
  )
}
