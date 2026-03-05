"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => {
        setClasses(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
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
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
              { icon: "📚", label: "Classes", href: "/dashboard/classes", active: true },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active
                    ? "bg-yellow-50 text-yellow-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-yellow-600"
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
              <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
              <p className="text-gray-400 text-sm mt-1">Manage all classes in your school</p>
            </div>
            <Link href="/dashboard/classes/new"
              className="bg-yellow-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-yellow-600 transition text-sm">
              ➕ Add Class
            </Link>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center text-gray-400 py-12">Loading classes...</div>
            ) : classes.length === 0 ? (
              <div className="col-span-3 text-center py-16 bg-white rounded-2xl shadow-sm">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No classes yet</h3>
                <p className="text-gray-400 text-sm mb-6">Start by adding your first class</p>
                <Link href="/dashboard/classes/new"
                  className="bg-yellow-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-yellow-600 transition text-sm">
                  ➕ Add First Class
                </Link>
              </div>
            ) : (
              classes.map((cls: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
                  <div className="text-3xl mb-3">📚</div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{cls.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 capitalize">{cls.level} School</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{cls._count?.students || 0} students</span>
                    <Link href={`/dashboard/classes/${cls.id}`}
                      className="text-yellow-600 text-sm hover:underline font-medium">
                      View →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}