"use client"
import { useState, useEffect } from "react"

export default function GradesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [gradingSettings, setGradingSettings] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [scores, setScores] = useState<Record<string, { caScore: string, examScore: string }>>({})
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState("")
  const [activeTab, setActiveTab] = useState("entry")
  const [sending, setSending] = useState(false)
  const [sendMsg, setSendMsg] = useState("")
  const [publishing, setPublishing] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/classes").then(r => r.json()).then(d => setClasses(Array.isArray(d) ? d : []))
    fetch("/api/grading-settings").then(r => r.json()).then(d => setGradingSettings(d))
  }, [])

  useEffect(() => {
    if (!selectedClass) { setStudents([]); setSubjects([]); return }
    fetch(`/api/classes/${selectedClass}`).then(r => r.json()).then(d => setStudents(Array.isArray(d.students) ? d.students : []))
    fetch(`/api/subjects?classId=${selectedClass}`).then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : []))
  }, [selectedClass])

  useEffect(() => {
    if (!selectedClass || !selectedTerm) { setGrades([]); return }
    setLoading(true)
    fetch(`/api/grades?classId=${selectedClass}&term=${encodeURIComponent(selectedTerm)}`)
      .then(r => r.json()).then(d => { setGrades(Array.isArray(d) ? d : []); setLoading(false) })
  }, [selectedClass, selectedTerm])

  useEffect(() => {
    if (!selectedStudent || !selectedTerm) { setScores({}); return }
    const studentGrades = grades.filter(g => g.studentId === selectedStudent)
    const newScores: Record<string, { caScore: string, examScore: string }> = {}
    subjects.forEach(s => {
      const existing = studentGrades.find(g => g.subject === s.name)
      newScores[s.id] = { caScore: existing?.caScore?.toString() || "", examScore: existing?.examScore?.toString() || "" }
    })
    setScores(newScores)
  }, [selectedStudent, grades, subjects])

  const handleSaveScores = async () => {
    if (!selectedStudent || !selectedTerm) { setSaveMsg("Please select a student and term"); return }
    setSaving(true)
    setSaveMsg("")
    try {
      for (const subject of subjects) {
        const score = scores[subject.id]
        if (!score?.caScore && !score?.examScore) continue
        await fetch("/api/grades", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId: selectedStudent,
            subject: subject.name,
            caScore: score.caScore || 0,
            examScore: score.examScore || 0,
            term: selectedTerm
          })
        })
      }
      setSaveMsg("Scores saved successfully!")
      fetch(`/api/grades?classId=${selectedClass}&term=${encodeURIComponent(selectedTerm)}`)
        .then(r => r.json()).then(d => setGrades(Array.isArray(d) ? d : []))
      setTimeout(() => setSaveMsg(""), 3000)
    } catch { setSaveMsg("Something went wrong") }
    finally { setSaving(false) }
  }

  const handlePublish = async (studentId: string, publish: boolean) => {
    setPublishing(studentId)
    try {
      await fetch("/api/grades/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, term: selectedTerm, publish })
      })
      fetch(`/api/grades?classId=${selectedClass}&term=${encodeURIComponent(selectedTerm)}`)
        .then(r => r.json()).then(d => setGrades(Array.isArray(d) ? d : []))
    } catch {}
    finally { setPublishing(null) }
  }

  const handleSendGrades = async () => {
    if (!selectedClass || !selectedTerm) { setSendMsg("Please select a class and term first"); return }
    setSending(true)
    setSendMsg("")
    try {
      const res = await fetch("/api/grades/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: selectedClass, term: selectedTerm })
      })
      const data = await res.json()
      if (res.ok) { setSendMsg(`Grades sent to ${data.sent} parent(s) successfully!`) }
      else { setSendMsg(data.error || "Something went wrong") }
    } catch { setSendMsg("Something went wrong") }
    finally { setSending(false) }
  }

  const studentGrades = grades.filter(g => g.studentId === selectedStudent)
  const uniqueStudentsWithGrades = [...new Set(grades.map(g => g.studentId))]
    .map(sid => {
      const studentGradeList = grades.filter(g => g.studentId === sid)
      const student = studentGradeList[0]?.student
      const total = studentGradeList.reduce((sum, g) => sum + (g.score || 0), 0)
      const avg = studentGradeList.length > 0 ? (total / studentGradeList.length).toFixed(1) : "0"
      const published = studentGradeList.every(g => g.published)
      return { studentId: sid, student, avg, published, count: studentGradeList.length }
    })

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Grades</h1>
        <p className="text-gray-400 text-sm mt-1">Enter and manage student grades by subject and term</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-2xl shadow-sm p-2 max-w-sm">
        {["entry", "results"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition ${activeTab === tab ? "bg-yellow-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
            {tab === "entry" ? "Grade Entry" : "Results"}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent("") }}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-yellow-400">
          <option value="">Select Class</option>
          {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-yellow-400">
          <option value="">Select Term</option>
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>
        {activeTab === "entry" && (
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-yellow-400">
            <option value="">Select Student</option>
            {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
        )}
      </div>

      {activeTab === "entry" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800">Enter Scores</h2>
            {gradingSettings && (
              <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                CA: {gradingSettings.caWeight}% | Exam: {gradingSettings.examWeight}%
              </span>
            )}
          </div>
          {!selectedClass || !selectedTerm || !selectedStudent ? (
            <p className="text-gray-400 text-sm text-center py-8">Please select a class, term and student above</p>
          ) : subjects.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No subjects added for this class. Go to Classes to add subjects.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                      <th className="pb-3 font-semibold">Subject</th>
                      <th className="pb-3 font-semibold">CA ({gradingSettings?.caWeight || 40}%)</th>
                      <th className="pb-3 font-semibold">Exam ({gradingSettings?.examWeight || 60}%)</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Grade</th>
                      <th className="pb-3 font-semibold">Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s: any) => {
                      const score = scores[s.id] || { caScore: "", examScore: "" }
                      const ca = parseFloat(score.caScore) || 0
                      const exam = parseFloat(score.examScore) || 0
                      const total = gradingSettings ? (ca * gradingSettings.caWeight / 100) + (exam * gradingSettings.examWeight / 100) : ca + exam
                      const gradeInfo = gradingSettings?.boundaries?.find((b: any) => total >= b.min && total <= b.max)
                      return (
                        <tr key={s.id} className="border-b border-gray-50">
                          <td className="py-3 text-sm font-medium text-gray-800">{s.name}</td>
                          <td className="py-3">
                            <input type="number" min="0" max="100" value={score.caScore}
                              onChange={e => setScores(prev => ({ ...prev, [s.id]: { ...prev[s.id], caScore: e.target.value } }))}
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-yellow-400" />
                          </td>
                          <td className="py-3">
                            <input type="number" min="0" max="100" value={score.examScore}
                              onChange={e => setScores(prev => ({ ...prev, [s.id]: { ...prev[s.id], examScore: e.target.value } }))}
                              className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-800 focus:outline-none focus:border-yellow-400" />
                          </td>
                          <td className="py-3 text-sm font-bold text-gray-800">{(score.caScore || score.examScore) ? total.toFixed(1) : "-"}</td>
                          <td className="py-3">
                            <span className={`text-sm font-bold ${gradeInfo?.grade === "A" ? "text-green-600" : gradeInfo?.grade === "F" ? "text-red-600" : "text-yellow-600"}`}>
                              {(score.caScore || score.examScore) ? gradeInfo?.grade || "-" : "-"}
                            </span>
                          </td>
                          <td className="py-3 text-sm text-gray-500">{(score.caScore || score.examScore) ? gradeInfo?.remark || "-" : "-"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {saveMsg && <p className={`text-sm mt-3 ${saveMsg.includes("successfully") ? "text-green-600" : "text-red-600"}`}>{saveMsg}</p>}
              <button onClick={handleSaveScores} disabled={saving}
                className="mt-4 bg-yellow-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50">
                {saving ? "Saving..." : "Save Scores"}
              </button>
            </>
          )}
        </div>
      )}

      {activeTab === "results" && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-bold text-gray-800">Results — Publish to Parents</h2>
            <div className="flex items-center gap-3">
              {sendMsg && <p className="text-sm text-blue-600">{sendMsg}</p>}
              <button onClick={handleSendGrades} disabled={sending}
                className="bg-blue-600 text-white font-bold px-5 py-2 rounded-full hover:bg-blue-700 transition text-sm disabled:opacity-50">
                {sending ? "Sending..." : "Send to Parents"}
              </button>
            </div>
          </div>
          {!selectedClass || !selectedTerm ? (
            <p className="text-gray-400 text-sm text-center py-8">Please select a class and term above</p>
          ) : loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : uniqueStudentsWithGrades.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No grades entered yet for this class and term</p>
          ) : (
            <div className="flex flex-col gap-3">
              {uniqueStudentsWithGrades.map((item, i) => (
  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 flex-wrap gap-3">
    <div>
      <p className="font-semibold text-gray-800 text-sm">{item.student?.firstName} {item.student?.lastName}</p>
      <p className="text-xs text-gray-400">{item.count} subjects | Average: {item.avg}%</p>
    </div>
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${item.published ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
        {item.published ? "Published" : "Unpublished"}
      </span>
      <button onClick={() => handlePublish(item.studentId, !item.published)} disabled={publishing === item.studentId}
        className={`text-xs font-bold px-3 py-2 rounded-full transition ${item.published ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-500 text-white hover:bg-green-600"}`}>
        {publishing === item.studentId ? "..." : item.published ? "Unpublish" : "Publish"}
      </button>
      <a href={`/dashboard/report-card?studentId=${item.studentId}&term=${encodeURIComponent(selectedTerm)}`}
        target="_blank"
        className="text-xs font-bold px-3 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 transition">
        View Report Card
      </a>
    </div>
  </div>
))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}