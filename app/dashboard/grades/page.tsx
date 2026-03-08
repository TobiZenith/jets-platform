"use client"
import { useState, useEffect } from "react"

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ studentId: "", subject: "", score: "", term: "" })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch("/api/grades")
      .then(res => res.json())
      .then(data => { setGrades(data); setLoading(false) })
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
    if (!form.studentId || !form.subject || !form.score || !form.term) {
      setError("Please fill in all fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setGrades([data, ...grades])
        setShowForm(false)
        setForm({ studentId: "", subject: "", score: "", term: "" })
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50"
    if (score >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Grades</h1>
          <p className="text-gray-400 text-sm mt-1">Record and manage student grades</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 text-white font-semibold px-4 md:px-6 py-2.5 rounded-full hover:bg-purple-700 transition text-sm">
          {showForm ? "✕ Cancel" : "➕ Add Grade"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Record New Grade</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Student *</label>
              <select name="studentId" value={form.studentId} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition">
                <option value="">Select student</option>
                {students.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Subject *</label>
              <input name="subject" value={form.subject} onChange={handleChange} type="text" placeholder="e.g. Mathematics"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Score (%) *</label>
              <input name="score" value={form.score} onChange={handleChange} type="number" placeholder="e.g. 85" min="0" max="100"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Term *</label>
              <select name="term" value={form.term} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition">
                <option value="">Select term</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={submitting}
            className="mt-4 bg-purple-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-purple-700 transition disabled:opacity-50">
            {submitting ? "Saving..." : "Save Grade 📊"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading grades...</div>
        ) : grades.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No grades yet</h3>
            <p className="text-gray-400 text-sm">Click Add Grade to record your first grade</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Subject</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Score</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase hidden md:table-cell">Term</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {grade.student?.firstName} {grade.student?.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{grade.subject}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreColor(grade.score)}`}>
                        {grade.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">{grade.term}</td>
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