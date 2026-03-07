"use client"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, announcements: 0 })
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const navItems = [
    { icon: "🏠", label: "Dashboard", href: "/dashboard", active: true },
    { icon: "🎓", label: "Students", href: "/dashboard/students" },
    { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
    { icon: "📚", label: "Classes", href: "/dashboard/classes" },
    { icon: "📊", label: "Grades", href: "/dashboard/grades" },
    { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
    { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
    { icon: "💰", label: "Fees", href: "/dashboard/fees" },
    { icon: "🗓️", label: "Timetable", href: "/dashboard/timetable" },
    { icon: "📄", label: "Reports", href: "/dashboard/reports" },
    { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
  ]

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-10 md:h-14 w-auto" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">👤 {session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm bg-red-50 text-red-500 px-4 py-2 rounded-full hover:bg-red-100 transition hidden md:block">
            Sign Out
          </button>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600 text-2xl">
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl px-4 py-8 z-50 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <img src="/images/logo.jpeg" alt="JETS" className="h-10 w-auto" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
            <nav className="flex flex-col gap-1">
              {navItems.map((item, i) => (
                <a key={i} href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition
                    ${item.active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}>
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 px-2 mb-3">👤 {session?.user?.name}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full text-sm bg-red-50 text-red-500 px-4 py-3 rounded-xl hover:bg-red-100 transition text-left">
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex">

        {/* Desktop Sidebar */}
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-sm bg-red-50 text-red-500 px-4 py-2.5 rounded-xl hover:bg-red-100 transition text-left">
              🚪 Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">
              Welcome back, {session?.user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-400 text-sm mt-1">Here's what's happening in your school</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {[
              { label: "Students", value: stats.students, icon: "🎓", color: "bg-blue-50", textColor: "text-blue-600", href: "/dashboard/students" },
              { label: "Teachers", value: stats.teachers, icon: "👩‍🏫", color: "bg-green-50", textColor: "text-green-600", href: "/dashboard/teachers" },
              { label: "Classes", value: stats.classes, icon: "📚", color: "bg-yellow-50", textColor: "text-yellow-600", href: "/dashboard/classes" },
              { label: "Announcements", value: stats.announcements, icon: "📢", color: "bg-purple-50", textColor: "text-purple-600", href: "/dashboard/announcements" },
            ].map((stat, i) => (
              <Link key={i} href={stat.href}
                className={`${stat.color} rounded-2xl p-4 md:p-6 hover:shadow-md transition`}>
                <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
                <p className={`text-2xl md:text-3xl font-extrabold ${stat.textColor}`}>
                  {loading ? "..." : stat.value}
                </p>
                <p className="text-gray-500 text-xs md:text-sm mt-1">{stat.label}</p>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Add Student", href: "/dashboard/students/new", color: "bg-blue-600", icon: "🎓" },
                { label: "Mark Attendance", href: "/dashboard/attendance", color: "bg-green-600", icon: "📅" },
                { label: "Add Grades", href: "/dashboard/grades", color: "bg-yellow-500", icon: "📊" },
                { label: "Announce", href: "/dashboard/announcements", color: "bg-purple-600", icon: "📢" },
              ].map((action, i) => (
                <Link key={i} href={action.href}
                  className={`${action.color} text-white rounded-xl p-3 md:p-4 text-center hover:opacity-90 transition`}>
                  <div className="text-xl md:text-2xl mb-1">{action.icon}</div>
                  <p className="text-xs md:text-sm font-semibold">{action.label}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* All Sections Grid */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">All Sections</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
              {navItems.filter(i => !i.active).map((item, i) => (
                <a key={i} href={item.href}
                  className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition text-center">
                  <span className="text-2xl md:text-3xl">{item.icon}</span>
                  <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 flex items-center justify-around md:hidden z-40">
        {[
          { icon: "🏠", label: "Home", href: "/dashboard" },
          { icon: "🎓", label: "Students", href: "/dashboard/students" },
          { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
          { icon: "💰", label: "Fees", href: "/dashboard/fees" },
          { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
        ].map((item, i) => (
          <a key={i} href={item.href}
            className="flex flex-col items-center gap-1 px-2 py-1">
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs text-gray-500">{item.label}</span>
          </a>
        ))}
      </div>

    </main>
  )
}