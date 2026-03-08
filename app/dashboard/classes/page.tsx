"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", level: "" })

  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => {
        setClasses(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.name || !form.level) {
      setError("Please fill in all fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setClasses([...classes, data])
        setForm({ name: "", level: "" })
        setShowForm(false)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Classes</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all classes in your school</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white font-semibold px-4 md:px-6 py-2.5 rounded-full hover:bg-blue-700 transition text-sm">
          {showForm ? "✕ Cancel" : "➕ Add Class"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Class</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Class Name</label>
              <input name="name" value={form.name} onChange={handleChange} type="text" placeholder="e.g. Grade 5"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Level</label>
              <select name="level" value={form.level} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition">
                <option value="">Select level</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="mt-4 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
            {submitting ? "Adding..." : "Add Class 📚"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No classes yet</h3>
            <p className="text-gray-400 text-sm">Start by adding your first class</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Class</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Level</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Students</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{cls.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full capitalize">{cls.level}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{cls._count?.students || 0} students</td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/classes/${cls.id}`}
                        className="text-blue-600 text-sm hover:underline font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}