"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    announcements: 0
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Top Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">
            👋 Welcome, <strong>{session?.user?.name}</strong>
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50 transition">
            Log Out
          </button>
        </div>
      </nav>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Dashboard", href: "/dashboard", active: true },
              { icon: "🎓", label: "Students", href: "/dashboard/students" },
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
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

          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome to your school management panel</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { icon: "🎓", label: "Total Students", value: stats.students, color: "bg-blue-50 border-blue-200" },
              { icon: "👩‍🏫", label: "Total Teachers", value: stats.teachers, color: "bg-pink-50 border-pink-200" },
              { icon: "📚", label: "Total Classes", value: stats.classes, color: "bg-yellow-50 border-yellow-200" },
              { icon: "📢", label: "Announcements", value: stats.announcements, color: "bg-green-50 border-green-200" },
            ].map((stat, i) => (
              <div key={i} className={`${stat.color} border rounded-2xl p-6`}>
                <div className="text-3xl mb-3">{stat.icon}</div>
                <div className="text-2xl font-extrabold text-gray-800">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "➕", label: "Add Student", href: "/dashboard/students/new", color: "bg-blue-600" },
                { icon: "➕", label: "Add Teacher", href: "/dashboard/teachers/new", color: "bg-pink-500" },
                { icon: "➕", label: "Add Class", href: "/dashboard/classes/new", color: "bg-yellow-500" },
                { icon: "📢", label: "New Announcement", href: "/dashboard/announcements", color: "bg-green-500" },
              ].map((action, i) => (
                <a key={i} href={action.href}
                  className={`${action.color} text-white rounded-2xl p-4 text-center hover:opacity-90 transition`}>
                  <div className="text-2xl mb-2">{action.icon}</div>
                  <div className="text-sm font-semibold">{action.label}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div className="text-gray-400 text-sm text-center py-8">
              No activity yet — start by adding students and teachers! 🎉
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}