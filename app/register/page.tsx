"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    schoolName: "", address: "", type: "",
    firstName: "", lastName: "", email: "", phone: "", password: "", confirmPassword: ""
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")

    if (!form.schoolName || !form.address || !form.type || !form.firstName || !form.lastName || !form.email || !form.password) {
      setError("Please fill in all fields")
      return
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        router.push("/login?registered=true")
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
            <img src="/images/logo.jpeg" alt="JETS" className="h-12 w-auto mx-auto" />
          </a>
          <h2 className="text-xl font-bold text-gray-800">Register Your School</h2>
          <p className="text-gray-400 text-sm mt-1">Get your school up and running in minutes</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="bg-blue-50 rounded-2xl p-4">
            <p className="text-blue-600 font-bold text-sm mb-3">🏫 School Information</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">School Name</label>
                <input name="schoolName" onChange={handleChange} type="text" placeholder="e.g. Greenfield Academy"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">School Address</label>
                <input name="address" onChange={handleChange} type="text" placeholder="e.g. 12 School Road, Lagos"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">School Type</label>
                <select name="type" onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white text-gray-500">
                  <option value="">Select school type</option>
                  <option value="primary">Primary School</option>
                  <option value="secondary">Secondary / High School</option>
                  <option value="both">Both Primary & Secondary</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 rounded-2xl p-4">
            <p className="text-pink-500 font-bold text-sm mb-3">👤 Admin Information</p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">First Name</label>
                  <input name="firstName" onChange={handleChange} type="text" placeholder="John"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name</label>
                  <input name="lastName" onChange={handleChange} type="text" placeholder="Doe"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
                <input name="email" onChange={handleChange} type="email" placeholder="admin@school.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone Number</label>
                <input name="phone" onChange={handleChange} type="tel" placeholder="+234 800 000 0000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-2xl p-4">
            <p className="text-yellow-600 font-bold text-sm mb-3">🔐 Set Your Password</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
                <input name="password" onChange={handleChange} type="password" placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
                <input name="confirmPassword" onChange={handleChange} type="password" placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition bg-white" />
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:opacity-50">
            {loading ? "Registering..." : "Register School 🚀"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-semibold hover:underline">Log in here</a>
        </p>

      </div>
    </main>
  )
}