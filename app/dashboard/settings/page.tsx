"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    schoolName: "", address: "", type: ""
  })

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setForm({
          schoolName: data.name || "",
          address: data.address || "",
          type: data.type || ""
        })
      })
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    setSuccess("")

    if (!form.schoolName || !form.address || !form.type) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setSuccess("School settings updated successfully! ✅")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-10 w-auto" />
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Dashboard", href: "/dashboard" },
              { icon: "🎓", label: "Students", href: "/dashboard/students" },
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
              { icon: "📚", label: "Classes", href: "/dashboard/classes" },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings", active: true },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-lg">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
              <p className="text-gray-400 text-sm mt-1">Update your school profile and information</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-6">
                {success}
              </div>
            )}

            {/* Admin Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">👤 Admin Information</h2>
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-400">Name</span>
                  <span className="font-medium">{session?.user?.name}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-400">Email</span>
                  <span className="font-medium">{session?.user?.email}</span>
                </div>
              </div>
            </div>

            {/* School Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🏫 School Information</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">School Name</label>
                  <input name="schoolName" value={form.schoolName} onChange={handleChange} type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                  <input name="address" value={form.address} onChange={handleChange} type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">School Type</label>
                  <select name="type" value={form.type} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition">
                    <option value="">Select type</option>
                    <option value="primary">Primary School</option>
                    <option value="secondary">Secondary / High School</option>
                    <option value="both">Both Primary & Secondary</option>
                  </select>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                  {loading ? "Saving..." : "Save Changes ⚙️"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}