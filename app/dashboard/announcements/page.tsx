"use client"
import { useState, useEffect } from "react"

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: "", content: "" })

  useEffect(() => {
    fetch("/api/announcements")
      .then(res => res.json())
      .then(data => { setAnnouncements(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.title || !form.content) {
      setError("Please fill in all fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setAnnouncements([data, ...announcements])
        setShowForm(false)
        setForm({ title: "", content: "" })
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Announcements</h1>
          <p className="text-gray-400 text-sm mt-1">Post and manage school announcements</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-orange-500 text-white font-semibold px-4 md:px-6 py-2.5 rounded-full hover:bg-orange-600 transition text-sm">
          {showForm ? "✕ Cancel" : "📢 New Announcement"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Create Announcement</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
          )}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
              <input name="title" value={form.title} onChange={handleChange} type="text"
                placeholder="e.g. School Closing Early Today"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Message *</label>
              <textarea name="content" value={form.content} onChange={handleChange} rows={4}
                placeholder="Write your announcement here..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-400 transition resize-none" />
            </div>
            <button onClick={handleSubmit} disabled={submitting}
              className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition disabled:opacity-50 w-fit">
              {submitting ? "Posting..." : "Post Announcement 📢"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading announcements...</div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="text-5xl mb-4">📢</div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No announcements yet</h3>
            <p className="text-gray-400 text-sm">Click New Announcement to post your first one</p>
          </div>
        ) : (
          announcements.map((announcement: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-800 text-lg">{announcement.title}</h3>
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">{announcement.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}