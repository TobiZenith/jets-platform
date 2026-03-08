"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    schoolName: "", address: "", type: "", schoolCode: ""
  })

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setForm({
          schoolName: data.name || "",
          address: data.address || "",
          type: data.type || "",
          schoolCode: data.code || ""
        })
      })
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    setSuccess("")
    if (!form.schoolName || !form.address || !form.type) {
      setError("Please fill in all fields")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setSuccess("School settings updated successfully! ✅")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Update your school profile and information</p>
      </div>

      <div className="max-w-lg">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-6">{success}</div>
        )}

        {/* School Code */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">🔑 School Code</h2>
          <p className="text-gray-500 text-sm mb-4">Share this code with parents so they can register on the Parent Portal</p>
          <div className="bg-white rounded-xl px-6 py-4 flex items-center justify-between border border-blue-200">
            <span className="text-2xl font-extrabold text-blue-600 tracking-widest">{form.schoolCode || "Loading..."}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(form.schoolCode || ""); alert("School code copied!") }}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">
              📋 Copy
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">👤 Admin Information</h2>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-400">Name</span>
              <span className="font-medium">{session?.user?.name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-400">Email</span>
              <span className="font-medium">{session?.user?.email}</span>
            </div>
          </div>
        </div>

        {/* School Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">🏫 School Information</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">School Name</label>
              <input name="schoolName" value={form.schoolName} onChange={handleChange} type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
              <input name="address" value={form.address} onChange={handleChange} type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">School Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition">
                <option value="">Select type</option>
                <option value="primary">Primary School</option>
                <option value="secondary">Secondary / High School</option>
                <option value="both">Both Primary & Secondary</option>
              </select>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes ⚙️"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}