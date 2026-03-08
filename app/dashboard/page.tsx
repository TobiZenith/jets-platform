"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"

const navItems = [
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

export default function DashboardPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({ students: 0, teachers: 0, classes: 0, announcements: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8">
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
          {navItems.map((item, i) => (
            <a key={i} href={item.href}
              className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl hover:bg-gray-50 transition text-center">
              <span className="text-2xl md:text-3xl">{item.icon}</span>
              <span className="text-xs text-gray-600 font-medium">{item.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
