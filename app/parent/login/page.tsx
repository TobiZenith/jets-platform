"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ParentLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ email: "", password: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")

    if (!form.email || !form.password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/parent/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Invalid email or password")
      } else {
        localStorage.setItem("parentToken", data.token)
        localStorage.setItem("parentData", JSON.stringify(data.parent))
        router.push("/parent/dashboard")
      }
    } catch (err) {
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
            <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto mx-auto" />
          </a>
          <h2 className="text-xl font-bold text-gray-800">Parent Login</h2>
          <p className="text-gray-400 text-sm mt-1">Log in to monitor your child's progress</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <input name="email" onChange={handleChange} type="email" placeholder="parent@email.com"
             className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input name="password" onChange={handleChange} type="password" placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition" />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:opacity-50">
            {loading ? "Logging in..." : "Log In 👨‍👩‍👧"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Forgot your password? <a href="/parent/forgot-password" className="text-blue-600 font-semibold hover:underline">Reset it here</a></p><p className="text-center text-sm text-gray-500 mt-2">Don't have an account?{" "}
          <a href="/parent/register" className="text-blue-600 font-semibold hover:underline">
            Register here
          </a>
        </p>

      </div>
    </main>
  )
}
