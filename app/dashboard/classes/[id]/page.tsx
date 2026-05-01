"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function ClassProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [cls, setCls] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [teachers, setTeachers] = useState<any[]>([])
  const [assignForm, setAssignForm] = useState({ teacherId: "", teacherPassword: "" })
  const [assigning, setAssigning] = useState(false)
  const [assignMsg, setAssignMsg] = useState("")
  const [subjects, setSubjects] = useState<any[]>([])
  const [newSubject, setNewSubject] = useState("")
  const [addingSubject, setAddingSubject] = useState(false)
  const [subjectMsg, setSubjectMsg] = useState("")

  useEffect(() => {
    fetch(`/api/classes/${id}`).then(res => res.json()).then(data => { setCls(data); setLoading(false) }).catch(() => setLoading(false))
    fetch("/api/teachers").then(res => res.json()).then(data => setTeachers(Array.isArray(data) ? data : []))
    fetch(`/api/subjects?classId=${id}`).then(res => res.json()).then(data => setSubjects(Array.isArray(data) ? data : []))
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this class?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" })
      if (res.ok) router.push("/dashboard/classes")
    } catch { setDeleting(false) }
  }

  const handleAssignTeacher = async () => {
    setAssignMsg("")
    if (!assignForm.teacherId) { setAssignMsg("Please select a teacher"); return }
    setAssigning(true)
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cls.name, level: cls.level, teacherId: assignForm.teacherId, teacherPassword: assignForm.teacherPassword })
      })
      const data = await res.json()
      if (res.ok) {
        setAssignMsg("Teacher assigned successfully!")
        fetch(`/api/classes/${id}`).then(r => r.json()).then(d => setCls(d))
      } else {
        setAssignMsg(data.error || "Something went wrong")
      }
    } catch { setAssignMsg("Something went wrong") }
    finally { setAssigning(false) }
  }

  const handleAddSubject = async () => {
    if (!newSubject.trim()) return
    setAddingSubject(true)
    setSubjectMsg("")
    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSubject.trim(), classId: id })
      })
      const data = await res.json()
      if (res.ok) {
        setSubjects(prev => [...prev, data])
        setNewSubject("")
        setSubjectMsg("Subject added!")
        setTimeout(() => setSubjectMsg(""), 2000)
      } else {
        setSubjectMsg(data.error || "Something went wrong")
      }
    } catch { setSubjectMsg("Something went wrong") }
    finally { setAddingSubject(false) }
  }

  const handleDeleteSubject = async (subjectId: string) => {
    try {
      await fetch(`/api/subjects?id=${subjectId}`, { method: "DELETE" })
      setSubjects(prev => prev.filter(s => s.id !== subjectId))
    } catch {}
  }

  if (loading) return <div className="p-8 text-gray-400">Loading...</div>
  if (!cls) return <div className="p-8 text-gray-400">Class not found</div>

  return (
    <div className="p-4 md:p-8">
      <Link href="/dashboard/classes" className="text-sm text-gray-500 hover:text-blue-600 mb-6 inline-block">Back to Classes</Link>

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl">📚</div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{cls.name}</h1>
              <p className="text-gray-400 text-sm capitalize">Level: {cls.level}</p>
              <p className="text-gray-400 text-sm">Students: {cls.students?.length || 0}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/classes/${id}/edit`} className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-yellow-600 transition text-sm">Edit</Link>
            <button onClick={handleDelete} disabled={deleting} className="bg-red-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition text-sm disabled:opacity-50">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">👩‍🏫 Class Teacher</h2>
          {cls.teacher ? (
            <div className="bg-green-50 rounded-xl p-4 mb-4">
              <p className="font-semibold text-gray-800">{cls.teacher.firstName} {cls.teacher.lastName}</p>
              <p className="text-gray-500 text-sm">{cls.teacher.email}</p>
              <p className="text-gray-500 text-sm">{cls.teacher.subject}</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full mt-2 inline-block">{cls.teacher.password ? "Can Login" : "No Password Set"}</span>
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-4">No teacher assigned yet</p>
          )}
          {assignMsg && <p className="text-sm text-blue-600 mb-3">{assignMsg}</p>}
          <select value={assignForm.teacherId} onChange={e => setAssignForm({ ...assignForm, teacherId: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 mb-3 focus:outline-none focus:border-yellow-400">
            <option value="">Select a teacher</option>
            {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} - {t.subject}</option>)}
          </select>
          <input value={assignForm.teacherPassword} onChange={e => setAssignForm({ ...assignForm, teacherPassword: e.target.value })}
            type="password" placeholder="Set teacher login password"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 mb-3 focus:outline-none focus:border-yellow-400" />
          <button onClick={handleAssignTeacher} disabled={assigning}
            className="w-full bg-yellow-500 text-white font-bold py-3 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50 text-sm">
            {assigning ? "Assigning..." : "Assign Teacher"}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📖 Class Subjects</h2>
          {subjectMsg && <p className="text-sm text-green-600 mb-3">{subjectMsg}</p>}
          <div className="flex gap-2 mb-4">
            <input value={newSubject} onChange={e => setNewSubject(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAddSubject()}
              placeholder="e.g. Mathematics" type="text"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-yellow-400" />
            <button onClick={handleAddSubject} disabled={addingSubject}
              className="bg-yellow-500 text-white font-bold px-4 py-3 rounded-xl hover:bg-yellow-600 transition text-sm disabled:opacity-50">
              {addingSubject ? "..." : "Add"}
            </button>
          </div>
          {subjects.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No subjects added yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {subjects.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2">
                  <span className="text-sm font-medium text-gray-800">{s.name}</span>
                  <button onClick={() => handleDeleteSubject(s.id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🎓 Students in this Class</h2>
        {cls.students?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No students in this class yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {cls.students?.map((student: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <p className="font-medium text-gray-800 text-sm">{student.firstName} {student.lastName}</p>
                <Link href={`/dashboard/students/${student.id}`} className="text-blue-600 text-sm hover:underline">View</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}