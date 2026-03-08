"use client"
import { useState, useEffect } from "react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export default function TimetablePage() {
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [timetable, setTimetable] = useState<any[]>([])
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    day: "", subject: "", startTime: "", endTime: "", teacherId: ""
  })

  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(() => {})

    fetch("/api/teachers")
      .then(res => res.json())
      .then(data => setTeachers(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedClass) return
    setLoading(true)
    fetch(`/api/timetable?classId=${selectedClass}`)
      .then(res => res.json())
      .then(data => { setTimetable(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedClass])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.day || !form.subject || !form.startTime || !form.endTime) {
      setError("Please fill in all required fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, classId: selectedClass })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setTimetable([...timetable, data])
        setForm({ day: "", subject: "", startTime: "", endTime: "", teacherId: "" })
        setShowForm(false)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this slot?")) return
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" })
      if (res.ok) setTimetable(timetable.filter(t => t.id !== id))
    } catch {}
  }

  const getSlotsForDay = (day: string) => {
    return timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Timetable</h1>
          <p className="text-gray-400 text-sm mt-1">Manage class schedules</p>
        </div>
        {selectedClass && (
          <button onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 text-white font-semibold px-4 md:px-6 py-2.5 rounded-full hover:bg-purple-700 transition text-sm">
            {showForm ? "✕ Cancel" : "➕ Add Slot"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Select Class</label>
        <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
          className="w-full md:w-72 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition">
          <option value="">Choose a class...</option>
          {classes.map((cls: any) => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add Timetable Slot</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Day *</label>
              <select name="day" value={form.day} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition">
                <option value="">Select day</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Subject *</label>
              <input name="subject" value={form.subject} onChange={handleChange} type="text" placeholder="e.g. Mathematics"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Teacher</label>
              <select name="teacherId" value={form.teacherId} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition">
                <option value="">Select teacher</option>
                {teachers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Start Time *</label>
              <input name="startTime" value={form.startTime} onChange={handleChange} type="time"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">End Time *</label>
              <input name="endTime" value={form.endTime} onChange={handleChange} type="time"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition" />
            </div>
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="mt-4 bg-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-purple-700 transition disabled:opacity-50">
            {submitting ? "Adding..." : "Add Slot 🗓️"}
          </button>
        </div>
      )}

      {selectedClass && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center text-gray-400 py-12">Loading timetable...</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-5 divide-x divide-gray-100 min-w-[600px]">
                {DAYS.map(day => (
                  <div key={day}>
                    <div className="bg-purple-50 px-3 py-3 text-center">
                      <p className="text-xs font-bold text-purple-600 uppercase">{day}</p>
                    </div>
                    <div className="p-2 min-h-48 flex flex-col gap-2">
                      {getSlotsForDay(day).length === 0 ? (
                        <p className="text-gray-300 text-xs text-center mt-4">No slots</p>
                      ) : (
                        getSlotsForDay(day).map((slot: any, i: number) => (
                          <div key={i} className="bg-purple-50 border border-purple-100 rounded-xl p-2 relative group">
                            <p className="text-xs font-bold text-purple-700">{slot.subject}</p>
                            <p className="text-xs text-gray-400">{slot.startTime} - {slot.endTime}</p>
                            {slot.teacher && (
                              <p className="text-xs text-gray-400">{slot.teacher.firstName}</p>
                            )}
                            <button onClick={() => handleDelete(slot.id)}
                              className="absolute top-1 right-1 text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition">
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedClass && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">🗓️</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Select a Class</h3>
          <p className="text-gray-400 text-sm">Choose a class above to view or edit its timetable</p>
        </div>
      )}
    </div>
  )
}