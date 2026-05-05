"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

function ReportCardContent() {
  const searchParams = useSearchParams()
  const studentId = searchParams.get("studentId")
  const term = searchParams.get("term")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!studentId || !term) { setError("Missing student or term"); setLoading(false); return }
    fetch(`/api/grades/report-card?studentId=${studentId}&term=${encodeURIComponent(term)}`)
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error); } else { setData(d) } setLoading(false) })
      .catch(() => { setError("Something went wrong"); setLoading(false) })
  }, [studentId, term])

  const handlePrint = () => window.print()

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading report card...</p></div>
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>
  if (!data) return null

  const { student, grades, settings, totalStudents, avg } = data

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <Link href="/dashboard/grades" className="text-sm text-gray-500 hover:text-blue-600">Back to Grades</Link>
          <button onClick={handlePrint}
            className="bg-yellow-500 text-white font-bold px-6 py-2.5 rounded-full hover:bg-yellow-600 transition text-sm">
            Print / Save PDF
          </button>
        </div>

        {/* Report Card */}
        <div id="report-card" className="bg-white rounded-2xl shadow-sm p-8 print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="text-center border-b-2 border-yellow-500 pb-6 mb-6">
            <img src="/images/logo.jpeg" alt="School Logo" className="h-16 w-auto mx-auto mb-3" />
            <h1 className="text-2xl font-extrabold text-gray-900">{student.schoolName}</h1>
            <p className="text-gray-500 text-sm">{student.schoolAddress}</p>
            <div className="mt-3 inline-block bg-yellow-50 border border-yellow-200 rounded-full px-6 py-1.5">
              <p className="text-yellow-700 font-bold text-sm">Student Report Card — {data.term}</p>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Student Name</p>
              <p className="font-bold text-gray-800">{student.firstName} {student.lastName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Student ID</p>
              <p className="font-bold text-gray-800">{student.studentId}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Class</p>
              <p className="font-bold text-gray-800">{student.className}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Term</p>
              <p className="font-bold text-gray-800">{data.term}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Average</p>
              <p className="font-bold text-gray-800">{avg}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">No. of Students</p>
              <p className="font-bold text-gray-800">{totalStudents}</p>
            </div>
          </div>

          {/* Grades Table */}
          <table className="w-full mb-6">
            <thead>
              <tr className="bg-yellow-500 text-white">
                <th className="text-left px-4 py-3 text-sm font-bold rounded-tl-xl">Subject</th>
                <th className="text-center px-4 py-3 text-sm font-bold">CA ({settings.caWeight}%)</th>
                <th className="text-center px-4 py-3 text-sm font-bold">Exam ({settings.examWeight}%)</th>
                <th className="text-center px-4 py-3 text-sm font-bold">Total</th>
                <th className="text-center px-4 py-3 text-sm font-bold">Grade</th>
                <th className="text-left px-4 py-3 text-sm font-bold rounded-tr-xl">Remark</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g: any, i: number) => {
                const color = g.score >= 70 ? "text-green-600" : g.score >= 50 ? "text-yellow-600" : "text-red-600"
                return (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{g.subject}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{g.caScore ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-600">{g.examScore ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-gray-800">{g.score?.toFixed(1) ?? "-"}</td>
                    <td className={`px-4 py-3 text-sm text-center font-extrabold ${color}`}>{g.gradeLetter ?? "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{g.remark ?? "-"}</td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr className="bg-yellow-50 border-t-2 border-yellow-200">
                <td className="px-4 py-3 text-sm font-bold text-gray-800" colSpan={3}>Overall Average</td>
                <td className="px-4 py-3 text-sm font-extrabold text-yellow-600 text-center">{avg}%</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>

          {/* Grade Key */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Grade Key</p>
            <div className="flex flex-wrap gap-3">
              {settings.boundaries?.map((b: any, i: number) => (
                <span key={i} className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700">
                  <strong>{b.grade}</strong>: {b.min}-{b.max}% ({b.remark})
                </span>
              ))}
            </div>
          </div>

          {/* Signature */}
          <div className="grid grid-cols-2 gap-8 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="border-b border-gray-300 mb-2 h-10"></div>
              <p className="text-xs text-gray-400">Class Teacher's Signature</p>
            </div>
            <div className="text-center">
              <div className="border-b border-gray-300 mb-2 h-10"></div>
              <p className="text-xs text-gray-400">Principal's Signature</p>
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-gray-300">
            Generated by JETS School Management Platform
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ReportCardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>}>
      <ReportCardContent />
    </Suspense>
  )
}