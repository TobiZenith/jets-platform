"use client"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ParentPortalPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetch("/api/students")
      .then(res => res.json())
      .then(data => {
        setStudents(data)
        if (data.length > 0) {
          fetchStudentData(data[0].id)
        }
        setLoading(false)
      })

    fetch("/api/announcements")
      .then(res => res.json())
      .then(data => setAnnouncements(data))
  }, [])

  const fetchStudentData = async (studentId: string) => {
    const res = await fetch(`/api/parent?studentId=${studentId}`)
    const data = await res.json()
    setSelectedStudent(data)
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600 bg-green-50"
    if (score >= 50) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getStatusColor = (status: string) => {
    if (status === "present") return "text-green-600 bg-green-50"
    if (status === "late") return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const attendanceRate = selectedStudent?.attendance?.length > 0
    ? Math.round((selectedStudent.attendance.filter((a: any) => a.status === "present").length / selectedStudent.attendance.length) * 100)
    : 0

  const averageGrade = selectedStudent?.grades?.length > 0
    ? Math.round(selectedStudent.grades.reduce((sum: number, g: any) => sum + g.score, 0) / selectedStudent.grades.length)
    : 0

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="text-2xl font-extrabold tracking-widest">
          <span className="text-blue-600">J</span>
          <span className="text-pink-500">E</span>
          <span className="text-yellow-400">T</span>
          <span className="text-green-500">S</span>
          <span className="text-gray-400 text-sm font-normal ml-2">Parent Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">👋 {session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition">
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Student Selector */}
        {students.length > 1 && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">Select Child</p>
            <div className="flex gap-3">
              {students.map((student: any) => (
                <button key={student.id}
                  onClick={() => fetchStudentData(student.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition
                    ${selectedStudent?.id === student.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                  {student.firstName} {student.lastName}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedStudent && (
          <>
            {/* Student Header */}
            <div className="bg-gradient-to-r from-blue-600 to-pink-500 rounded-2xl p-6 mb-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                  {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h1>
                  <p className="text-blue-100">Student ID: {selectedStudent.studentId} • Class: {selectedStudent.class?.name || "No class"}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{averageGrade}%</div>
                  <div className="text-blue-100 text-sm">Average Grade</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{attendanceRate}%</div>
                  <div className="text-blue-100 text-sm">Attendance Rate</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold">{selectedStudent.grades?.length || 0}</div>
                  <div className="text-blue-100 text-sm">Total Grades</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm">
              {["overview", "grades", "attendance", "announcements"].map(tab => (
                <button key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition
                    ${activeTab === tab
                      ? "bg-blue-600 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                    }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-bold text-gray-800 mb-4">📊 Recent Grades</h2>
                  {selectedStudent.grades?.length === 0 ? (
                    <p className="text-gray-400 text-sm">No grades yet</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedStudent.grades?.slice(0, 5).map((grade: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{grade.subject}</p>
                            <p className="text-gray-400 text-xs">{grade.term}</p>
                          </div>
                          <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreColor(grade.score)}`}>
                            {grade.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h2 className="font-bold text-gray-800 mb-4">📅 Recent Attendance</h2>
                  {selectedStudent.attendance?.length === 0 ? (
                    <p className="text-gray-400 text-sm">No attendance records yet</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {selectedStudent.attendance?.slice(0, 5).map((record: any, i: number) => (
                        <div key={i} className="flex items-center justify-between">
                          <p className="text-gray-600 text-sm">{new Date(record.date).toLocaleDateString()}</p>
                          <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grades Tab */}
            {activeTab === "grades" && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {selectedStudent.grades?.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📊</div>
                    <p className="text-gray-400">No grades recorded yet</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Subject</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Score</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.grades?.map((grade: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-6 py-4 font-medium text-gray-800">{grade.subject}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${getScoreColor(grade.score)}`}>
                              {grade.score}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-sm">{grade.term}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {selectedStudent.attendance?.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-4">📅</div>
                    <p className="text-gray-400">No attendance records yet</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Date</th>
                        <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudent.attendance?.map((record: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-gray-600">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === "announcements" && (
              <div className="flex flex-col gap-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                    <div className="text-5xl mb-4">📢</div>
                    <p className="text-gray-400">No announcements yet</p>
                  </div>
                ) : (
                  announcements.map((announcement: any, i: number) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-800">{announcement.title}</h3>
                        <span className="text-xs text-gray-400">{new Date(announcement.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-500 text-sm">{announcement.content}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {students.length === 0 && !loading && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">👨‍👩‍👧</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No students found</h3>
            <p className="text-gray-400 text-sm">Please contact your school admin</p>
          </div>
        )}
      </div>
    </main>
  )
}