"use client"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { icon: "🎓", label: "Students", href: "/dashboard/students" },
  { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
  { icon: "📚", label: "Classes", href: "/dashboard/classes" },
  { icon: "📊", label: "Grades", href: "/dashboard/grades" },
  { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
  { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
  { icon: "💰", label: "Fees", href: "/dashboard/fees" },
  { icon: "🗓️", label: "Timetable", href: "/dashboard/timetable" },
 { icon: "📄", label: "Reports", href: "/dashboard/reports" },
{ icon: "🪪", label: "ID Cards", href: "/dashboard/id-cards" },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
]

const bottomNavItems = [
  { icon: "🏠", label: "Home", href: "/dashboard" },
  { icon: "🎓", label: "Students", href: "/dashboard/students" },
  { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
  { icon: "💰", label: "Fees", href: "/dashboard/fees" },
  { icon: "⚙️", label: "More", href: "/dashboard/settings" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <a href="/dashboard">
          <img src="/images/logo.jpeg" alt="JETS" className="h-10 md:h-14 w-auto" />
        </a>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">👤 {session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm bg-red-50 text-red-500 px-4 py-2 rounded-full hover:bg-red-100 transition hidden md:block">
            Sign Out
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-gray-600 text-2xl px-2">
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl px-4 py-6 z-50 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <img src="/images/logo.jpeg" alt="JETS" className="h-10 w-auto" />
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-400 text-xl">✕</button>
            </div>
            <p className="text-xs text-gray-400 uppercase font-bold mb-3 px-2">Main Menu</p>
            <nav className="flex flex-col gap-1">
              {navItems.map((item, i) => (
                <a key={i} href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition
                    ${pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"}`}>
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
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block flex-shrink-0">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {navItems.map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}>
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

        {/* Page Content */}
        <div className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-2 md:hidden z-40">
        {bottomNavItems.map((item, i) => (
          <a key={i} href={item.href}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition
              ${pathname === item.href ? "text-blue-600" : "text-gray-400"}`}>
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </a>
        ))}
      </div>

    </div>
  )
}