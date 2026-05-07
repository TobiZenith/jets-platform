"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ParentDashboardPage() {
  const router = useRouter()
  const [parent, setParent] = useState<any>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [student, setStudent] = useState<any>(null)
  const [grades, setGrades] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTerm, setSelectedTerm] = useState("First Term")
  const [activeTab, setActiveTab] = useState("grades")

  const fetchStudentData = async (studentId: string, token: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/parent/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setStudent(data.student)
      setGrades(data.grades || [])
      setAttendance(data.attendance || [])
      setAnnouncements(data.announcements || [])
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    const parentData = localStorage.getItem("parentData")
    const token = localStorage.getItem("parentToken")
    if (!parentData || !token) { router.push("/parent/login"); return }
    const parsedParent = JSON.parse(parentData)
    setParent(parsedParent)
    if (parsedParent.children && parsedParent.children.length > 0) {
      fetchStudentData(parsedParent.children[0].id, token)
    } else {
      setLoading(false)
    }
  }, [router])

  const handleChildSwitch = (index: number) => {
    const token = localStorage.getItem("parentToken")
    const studentId = parent.children[index].id
    setSelectedIndex(index)
    fetchStudentData(studentId, token!)
  }

  const handleLogout = () => {
    localStorage.removeItem("parentToken")
    localStorage.removeItem("parentData")
    router.push("/parent/login")
  }

  const termGrades = grades.filter(g => g.term === selectedTerm)
  const terms = ["First Term", "Second Term", "Third Term"]
  const avgScore = termGrades.length > 0
    ? (termGrades.reduce((sum, g) => sum + (g.score || 0), 0) / termGrades.length).toFixed(1)
    : "0"

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-10 w-auto" />
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm hidden md:block">Welcome, <strong>{parent?.firstName}</strong></span>
          <button onClick={handleLogout}
            className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition">
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-8">

        {parent?.children?.length > 1 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {parent.children.map((child: any, index: number) => (
              <button key={index} onClick={() => handleChildSwitch(index)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  selectedIndex === index ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-400"
                }`}>
                {child.firstName} {child.lastName}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        ) : (
          <>
            {student && (
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
                    {student.firstName?.[0]}{student.lastName?.[0]}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">{student.firstName} {student.lastName}</h1>
                    <p className="text-gray-400 text-sm">Student ID: {student.studentId}</p>
                    <p className="text-gray-400 text-sm">Class: {student.className || student.class?.name || "No class assigned"}</p>
                    <p className="text-gray-400 text-sm">School: {student.schoolName || ""}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold text-blue-600">{grades.length}</div>
                <div className="text-gray-500 text-xs mt-1">Total Grades</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold text-green-600">
                  {attendance.filter(a => a.status === "present").length}
                </div>
                <div className="text-gray-500 text-xs mt-1">Days Present</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold text-red-500">
                  {attendance.filter(a => a.status === "absent").length}
                </div>
                <div className="text-gray-500 text-xs mt-1">Days Absent</div>
              </div>
            </div>

            <div className="flex gap-2 mb-6 bg-white rounded-2xl shadow-sm p-2">
              {["grades", "attendance", "announcements"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-bold capitalize transition ${activeTab === tab ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                  {tab === "grades" ? "Grades" : tab === "attendance" ? "Attendance" : "Announcements"}
                </button>
              ))}
            </div>

            {activeTab === "grades" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-lg font-bold text-gray-800">📊 Grades</h2>
                  <div className="flex gap-2 flex-wrap">
                    {terms.map(term => (
                      <button key={term} onClick={() => setSelectedTerm(term)}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${selectedTerm === term ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {termGrades.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No grades published for {selectedTerm} yet</p>
                ) : (
                  <>
                    <div className="bg-blue-50 rounded-xl p-3 mb-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">{selectedTerm} Average</span>
                      <span className="text-lg font-extrabold text-blue-600">{avgScore}%</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px]">
                        <thead>
                          <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
                            <th className="pb-3 font-semibold">Subject</th>
                            <th className="pb-3 font-semibold">CA</th>
                            <th className="pb-3 font-semibold">Exam</th>
                            <th className="pb-3 font-semibold">Total</th>
                            <th className="pb-3 font-semibold">Grade</th>
                            <th className="pb-3 font-semibold">Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {termGrades.map((grade: any, i: number) => {
                            const color = grade.score >= 70 ? "text-green-600" : grade.score >= 50 ? "text-yellow-600" : "text-red-600"
                            return (
                              <tr key={i} className="border-b border-gray-50">
                                <td className="py-3 text-sm font-medium text-gray-800">{grade.subject}</td>
                                <td className="py-3 text-sm text-gray-600">{grade.caScore ?? "-"}</td>
                                <td className="py-3 text-sm text-gray-600">{grade.examScore ?? "-"}</td>
                                <td className="py-3 text-sm font-bold text-gray-800">{grade.score?.toFixed(1) ?? "-"}</td>
                                <td className={`py-3 text-sm font-extrabold ${color}`}>{grade.gradeLetter ?? "-"}</td>
                                <td className="py-3 text-sm text-gray-500">{grade.remark ?? "-"}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "attendance" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📅 Attendance</h2>
                {attendance.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No attendance recorded yet</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {attendance.map((record: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                        <p className="text-gray-600 text-sm">{new Date(record.date).toLocaleDateString()}</p>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                          record.status === "present" ? "bg-green-50 text-green-600" :
                          record.status === "late" ? "bg-yellow-50 text-yellow-600" :
                          "bg-red-50 text-red-600"}`}>
                          {record.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "announcements" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">📢 Announcements</h2>
                {announcements.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">No announcements yet</p>
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
            )}
          </>
        )}
      </div>
    </main>
  )
}