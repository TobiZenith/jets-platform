"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function TeacherLoginPage() {
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
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Invalid email or password")
      } else {
        localStorage.setItem("teacherToken", data.token)
        localStorage.setItem("teacherData", JSON.stringify(data.teacher))
        router.push("/teacher/dashboard")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-block hover:opacity-80 transition mb-4">
            <img src="/images/logo.jpeg" alt="JETS" className="h-14 w-auto mx-auto" />
          </a>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">👩‍🏫</div>
          <h2 className="text-xl font-bold text-gray-800">Teacher Login</h2>
          <p className="text-gray-400 text-sm mt-1">Log in to manage your class</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="teacher@school.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400 transition" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400 transition" />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition mt-2 disabled:opacity-50">
            {loading ? "Logging in..." : "Log In 👩‍🏫"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Your login credentials are provided by your school admin
        </p>
      </div>
    </main>
  )
}