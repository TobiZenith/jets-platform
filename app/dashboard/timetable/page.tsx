"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const dayColors: Record<string, string> = {
  Monday: "bg-blue-50 border-blue-200",
  Tuesday: "bg-pink-50 border-pink-200",
  Wednesday: "bg-yellow-50 border-yellow-200",
  Thursday: "bg-green-50 border-green-200",
  Friday: "bg-purple-50 border-purple-200",
}

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [timetable, setTimetable] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    classId: "", day: "", subject: "", startTime: "", endTime: "", teacherId: ""
  })

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(setClasses)
    fetch("/api/teachers").then(r => r.json()).then(setTeachers)
  }, [])

 const fetchTimetable = async (classId: string) => {
    setLoading(true)
    try {
      const res = await fetch("/api/timetable?classId=" + classId)
      const data = await res.json()
      setTimetable(Array.isArray(data) ? data : [])
    } catch {
      setTimetable([])
    }
    setLoading(false)
  }

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId)
    setForm({ ...form, classId })
    fetchTimetable(classId)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.classId || !form.day || !form.subject || !form.startTime || !form.endTime || !form.teacherId) {
      setError("Please fill in all fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        fetchTimetable(selectedClass)
        setShowForm(false)
        setForm({ classId: selectedClass, day: "", subject: "", startTime: "", endTime: "", teacherId: "" })
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return
    await fetch("/api/timetable?id=" + id, { method: "DELETE" })
    setTimetable(timetable.filter(t => t.id !== id))
  }

  const getEntriesForDay = (day: string) => {
    const entries = []
    for (const t of timetable) {
      if (t.day === day) entries.push(t)
    }
    return entries
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="text-2xl font-extrabold tracking-widest">
          <span className="text-blue-600">J</span>
          <span className="text-pink-500">E</span>
          <span className="text-yellow-400">T</span>
          <span className="text-green-500">S</span>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition">
          Back to Dashboard
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
              { icon: "📚", label: "Classes", href: "/dashboard/classes" },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "📋", label: "Report Cards", href: "/dashboard/reports" },
              { icon: "💰", label: "Fees", href: "/dashboard/fees" },
              { icon: "🗓️", label: "Timetable", href: "/dashboard/timetable", active: true },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition " + (item.active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600")}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Timetable</h1>
              <p className="text-gray-400 text-sm mt-1">Manage weekly class schedules</p>
            </div>
            {selectedClass && (
              <button onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-blue-700 transition text-sm">
                Add Entry
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Select Class</label>
            <select onChange={e => handleClassChange(e.target.value)}
              className="w-full md:w-64 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition">
              <option value="">Choose a class</option>
              {classes.map((cls: any) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Add Timetable Entry</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Day</label>
                  <select name="day" onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition">
                    <option value="">Select day</option>
                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                  <input name="subject" onChange={handleChange} type="text" placeholder="e.g. Mathematics"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Teacher</label>
                  <select name="teacherId" onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition">
                    <option value="">Select teacher</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Start Time</label>
                  <input name="startTime" onChange={handleChange} type="time"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">End Time</label>
                  <input name="endTime" onChange={handleChange} type="time"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="mt-4 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                {submitting ? "Adding..." : "Add to Timetable"}
              </button>
            </div>
          )}

          {!selectedClass ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <div className="text-5xl mb-4">🗓️</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Select a class to view timetable</h3>
              <p className="text-gray-400 text-sm">Choose a class from the dropdown above</p>
            </div>
          ) : loading ? (
            <div className="text-center text-gray-400 py-12">Loading timetable...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {DAYS.map(day => (
                <div key={day} className={dayColors[day] + " border rounded-2xl p-4"}>
                  <h3 className="font-bold text-gray-800 mb-3 text-center">{day}</h3>
                  {getEntriesForDay(day).length === 0 ? (
                    <p className="text-gray-400 text-xs text-center py-4">No classes</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {getEntriesForDay(day).map((entry: any, i: number) => (
                        <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
                          <p className="font-bold text-gray-800 text-sm">{entry.subject}</p>
                          <p className="text-gray-400 text-xs">{entry.startTime} - {entry.endTime}</p>
                          <p className="text-gray-500 text-xs mt-1">{entry.teacher?.firstName} {entry.teacher?.lastName}</p>
                          <button onClick={() => handleDelete(entry.id)}
                            className="text-red-400 text-xs hover:text-red-600 transition mt-1">
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}