"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [student, setStudent] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/students/${id}`)
      .then(res => res.json())
      .then(data => {
        setStudent(data.student)
        setGrades(data.grades)
        setAttendance(data.attendance)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this student?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/dashboard/students")
      }
    } catch {
      setDeleting(false)
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </main>
  )

  if (!student) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Student not found</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
        <Link href="/dashboard/students" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Students
        </Link>
      </nav>

      <div className="flex">
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Dashboard", href: "/dashboard" },
              { icon: "🎓", label: "Students", href: "/dashboard/students", active: true },
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
              { icon: "📚", label: "Classes", href: "/dashboard/classes" },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 p-8">

          {/* Student Header */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
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
              <div className="flex gap-3">
                <Link href={`/dashboard/students/${id}/edit`}
                  className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition text-sm">
                  ✏️ Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition text-sm disabled:opacity-50">
                  {deleting ? "Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                  {attendance.slice(0, 10).map((record: any, i: number) => (
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
        </div>
      </div>
    </main>
  )
}