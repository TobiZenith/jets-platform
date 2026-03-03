"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function NewStudentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({
    firstName: "", lastName: "", studentId: "", classId: ""
  })

  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")

    if (!form.firstName || !form.lastName || !form.studentId) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        router.push("/dashboard/students")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="text-2xl font-extrabold tracking-widest">
          <span className="text-blue-600">J</span>
          <span className="text-pink-500">E</span>
          <span className="text-yellow-400">T</span>
          <span className="text-green-500">S</span>
        </div>
        <Link href="/dashboard/students" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Students
        </Link>
      </nav>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Dashboard", href: "/dashboard" },
              { icon: "🎓", label: "Students", href: "/dashboard/students", active: true },
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
              { icon: "📚", label: "Classes", href: "/dashboard/classes" },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
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
              <h1 className="text-2xl font-bold text-gray-800">Add New Student</h1>
              <p className="text-gray-400 text-sm mt-1">Fill in the details to add a new student</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">First Name *</label>
                  <input name="firstName" onChange={handleChange} type="text" placeholder="John"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name *</label>
                  <input name="lastName" onChange={handleChange} type="text" placeholder="Doe"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Student ID *</label>
                <input name="studentId" onChange={handleChange} type="text" placeholder="e.g. STU001"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Class (Optional)</label>
                <select name="classId" onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition text-gray-500">
                  <option value="">Select a class</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition mt-2 disabled:opacity-50">
                {loading ? "Adding Student..." : "Add Student 🎓"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}