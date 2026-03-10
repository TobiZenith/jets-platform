"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ParentRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: "", studentId: "", schoolCode: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.studentId || !form.schoolCode) {
      setError("Please fill in all fields")
      return
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/parent/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        router.push("/parent/login?registered=true")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-lg">

        <div className="text-center mb-8">
          <a href="/" className="inline-block hover:opacity-80 transition mb-2">
            <img src="/images/logo.jpeg" alt="JETS" className="h-14 w-auto mx-auto" />
          </a>
          <h2 className="text-xl font-bold text-gray-800">Parent Registration</h2>
          <p className="text-gray-400 text-sm mt-1">Create an account to monitor your child's progress</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">

          {/* Personal Info */}
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-blue-600 font-bold text-sm mb-3">👤 Your Information</p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} type="text" placeholder="John"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition bg-white" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} type="text" placeholder="Doe"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition bg-white" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="parent@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                <input name="phone" value={form.phone} onChange={handleChange} type="tel" placeholder="+234 800 000 0000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition bg-white" />
              </div>
            </div>
          </div>

          {/* School Info */}
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-green-600 font-bold text-sm mb-3">🏫 School Information</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">School Code</label>
                <input name="schoolCode" value={form.schoolCode} onChange={handleChange} type="text" placeholder="e.g. JETS-ABC123"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400 transition bg-white" />
                <p className="text-gray-400 text-xs mt-1">Ask your school admin for the school code</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Child's Student ID</label>
                <input name="studentId" value={form.studentId} onChange={handleChange} type="text" placeholder="e.g. STU001"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400 transition bg-white" />
                <p className="text-gray-400 text-xs mt-1">Ask your school admin for your child's Student ID</p>
              </div>
            </div>
          </div>

          {/* Password */}
          <div className="bg-yellow-50 rounded-2xl p-4">
            <p className="text-yellow-600 font-bold text-sm mb-3">🔐 Set Your Password</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                <input name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-yellow-400 transition bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
                <input name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-yellow-400 transition bg-white" />
              </div>
            </div>
          </div>

          <button onClick={handleSubmit} disabled={loading}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:opacity-50">
            {loading ? "Creating Account..." : "Create Parent Account 👨‍👩‍👧"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/parent/login" className="text-blue-600 font-semibold hover:underline">Log in here</a>
        </p>

      </div>
    </main>
  )
