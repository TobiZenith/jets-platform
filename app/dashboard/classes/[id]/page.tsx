"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function ClassProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [cls, setCls] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/classes/${id}`)
      .then(res => res.json())
      .then(data => {
        setCls(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this class?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/classes/${id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/dashboard/classes")
      }
    } catch {
      setDeleting(false)
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </main>
  )

  if (!cls) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Class not found</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
        <Link href="/dashboard/classes" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Classes
        </Link>
      </nav>

      <div className="flex">
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
                  ${item.active ? "bg-yellow-50 text-yellow-600" : "text-gray-600 hover:bg-gray-50 hover:text-yellow-600"}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 p-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-3xl">
                  📚
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{cls.name}</h1>
                  <p className="text-gray-400 text-sm capitalize">Level: {cls.level}</p>
                  <p className="text-gray-400 text-sm">Students: {cls.students?.length || 0}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href={`/dashboard/classes/${id}/edit`}
                  className="bg-yellow-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-yellow-600 transition text-sm">
                  ✏️ Edit
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-red-600 transition text-sm disabled:opacity-50">
                  {deleting ? "Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          </div>

          {/* Students in class */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🎓 Students in this Class</h2>
            {cls.students?.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No students in this class yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {cls.students?.map((student: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <p className="font-medium text-gray-800 text-sm">{student.firstName} {student.lastName}</p>
                    <Link href={`/dashboard/students/${student.id}`}
                      className="text-blue-600 text-sm hover:underline">View</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}