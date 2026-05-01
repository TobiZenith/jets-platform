"use client"
import { useState, useEffect } from "react"

export default function GradesPage() {
  const [grades, setGrades] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ classId: "", studentId: "", subjectId: "", score: "", term: "" })
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [filterClass, setFilterClass] = useState("")
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState("")

  useEffect(() => {
    fetch("/api/grades").then(r => r.json()).then(d => { setGrades(Array.isArray(d) ? d : []); setLoading(false) })
    fetch("/api/classes").then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : []))
  }, [])

  useEffect(() => {
    if (!form.classId) { setStudents([]); setSubjects([]); return }
    fetch(`/api/classes/${form.classId}`).then(r => r.json()).then(d => setStudents(Array.isArray(d.students) ? d.students : []))
    fetch(`/api/subjects?classId=${form.classId}`).then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : []))
  }, [form.classId])

  const handleAdd = async () => {
    setError("")
    if (!form.classId || !form.studentId || !form.subjectId || !form.score || !form.term) {
      setError("Please fill in all fields"); return
    }
    setAdding(true)
    try {
      const subject = subjects.find(s => s.id === form.subjectId)
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: form.studentId, subject: subject?.name, score: form.score, term: form.term })
      })
      const data = await res.json()
      if (res.ok) {
        setGrades(prev => [data, ...prev])
        setForm({ classId: "", studentId: "", subjectId: "", score: "", term: "" })
        setShowForm(false)
        setSuccess("Grade added!")
        setTimeout(() => setSuccess(""), 3000)
      } else { setError(data.error || "Something went wrong") }
    } catch { setError("Something went wrong") }
    finally { setAdding(false) }
  }

  const handleSendGrades = async () => {
    if (!filterClass) { setSendMsg("Please select a class first"); return }
    setSending(true)
    setSendMsg("")
    try {
      const res = await fetch("/api/grades/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: filterClass })
      })
      const data = await res.json()
      if (res.ok) { setSendMsg(`Grades sent to ${data.sent} parent(s) successfully!`) }
      else { setSendMsg(data.error || "Something went wrong") }
    } catch { setSendMsg("Something went wrong") }
    finally { setSending(false) }
  }

  const filtered = filterClass ? grades.filter(g => g.student?.classId === filterClass) : grades

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Grades</h1>
          <p className="text-gray-400 text-sm mt-1">Manage student grades by subject and term</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-yellow-500 text-white font-bold px-5 py-2.5 rounded-full hover:bg-yellow-600 transition text-sm">
          {showForm ? "Cancel" : "+ Add Grade"}
        </button>
      </div>

      {success && <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Grade</h2>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Class</label>
              <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value, studentId: "", subjectId: "" })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-yellow-400">
                <option value="">Select class</option>
                {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Student</label>
              <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-yellow-400">
                <option value="">Select student</option>
                {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
              <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-yellow-400">
                <option value="">Select subject</option>
                {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Score (%)</label>
              <input value={form.score} onChange={e => setForm({ ...form, score: e.target.value })} type="number" min="0" max="100" placeholder="e.g. 85"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Term</label>
              <select value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-yellow-400">
                <option value="">Select term</option>
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Third Term">Third Term</option>
              </select>
            </div>
          </div>
          <button onClick={handleAdd} disabled={adding}
            className="mt-4 bg-yellow-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50 text-sm">
            {adding ? "Adding..." : "Add Grade"}
          </button>
        </div>
      )}

      {/* Filter + Send */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap items-center gap-4">
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 focus:outline-none focus:border-yellow-400">
          <option value="">All Classes</option>
          {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button onClick={handleSendGrades} disabled={sending}
          className="bg-blue-600 text-white font-bold px-5 py-2 rounded-full hover:bg-blue-700 transition text-sm disabled:opacity-50">
          {sending ? "Sending..." : "Send Grades to Parents"}
        </button>
        {sendMsg && <p className="text-sm text-blue-600">{sendMsg}</p>}
      </div>

      {/* Grades Table */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">All Grades</h2>
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-4">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No grades recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                  <th className="pb-3 font-semibold">Student</th>
                  <th className="pb-3 font-semibold">Subject</th>
                  <th className="pb-3 font-semibold">Score</th>
                  <th className="pb-3 font-semibold">Grade</th>
                  <th className="pb-3 font-semibold">Term</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g: any, i: number) => {
                  const score = g.score
                  const grade = score >= 70 ? "A" : score >= 60 ? "B" : score >= 50 ? "C" : score >= 40 ? "D" : "F"
                  const color = score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"
                  return (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 text-sm font-medium text-gray-800">{g.student?.firstName} {g.student?.lastName}</td>
                      <td className="py-3 text-sm text-gray-600">{g.subject}</td>
                      <td className="py-3 text-sm text-gray-800">{g.score}%</td>
                      <td className={`py-3 text-sm font-bold ${color}`}>{grade}</td>
                      <td className="py-3 text-sm text-gray-600">{g.term}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
