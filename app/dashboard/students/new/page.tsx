"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function AddStudentPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [photoPreview, setPhotoPreview] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [form, setForm] = useState({
    firstName: "", lastName: "", studentId: "", classId: ""
  })

  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload to Cloudinary
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok) {
        setPhotoUrl(data.url)
      } else {
        setError("Photo upload failed. Please try again.")
      }
    } catch {
      setError("Photo upload failed. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.firstName || !form.lastName || !form.studentId) {
      setError("Please fill in all required fields")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photo: photoUrl })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        router.push("/dashboard/students")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-14 w-auto" />
        <a href="/dashboard/students" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Students
        </a>
      </nav>

      <div className="flex">
        <aside className="w-64 min-h-screen bg-white shadow-sm px-4 py-8 hidden md:block">
          <p className="text-xs text-gray-400 uppercase font-bold mb-4 px-2">Main Menu</p>
          <nav className="flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Dashboard", href: "/dashboard" },
              { icon: "🎓", label: "Students", href: "/dashboard/students", active: true },
              { icon: "👩‍🏫", label: "Teachers", href: "/dashboard/teachers" },
              { icon: "📚", label: "Classes", href: "/dashboard/classes" },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "💰", label: "Fees", href: "/dashboard/fees" },
              { icon: "🗓️", label: "Timetable", href: "/dashboard/timetable" },
              { icon: "📄", label: "Reports", href: "/dashboard/reports" },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 p-8">
          <div className="max-w-lg">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Add Student</h1>
              <p className="text-gray-400 text-sm mt-1">Add a new student to your school</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">
                {error}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6">

              {/* Photo Upload */}
              <div className="flex flex-col items-center mb-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl">📸</div>
                      <p className="text-xs text-gray-400 mt-1">Add Photo</p>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <p className="text-white text-xs">Uploading...</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden" />
                <p className="text-xs text-gray-400 mt-2">Click to upload photo (optional)</p>
                {photoUrl && <p className="text-xs text-green-500 mt-1">✅ Photo uploaded!</p>}
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">First Name *</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} type="text" placeholder="John"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Last Name *</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} type="text" placeholder="Doe"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Student ID *</label>
                  <input name="studentId" value={form.studentId} onChange={handleChange} type="text" placeholder="e.g. STU004"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Class</label>
                  <select name="classId" value={form.classId} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition">
                    <option value="">Select class (optional)</option>
                    {classes.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading || uploading}
                  className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 mt-2">
                  {loading ? "Adding Student..." : "Add Student 🎓"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}