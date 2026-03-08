"use client"
import { useState, useEffect } from "react"

export default function ReportsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedTerm, setSelectedTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/students")
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => {})
  }, [])

  const fetchReport = async () => {
    if (!selectedStudent || !selectedTerm) {
      setError("Please select a student and term")
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch(`/api/reports?studentId=${selectedStudent}&term=${selectedTerm}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setReportData(data)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const generatePDF = async () => {
    if (!reportData) return
    setGenerating(true)
    try {
      const { default: jsPDF } = await import("jspdf")
      const { default: autoTable } = await import("jspdf-autotable")
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, pageWidth, 40, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(20)
      doc.setFont("helvetica", "bold")
      doc.text(reportData.student.school, pageWidth / 2, 18, { align: "center" })
      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("STUDENT REPORT CARD", pageWidth / 2, 30, { align: "center" })

      doc.setFillColor(243, 244, 246)
      doc.rect(14, 48, pageWidth - 28, 36, "F")
      doc.setTextColor(31, 41, 55)
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text("Student Information", 20, 58)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      doc.text(`Name: ${reportData.student.name}`, 20, 67)
      doc.text(`Student ID: ${reportData.student.studentId}`, 20, 74)
      doc.text(`Class: ${reportData.student.class}`, 110, 67)
      doc.text(`Term: ${reportData.term}`, 110, 74)
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 110, 81)

      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(31, 41, 55)
      doc.text("Academic Performance", 14, 96)

      const gradeRows = reportData.grades.map((g: any) => {
        const grade = g.score >= 70 ? "A" : g.score >= 60 ? "B" : g.score >= 50 ? "C" : g.score >= 40 ? "D" : "F"
        const remark = g.score >= 70 ? "Excellent" : g.score >= 60 ? "Very Good" : g.score >= 50 ? "Good" : g.score >= 40 ? "Pass" : "Fail"
        return [g.subject, `${g.score}%`, grade, remark]
      })

      autoTable(doc, {
        startY: 100,
        head: [["Subject", "Score", "Grade", "Remark"]],
        body: gradeRows.length > 0 ? gradeRows : [["No grades recorded", "", "", ""]],
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [243, 244, 246] },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 80 }, 1: { cellWidth: 30, halign: "center" },
          2: { cellWidth: 30, halign: "center" }, 3: { cellWidth: 40, halign: "center" }
        }
      })

      const finalY = (doc as any).lastAutoTable.finalY + 10
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(31, 41, 55)
      doc.text("Attendance Summary", 14, finalY + 6)

      autoTable(doc, {
        startY: finalY + 10,
        head: [["Total Days", "Present", "Absent", "Attendance %"]],
        body: [[reportData.attendance.total, reportData.attendance.present, reportData.attendance.absent, `${reportData.attendance.percentage}%`]],
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 4, halign: "center" }
      })

      const finalY2 = (doc as any).lastAutoTable.finalY + 10
      doc.setFillColor(
        reportData.overallRemark === "Excellent" ? 16 : reportData.overallRemark === "Good" ? 245 : 239,
        reportData.overallRemark === "Excellent" ? 185 : reportData.overallRemark === "Good" ? 158 : 68,
        reportData.overallRemark === "Excellent" ? 129 : reportData.overallRemark === "Good" ? 11 : 68
      )
      doc.rect(14, finalY2, pageWidth - 28, 20, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(`Overall Result: ${reportData.overallRemark}   |   Average Score: ${reportData.averageScore}%`, pageWidth / 2, finalY2 + 13, { align: "center" })
      doc.setTextColor(156, 163, 175)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("Generated by JETS School Management System", pageWidth / 2, 285, { align: "center" })
      doc.save(`${reportData.student.name}_${reportData.term}_Report.pdf`)
    } catch (err) {
      console.error(err)
      setError("Failed to generate PDF")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Report Cards</h1>
        <p className="text-gray-400 text-sm mt-1">Generate PDF report cards for students</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Select Student & Term</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Student</label>
            <select value={selectedStudent} onChange={e => { setSelectedStudent(e.target.value); setReportData(null) }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition">
              <option value="">Select student...</option>
              {students.map((s: any) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Term</label>
            <select value={selectedTerm} onChange={e => { setSelectedTerm(e.target.value); setReportData(null) }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition">
              <option value="">Select term...</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={fetchReport} disabled={loading}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition disabled:opacity-50">
              {loading ? "Loading..." : "Preview Report 👁️"}
            </button>
          </div>
        </div>
      </div>

      {reportData && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Report Preview</h2>
            <button onClick={generatePDF} disabled={generating}
              className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
              {generating ? "Generating..." : "⬇️ Download PDF"}
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><p className="text-xs text-gray-400">Student Name</p><p className="font-bold text-gray-800">{reportData.student.name}</p></div>
            <div><p className="text-xs text-gray-400">Student ID</p><p className="font-bold text-gray-800">{reportData.student.studentId}</p></div>
            <div><p className="text-xs text-gray-400">Class</p><p className="font-bold text-gray-800">{reportData.student.class}</p></div>
            <div><p className="text-xs text-gray-400">Term</p><p className="font-bold text-gray-800">{reportData.term}</p></div>
          </div>

          <h3 className="font-bold text-gray-800 mb-3">📊 Academic Performance</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 mb-6">
            <table className="w-full min-w-[400px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Subject</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase">Score</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase">Grade</th>
                  <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase hidden md:table-cell">Remark</th>
                </tr>
              </thead>
              <tbody>
                {reportData.grades.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-gray-400">No grades recorded for this term</td></tr>
                ) : reportData.grades.map((g: any, i: number) => {
                  const grade = g.score >= 70 ? "A" : g.score >= 60 ? "B" : g.score >= 50 ? "C" : g.score >= 40 ? "D" : "F"
                  const remark = g.score >= 70 ? "Excellent" : g.score >= 60 ? "Very Good" : g.score >= 50 ? "Good" : g.score >= 40 ? "Pass" : "Fail"
                  return (
                    <tr key={i} className="border-t border-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{g.subject}</td>
                      <td className="px-4 py-3 text-sm text-center font-bold text-gray-800">{g.score}%</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full
                          ${grade === "A" ? "bg-green-50 text-green-600" : grade === "B" ? "bg-blue-50 text-blue-600" : grade === "C" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"}`}>
                          {grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-500 hidden md:table-cell">{remark}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <h3 className="font-bold text-gray-800 mb-3">📅 Attendance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Days", value: reportData.attendance.total, color: "bg-gray-50" },
              { label: "Present", value: reportData.attendance.present, color: "bg-green-50" },
              { label: "Absent", value: reportData.attendance.absent, color: "bg-red-50" },
              { label: "Attendance %", value: `${reportData.attendance.percentage}%`, color: "bg-blue-50" },
            ].map((item, i) => (
              <div key={i} className={`${item.color} rounded-xl p-4 text-center`}>
                <p className="text-2xl font-extrabold text-gray-800">{item.value}</p>
                <p className="text-xs text-gray-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          <div className={`rounded-xl p-4 text-center ${reportData.overallRemark === "Excellent" ? "bg-green-50" : reportData.overallRemark === "Good" ? "bg-blue-50" : "bg-red-50"}`}>
            <p className="text-sm text-gray-500">Overall Result</p>
            <p className={`text-2xl font-extrabold ${reportData.overallRemark === "Excellent" ? "text-green-600" : reportData.overallRemark === "Good" ? "text-blue-600" : "text-red-500"}`}>
              {reportData.overallRemark}
            </p>
            <p className="text-sm text-gray-500 mt-1">Average Score: {reportData.averageScore}%</p>
          </div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Generate a Report Card</h3>
          <p className="text-gray-400 text-sm">Select a student and term above then click Preview Report</p>
        </div>
      )}
    </div>
  )
}