"use client"
import { useState } from "react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    setError("")
    setMessage("")
    if (!email) { setError("Please enter your email"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || "Something went wrong")
      else setMessage(data.message)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-block hover:opacity-80 transition mb-2">
            <img src="/images/logo.jpeg" alt="JETS" className="h-12 w-auto mx-auto" />
          </a>
          <h2 className="text-xl font-bold text-gray-800">Forgot Password?</h2>
          <p className="text-gray-400 text-sm mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-4">{message}</div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:opacity-50">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          <a href="/login" className="text-center text-sm text-blue-600 hover:underline">Back to Login</a>
        </div>
      </div>
    </main>
  )
}