"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

export default function TeacherProfilePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [teacher, setTeacher] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/teachers/${id}`)
      .then(res => res.json())
      .then(data => {
        setTeacher(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this teacher?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/teachers/${id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/dashboard/teachers")
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

  if (!teacher) return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-400">Teacher not found</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
        <Link href="/dashboard/teachers" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Teachers
        </Link>
      </nav>

      <div className="flex">
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
                  ${item.active ? "bg-pink-50 text-pink-500" : "text-gray-600 hover:bg-gray-50 hover:text-pink-500"}`}>
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
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-2xl font-bold text-pink-500">
                  {teacher.firstName[0]}{teacher.lastName[0]}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{teacher.firstName} {teacher.lastName}</h1>
                  <p className="text-gray-400 text-sm">Email: {teacher.email}</p>
                  <p className="text-gray-400 text-sm">Subject: {teacher.subject}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href={`/dashboard/teachers/${id}/edit`}
                  className="bg-pink-500 text-white font-semibold px-4 py-2 rounded-full hover:bg-pink-600 transition text-sm">
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
        </div>
      </div>
    </main>
  )
}