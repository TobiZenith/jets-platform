"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function EditClassPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", level: "" })

  useEffect(() => {
    fetch(`/api/classes/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({ name: data.name || "", level: data.level || "" })
        setFetching(false)
      })
      .catch(() => setFetching(false))
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")

    if (!form.name || !form.level) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        router.push(`/dashboard/classes/${id}`)
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
        <Link href={`/dashboard/classes/${id}`} className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Class
        </Link>
      </nav>

      <div className="flex">
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Dashboard", href: "/dashboard" },
              { icon: "🎓", label: "Students", href: "/dashboard/students" },
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
              { icon: "📚", label: "Classes", href: "/dashboard/classes", active: true },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active ? "bg-yellow-50 text-yellow-600" : "text-gray-600 hover:bg-gray-50 hover:text-yellow-600"}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 p-8">
          <div className="max-w-lg">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Edit Class</h1>
              <p className="text-gray-400 text-sm mt-1">Update class information</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Class Name *</label>
                <input name="name" value={form.name} onChange={handleChange} type="text"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Level *</label>
                <select name="level" value={form.level} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition">
                  <option value="">Select level</option>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-yellow-500 text-white font-bold py-3 rounded-xl hover:bg-yellow-600 transition mt-2 disabled:opacity-50">
                {loading ? "Saving..." : "Save Changes ✏️"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}