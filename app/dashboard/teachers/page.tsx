"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/teachers")
      .then(res => res.json())
      .then(data => {
        setTeachers(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
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
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Dashboard", href: "/dashboard" },
              { icon: "🎓", label: "Students", href: "/dashboard/students" },
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers", active: true },
              { icon: "📚", label: "Classes", href: "/dashboard/classes" },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                  }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
              <p className="text-gray-400 text-sm mt-1">Manage all teachers in your school</p>
            </div>
            <Link href="/dashboard/teachers/new"
              className="bg-pink-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-pink-600 transition text-sm">
              ➕ Add Teacher
            </Link>
          </div>

          {/* Teachers Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading teachers...</div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">👩‍🏫</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No teachers yet</h3>
                <p className="text-gray-400 text-sm mb-6">Start by adding your first teacher</p>
                <Link href="/dashboard/teachers/new"
                  className="bg-pink-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-pink-600 transition text-sm">
                  ➕ Add First Teacher
                </Link>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Teacher</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Subject</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{teacher.firstName} {teacher.lastName}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{teacher.email}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{teacher.subject}</td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/teachers/${teacher.id}`}
                          className="text-pink-500 text-sm hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}