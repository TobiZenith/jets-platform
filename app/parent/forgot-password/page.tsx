"use client"
import { useState } from "react"
import Link from "next/link"

export default function ParentForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    setError("")
    if (!email) { setError("Please enter your email"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "parent" })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong") }
      else { setSuccess(true) }
    } catch { setError("Something went wrong") }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-block hover:opacity-80 transition mb-4">
            <img src="/images/logo.jpeg" alt="JETS" className="h-14 w-auto mx-auto" />
          </a>
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">??</div>
          <h2 className="text-xl font-bold text-gray-800">Forgot Password</h2>
          <p className="text-gray-400 text-sm mt-1">Enter your email to receive a reset link</p>
        </div>
        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">??</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Check your email!</h3>
            <p className="text-gray-500 text-sm mb-6">We sent a reset link to <strong>{email}</strong>. It expires in 1 hour.</p>
            <Link href="/parent/login" className="text-blue-600 font-semibold hover:underline text-sm">Back to Login</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="parent@email.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition" />
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:opacity-50">
              {loading ? "Sending..." : "Send Reset Link ??"}
            </button>
            <p className="text-center text-sm text-gray-400">
              Remember your password? <Link href="/parent/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
