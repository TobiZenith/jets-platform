"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function ClassProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [cls, setCls] = useState<any>(null)
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState("")
  const [assignSuccess, setAssignSuccess] = useState("")
  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [teacherPassword, setTeacherPassword] = useState("")
  const [showAssignForm, setShowAssignForm] = useState(false)

  useEffect(() => {
    fetch(`/api/classes/${id}`)
      .then(res => res.json())
      .then(data => {
        setCls(data)
        setSelectedTeacher(data.teacherId || "")
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch("/api/teachers")
      .then(res => res.json())
      .then(data => setTeachers(data))
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this class?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" })
      if (res.ok) router.push("/dashboard/classes")
    } catch {
      setDeleting(false)
    }
  }

  const handleAssignTeacher = async () => {
    setAssignError("")
    setAssignSuccess("")
    if (!selectedTeacher) {
      setAssignError("Please select a teacher")
      return
    }
    if (!teacherPassword || teacherPassword.length < 6) {
      setAssignError("Please set a password of at least 6 characters for the teacher")
      return
    }
    setAssigning(true)
    try {
      const res = await fetch(`/api/classes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cls.name,
          level: cls.level,
          teacherId: selectedTeacher,
          teacherPassword
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setAssignError(data.error || "Something went wrong")
      } else {
        const teacher = teachers.find(t => t.id === selectedTeacher)
        setCls({ ...cls, teacher, teacherId: selectedTeacher })
        setAssignSuccess(`✅ ${teacher?.firstName} ${teacher?.lastName} assigned successfully! They can now login with their email and the password you set.`)
        setTeacherPassword("")
        setShowAssignForm(false)
      }
    } catch {
      setAssignError("Something went wrong")
    } finally {
      setAssigning(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-gray-400">Loading...</div>
    </div>
  )

  if (!cls) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-gray-400">Class not found</div>
    </div>
  )

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Link href="/dashboard/classes" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Classes
        </Link>
      </div>

      {/* Class Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl">📚</div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{cls.name}</h1>
              <p className="text-gray-400 text-sm capitalize">Level: {cls.level}</p>
              <p className="text-gray-400 text-sm">Students: {cls.students?.length || 0}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/classes/${id}/edit`}
              className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-yellow-600 transition text-sm">
              ✏️ Edit
            </Link>
            <button onClick={handleDelete} disabled={deleting}
              className="bg-red-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition text-sm disabled:opacity-50">
              {deleting ? "Deleting..." : "🗑️ Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* Assign Teacher Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">👩‍🏫 Class Teacher</h2>
          <button onClick={() => { setShowAssignForm(!showAssignForm); setAssignError(""); setAssignSuccess("") }}
            className="text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition font-medium">
            {showAssignForm ? "✕ Cancel" : cls.teacher ? "🔄 Change Teacher" : "➕ Assign Teacher"}
          </button>
        </div>

        {assignSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-4">{assignSuccess}</div>
        )}

        {cls.teacher && !showAssignForm && (
          <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
              {cls.teacher.firstName[0]}{cls.teacher.lastName[0]}
            </div>
            <div>
              <p className="font-bold text-gray-800">{cls.teacher.firstName} {cls.teacher.lastName}</p>
              <p className="text-gray-400 text-sm">{cls.teacher.email}</p>
              <p className="text-gray-400 text-sm">{cls.teacher.subject}</p>
            </div>
            <div className="ml-auto">
              <span className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full font-medium">✅ Can Login</span>
            </div>
          </div>
        )}

        {!cls.teacher && !showAssignForm && (
          <div className="text-center py-6 bg-gray-50 rounded-xl">
            <p className="text-gray-400 text-sm">No class teacher assigned yet</p>
          </div>
        )}

        {showAssignForm && (
          <div className="flex flex-col gap-4">
            {assignError && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{assignError}</div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Select Teacher</label>
              <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition">
                <option value="">Choose a teacher...</option>
                {teachers.map((t: any) => (
                  <option key={t.id} value={t.id}>{t.firstName} {t.lastName} — {t.subject}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Set Login Password for Teacher</label>
              <input type="password" value={teacherPassword} onChange={e => setTeacherPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition" />
              <p className="text-xs text-gray-400 mt-1">Teacher will use their email + this password to login</p>
            </div>
            <button onClick={handleAssignTeacher} disabled={assigning}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
              {assigning ? "Assigning..." : "Assign Teacher & Set Password 👩‍🏫"}
            </button>
          </div>
        )}
      </div>

      {/* Students in class */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">🎓 Students in this Class</h2>
        {cls.students?.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No students in this class yet</p>
        ) : (
          <div className="flex flex-col gap-2">
            {cls.students?.map((student: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <p className="font-medium text-gray-800 text-sm">{student.firstName} {student.lastName}</p>
                </div>
                <Link href={`/dashboard/students/${student.id}`}
                  className="text-blue-600 text-sm hover:underline">View</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}