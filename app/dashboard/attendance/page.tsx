"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    studentId: "", date: new Date().toISOString().split("T")[0], status: ""
  })

  useEffect(() => {
    fetch("/api/attendance")
      .then(res => res.json())
      .then(data => { setAttendance(data); setLoading(false) })
      .catch(() => setLoading(false))

    fetch("/api/students")
      .then(res => res.json())
      .then(data => setStudents(data))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.studentId || !form.date || !form.status) {
      setError("Please fill in all fields")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        const newRecord = { ...data, student: students.find(s => s.id === form.studentId) }
        setAttendance([newRecord, ...attendance])
        setShowForm(false)
        setForm({ studentId: "", date: new Date().toISOString().split("T")[0], status: "" })
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    if (status === "present") return "text-green-600 bg-green-50"
    if (status === "late") return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
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
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance", active: true },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active
                    ? "bg-green-50 text-green-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-green-600"
                  }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
              <p className="text-gray-400 text-sm mt-1">Track daily student attendance</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-green-600 transition text-sm">
              ➕ Mark Attendance
            </button>
          </div>

          {/* Mark Attendance Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Mark Attendance</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Student *</label>
                  <select name="studentId" onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition">
                    <option value="">Select student</option>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Date *</label>
                  <input name="date" onChange={handleChange} type="date" value={form.date}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Status *</label>
                  <select name="status" onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition">
                    <option value="">Select status</option>
                    <option value="present">✅ Present</option>
                    <option value="absent">❌ Absent</option>
                    <option value="late">⏰ Late</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-4 bg-green-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-600 transition disabled:opacity-50">
                {submitting ? "Saving..." : "Save Attendance 📅"}
              </button>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading attendance...</div>
            ) : attendance.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📅</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No attendance records yet</h3>
                <p className="text-gray-400 text-sm">Click Mark Attendance to start tracking</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {record.student?.firstName} {record.student?.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}