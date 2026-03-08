"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/students")
      .then(res => res.json())
      .then(data => {
        setStudents(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all students in your school</p>
        </div>
        <Link href="/dashboard/students/new"
          className="bg-blue-600 text-white font-semibold px-4 md:px-6 py-2.5 rounded-full hover:bg-blue-700 transition text-sm">
          ➕ Add Student
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No students yet</h3>
            <p className="text-gray-400 text-sm mb-6">Start by adding your first student</p>
            <Link href="/dashboard/students/new"
              className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-blue-700 transition text-sm">
              ➕ Add First Student
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student ID</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase hidden md:table-cell">Class</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                          {student.photo ? (
                            <img src={student.photo} alt={student.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{student.firstName[0]}{student.lastName[0]}</span>
                          )}
                        </div>
                        <div className="font-medium text-gray-800">{student.firstName} {student.lastName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{student.studentId}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm hidden md:table-cell">{student.class?.name || "No class"}</td>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/students/${student.id}`}
                        className="text-blue-600 text-sm hover:underline font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}