"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

export default function LoginPage() {
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
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/dashboard")
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
          <a href="/" className="text-3xl font-extrabold tracking-widest mb-2 inline-block hover:opacity-80 transition">
            <span className="text-blue-600">J</span>
            <span className="text-pink-500">E</span>
            <span className="text-yellow-400">T</span>
            <span className="text-green-500">S</span>
          </a>
          <h2 className="text-xl font-bold text-gray-800">Welcome Back!</h2>
          <p className="text-gray-400 text-sm mt-1">Log in to your school dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <input name="email" onChange={handleChange} type="email" placeholder="you@school.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input name="password" onChange={handleChange} type="password" placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-500">
              <input type="checkbox" className="rounded" />
              Remember me
            </label>
            <a href="#" className="text-blue-600 hover:underline">Forgot password?</a>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:opacity-50">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-600 font-semibold hover:underline">
            Register your school
          </a>
        </p>

      </div>
    </main>
  )
}