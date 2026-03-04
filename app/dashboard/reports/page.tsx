"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

export default function ReportsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/students")
      .then(res => res.json())
      .then(data => setStudents(data))
  }, [])

  const generateReport = async () => {
    setError("")
    if (!selectedStudent || !selectedTerm) {
      setError("Please select a student and term")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/reports?studentId=${selectedStudent}&term=${selectedTerm}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setReport(data)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getGrade = (score: number) => {
    if (score >= 70) return "A"
    if (score >= 60) return "B"
    if (score >= 50) return "C"
    if (score >= 40) return "D"
    return "F"
  }

  const getRemarks = (score: number) => {
    if (score >= 70) return "Excellent"
    if (score >= 60) return "Very Good"
    if (score >= 50) return "Good"
    if (score >= 40) return "Pass"
    return "Fail"
  }

  const averageScore = report?.grades?.length > 0
    ? Math.round(report.grades.reduce((sum: number, g: any) => sum + g.score, 0) / report.grades.length)
    : 0

  const attendanceRate = report?.attendance?.length > 0
    ? Math.round((report.attendance.filter((a: any) => a.status === "present").length / report.attendance.length) * 100)
    : 0

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50 print:hidden">
        <div className="text-2xl font-extrabold tracking-widest">
          <span className="text-blue-600">J</span>
          <span className="text-pink-500">E</span>
          <span className="text-yellow-400">T</span>
          <span className="text-green-500">S</span>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block print:hidden">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Dashboard", href: "/dashboard" },
              { icon: "🎓", label: "Students", href: "/dashboard/students" },
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
              { icon: "📚", label: "Classes", href: "/dashboard/classes" },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "📋", label: "Report Cards", href: "/dashboard/reports", active: true },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-indigo-600"
                  }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="mb-8 print:hidden">
            <h1 className="text-2xl font-bold text-gray-800">Report Cards</h1>
            <p className="text-gray-400 text-sm mt-1">Generate and print student report cards</p>
          </div>

          {/* Selection Form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 print:hidden">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Generate Report Card</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Select Student</label>
                <select onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition">
                  <option value="">Choose student</option>
                  {students.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Select Term</label>
                <select onChange={e => setSelectedTerm(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 transition">
                  <option value="">Choose term</option>
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
              <div className="flex items-end">
                <button onClick={generateReport} disabled={loading}
                  className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? "Generating..." : "Generate Report 📋"}
                </button>
              </div>
            </div>
          </div>

          {/* Report Card */}
          {report && (
            <div ref={printRef}>
              {/* Print Button */}
              <div className="flex justify-end mb-4 print:hidden">
                <button onClick={handlePrint}
                  className="bg-green-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-green-600 transition text-sm">
                  🖨️ Print Report Card
                </button>
              </div>

              {/* Report Card Design */}
              <div className="bg-white rounded-2xl shadow-sm p-8 max-w-3xl mx-auto">

                {/* Header */}
                <div className="text-center border-b border-gray-200 pb-6 mb-6">
                  <div className="text-4xl font-extrabold tracking-widest mb-2">
                    <span className="text-blue-600">J</span>
                    <span className="text-pink-500">E</span>
                    <span className="text-yellow-400">T</span>
                    <span className="text-green-500">S</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Student Report Card</h2>
                  <p className="text-gray-400 text-sm">{selectedTerm} Academic Report</p>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 rounded-xl p-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Student Name</p>
                    <p className="font-bold text-gray-800">{report.firstName} {report.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Student ID</p>
                    <p className="font-bold text-gray-800">{report.studentId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Class</p>
                    <p className="font-bold text-gray-800">{report.class?.name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Term</p>
                    <p className="font-bold text-gray-800">{selectedTerm}</p>
                  </div>
                </div>

                {/* Grades Table */}
                <h3 className="font-bold text-gray-800 mb-3">Academic Performance</h3>
                {report.grades?.length === 0 ? (
                  <p className="text-gray-400 text-sm mb-6">No grades recorded for this term</p>
                ) : (
                  <table className="w-full mb-6">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Subject</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Score</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Grade</th>
                        <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.grades?.map((grade: any, i: number) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="px-4 py-3 text-gray-800">{grade.subject}</td>
                          <td className={`px-4 py-3 font-bold ${getScoreColor(grade.score)}`}>{grade.score}%</td>
                          <td className={`px-4 py-3 font-bold ${getScoreColor(grade.score)}`}>{getGrade(grade.score)}</td>
                          <td className="px-4 py-3 text-gray-500 text-sm">{getRemarks(grade.score)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl p-4 mb-6">
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase mb-1">Average Score</p>
                    <p className={`text-2xl font-extrabold ${getScoreColor(averageScore)}`}>{averageScore}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase mb-1">Overall Grade</p>
                    <p className={`text-2xl font-extrabold ${getScoreColor(averageScore)}`}>{getGrade(averageScore)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-400 uppercase mb-1">Attendance</p>
                    <p className="text-2xl font-extrabold text-blue-600">{attendanceRate}%</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 pt-4 text-center text-xs text-gray-400">
                  Generated by JETS School Management Platform • {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}