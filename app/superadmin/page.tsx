"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SuperAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
    if (status === "authenticated") {
      if ((session.user as any).role !== "superadmin") {
        router.push("/dashboard")
        return
      }
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/superadmin")
      const json = await res.json()
      setData(json)
    } catch {}
    finally { setLoading(false) }
  }

  const handleDelete = async (schoolId: string, schoolName: string) => {
    if (!confirm(`Are you sure you want to DELETE "${schoolName}"? This will permanently delete ALL data for this school including students, teachers, grades and fees. This cannot be undone!`)) return
    setDeleting(schoolId)
    try {
      const res = await fetch(`/api/superadmin/${schoolId}`, { method: "DELETE" })
      if (res.ok) {
        setData({ ...data, schools: data.schools.filter((s: any) => s.id !== schoolId), totalSchools: data.totalSchools - 1 })
      }
    } catch {}
    finally { setDeleting(null) }
  }

  if (loading) return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center">
      <p className="text-white">Loading...</p>
    </main>
  )

  return (
    <main className="min-h-screen bg-gray-900">

      {/* Navbar */}
      <nav className="bg-gray-800 px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white font-extrabold text-lg px-3 py-1 rounded-xl">JETS</div>
          <div>
            <p className="text-white font-bold text-sm">Super Admin Panel</p>
            <p className="text-gray-400 text-xs">Platform Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-gray-400 text-sm">👤 {session?.user?.name}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm bg-gray-700 text-gray-300 px-4 py-2 rounded-full hover:bg-gray-600 transition">
            Exit
          </button>
        </div>
      </nav>

      <div className="p-8">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Schools", value: data?.totalSchools || 0, icon: "🏫", color: "bg-blue-600" },
            { label: "Total Students", value: data?.totalStudents || 0, icon: "🎓", color: "bg-green-600" },
            { label: "Total Teachers", value: data?.totalTeachers || 0, icon: "👩‍🏫", color: "bg-purple-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-gray-800 rounded-2xl p-6 flex items-center gap-4 border border-gray-700">
              <div className={`${stat.color} text-white text-2xl w-14 h-14 rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Schools Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-white font-bold text-lg">All Schools</h2>
            <p className="text-gray-400 text-sm">Manage all schools on the platform</p>
          </div>

          {data?.schools?.length === 0 ? (
            <div className="text-center py-16 text-gray-400">No schools registered yet</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">School</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Code</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Type</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase">Students</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase">Teachers</th>
                  <th className="text-center px-6 py-4 text-xs font-bold text-gray-400 uppercase">Classes</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Registered</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.schools?.map((school: any, i: number) => (
                  <tr key={i} className="border-b border-gray-700 hover:bg-gray-750 transition">
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{school.name}</p>
                      <p className="text-gray-400 text-xs">{school.address}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-blue-400 font-mono text-sm font-bold">{school.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full capitalize">{school.type}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-white font-bold">{school._count.students}</td>
                    <td className="px-6 py-4 text-center text-white font-bold">{school._count.teachers}</td>
                    <td className="px-6 py-4 text-center text-white font-bold">{school._count.classes}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{new Date(school.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(school.id, school.name)}
                        disabled={deleting === school.id}
                        className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-full hover:bg-red-700 transition disabled:opacity-50">
                        {deleting === school.id ? "Deleting..." : "🗑️ Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  )
}