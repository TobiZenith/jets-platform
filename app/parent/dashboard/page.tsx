"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ParentDashboardPage() {
  const router = useRouter()
  const [parent, setParent] = useState<any>(null)
  const [student, setStudent] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const parentData = localStorage.getItem("parentData")
    const token = localStorage.getItem("parentToken")

    if (!parentData || !token) {
      router.push("/parent/login")
      return
    }

    const parsedParent = JSON.parse(parentData)
    setParent(parsedParent)

    if (parsedParent.children && parsedParent.children.length > 0) {
      const studentId = parsedParent.children[0].student.id
      fetch(`/api/parent/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setStudent(data.student)
          setGrades(data.grades)
          setAttendance(data.attendance)
          setAnnouncements(data.announcements)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("parentToken")
    localStorage.removeItem("parentData")
    router.push("/parent/login")
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            👋 Welcome, <strong>{parent?.firstName}</strong>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition">
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-8">

        {/* Student Info */}
        {student && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                {student.firstName[0]}{student.lastName[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{student.firstName} {student.lastName}</h1>
                <p className="text-gray-400 text-sm">Student ID: {student.studentId}</p>
                <p className="text-gray-400 text-sm">Class: {student.class?.name || "No class assigned"}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-blue-600">{grades.length}</div>
            <div className="text-gray-500 text-sm mt-1">Grades Recorded</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-green-600">
              {attendance.filter(a => a.status === "present").length}
            </div>
            <div className="text-gray-500 text-sm mt-1">Days Present</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-red-500">
              {attendance.filter(a => a.status === "absent").length}
            </div>
            <div className="text-gray-500 text-sm mt-1">Days Absent</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Grades */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📊 Grades</h2>
            {grades.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No grades recorded yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {grades.map((grade: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{grade.subject}</p>
                      <p className="text-gray-400 text-xs">{grade.term}</p>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full
                      ${grade.score >= 70 ? "bg-green-50 text-green-600" :
                        grade.score >= 50 ? "bg-yellow-50 text-yellow-600" :
                        "bg-red-50 text-red-600"}`}>
                      {grade.score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Attendance */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Attendance</h2>
            {attendance.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No attendance recorded yet</p>
            ) : (
              <div className="flex flex-col gap-3">
                {attendance.slice(0, 8).map((record: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <p className="text-gray-600 text-sm">{new Date(record.date).toLocaleDateString()}</p>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize
                      ${record.status === "present" ? "bg-green-50 text-green-600" :
                        record.status === "late" ? "bg-yellow-50 text-yellow-600" :
                        "bg-red-50 text-red-600"}`}>
                      {record.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Announcements */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📢 School Announcements</h2>
          {announcements.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">No announcements yet</p>
          ) : (
            <div className="flex flex-col gap-4">
              {announcements.map((ann: any, i: number) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 text-sm">{ann.title}</h3>
                  <p className="text-gray-500 text-sm mt-1">{ann.content}</p>
                  <p className="text-gray-300 text-xs mt-2">{new Date(ann.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}