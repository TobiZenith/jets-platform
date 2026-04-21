"use client"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => { if (!token) setError("Invalid reset link") }, [token])

  const handleSubmit = async () => {
    setError("")
    if (!password || !confirm) { setError("Please fill in all fields"); return }
    if (password !== confirm) { setError("Passwords do not match"); return }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong") }
      else { setSuccess(true); setTimeout(() => router.push("/parent/login"), 3000) }
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">&#128274;</div>
          <h2 className="text-xl font-bold text-gray-800">Reset Password</h2>
          <p className="text-gray-400 text-sm mt-1">Enter your new password below</p>
        </div>
        {success ? (
          <div className="text-center">
            <div className="text-5xl mb-4">&#9989;</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Password Reset!</h3>
            <p className="text-gray-500 text-sm mb-6">Your password has been reset. Redirecting to login...</p>
            <Link href="/parent/login" className="text-blue-600 font-semibold hover:underline text-sm">Go to Login</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter new password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
              <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" placeholder="Confirm new password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition" />
            </div>
            <button onClick={handleSubmit} disabled={loading || !token}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:opacity-50">
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default function ParentResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
