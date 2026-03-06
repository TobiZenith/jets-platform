"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    studentId: "", amount: "", description: "", dueDate: "", term: ""
  })

  useEffect(() => {
    fetch("/api/fees")
      .then(res => res.json())
      .then(data => {
        setFees(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    fetch("/api/students")
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(() => {})
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    if (!form.studentId || !form.amount || !form.description || !form.dueDate || !form.term) {
      setError("Please fill in all fields")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong")
      } else {
        setFees([data, ...fees])
        setForm({ studentId: "", amount: "", description: "", dueDate: "", term: "" })
        setShowForm(false)
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const markAsPaid = async (feeId: string) => {
    try {
      const res = await fetch(`/api/fees/${feeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" })
      })
      if (res.ok) {
        setFees(fees.map(f => f.id === feeId ? { ...f, status: "paid" } : f))
      }
    } catch {}
  }

  return (
    <main className="min-h-screen bg-gray-50">

      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-25 w-auto" />
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Dashboard
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
              { icon: "📚", label: "Classes", href: "/dashboard/classes" },
              { icon: "📊", label: "Grades", href: "/dashboard/grades" },
              { icon: "📅", label: "Attendance", href: "/dashboard/attendance" },
              { icon: "📢", label: "Announcements", href: "/dashboard/announcements" },
              { icon: "💰", label: "Fees", href: "/dashboard/fees", active: true },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active ? "bg-green-50 text-green-600" : "text-gray-600 hover:bg-gray-50 hover:text-green-600"}`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        <div className="flex-1 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Fees</h1>
              <p className="text-gray-400 text-sm mt-1">Manage school fees and payments</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-green-600 transition text-sm">
              {showForm ? "✕ Cancel" : "➕ Add Fee"}
            </button>
          </div>

          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Add Fee Record</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Student</label>
                  <select name="studentId" value={form.studentId} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition">
                    <option value="">Select student</option>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentId})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (₦)</label>
                  <input name="amount" value={form.amount} onChange={handleChange} type="number" placeholder="e.g. 50000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                  <input name="description" value={form.description} onChange={handleChange} type="text" placeholder="e.g. School fees Term 1"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Term</label>
                  <select name="term" value={form.term} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition">
                    <option value="">Select term</option>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date</label>
                  <input name="dueDate" value={form.dueDate} onChange={handleChange} type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-400 transition" />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-4 bg-green-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-600 transition disabled:opacity-50">
                {submitting ? "Adding..." : "Add Fee Record 💰"}
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading fees...</div>
            ) : fees.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No fee records yet</h3>
                <p className="text-gray-400 text-sm">Start by adding a fee record for a student</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Description</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Amount</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Term</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Due Date</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-bold text-gray-400 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((fee: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {fee.student?.firstName} {fee.student?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{fee.description}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">₦{fee.amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{fee.term}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(fee.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize
                          ${fee.status === "paid" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {fee.status === "unpaid" && (
                          <button
                            onClick={() => markAsPaid(fee.id)}
                            className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition">
                            Mark Paid ✓
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}