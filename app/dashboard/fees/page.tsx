"use client"
import { useState, useEffect } from "react"
import Link from "next/link"

export default function FeesPage() {
  const [fees, setFees] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    studentId: "", amount: "", description: "", dueDate: "", term: ""
  })

  useEffect(() => {
    fetch("/api/fees")
      .then(res => res.json())
      .then(data => { 
        setFees(Array.isArray(data) ? data : [])
        setLoading(false) 
      })
      .catch(() => setLoading(false))

    fetch("/api/students")
      .then(res => res.json())
      .then(data => setStudents(Array.isArray(data) ? data : []))
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
        const student = students.find(s => s.id === form.studentId)
        setFees([{ ...data, student }, ...fees])
        setShowForm(false)
        setForm({ studentId: "", amount: "", description: "", dueDate: "", term: "" })
      }
    } catch {
      setError("Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const markAsPaid = async (feeId: string) => {
    try {
      const res = await fetch("/api/fees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feeId })
      })

      if (res.ok) {
        setFees(fees.map(f => f.id === feeId ? { ...f, status: "paid", paidDate: new Date() } : f))
      }
    } catch {
      alert("Something went wrong")
    }
  }

  const totalFees = fees.reduce((sum, f) => sum + f.amount, 0)
  const totalPaid = fees.filter(f => f.status === "paid").reduce((sum, f) => sum + f.amount, 0)
  const totalUnpaid = fees.filter(f => f.status === "unpaid").reduce((sum, f) => sum + f.amount, 0)

  return (
    <main className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="text-2xl font-extrabold tracking-widest">
          <span className="text-blue-600">J</span>
          <span className="text-pink-500">E</span>
          <span className="text-yellow-400">T</span>
          <span className="text-green-500">S</span>
        </div>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600 transition">
          ← Back to Dashboard
        </Link>
      </nav>

      <div className="flex">

        {/* Sidebar */}
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
              { icon: "📋", label: "Report Cards", href: "/dashboard/reports" },
              { icon: "💰", label: "Fees", href: "/dashboard/fees", active: true },
              { icon: "⚙️", label: "Settings", href: "/dashboard/settings" },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${item.active
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600"
                  }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 p-8">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Fee Management</h1>
              <p className="text-gray-400 text-sm mt-1">Track and manage student fees</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-full hover:bg-emerald-600 transition text-sm">
              ➕ Add Fee
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-extrabold text-gray-800">₦{totalFees.toLocaleString()}</div>
              <div className="text-gray-500 text-sm mt-1">Total Fees</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="text-3xl mb-2">✅</div>
              <div className="text-2xl font-extrabold text-gray-800">₦{totalPaid.toLocaleString()}</div>
              <div className="text-gray-500 text-sm mt-1">Total Paid</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="text-3xl mb-2">⏳</div>
              <div className="text-2xl font-extrabold text-gray-800">₦{totalUnpaid.toLocaleString()}</div>
              <div className="text-gray-500 text-sm mt-1">Outstanding</div>
            </div>
          </div>

          {/* Add Fee Form */}
          {showForm && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Add New Fee</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Student *</label>
                  <select name="studentId" onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition">
                    <option value="">Select student</option>
                    {students.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
                  <input name="description" onChange={handleChange} type="text" placeholder="e.g. School Fees Term 1"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Amount (₦) *</label>
                  <input name="amount" onChange={handleChange} type="number" placeholder="e.g. 50000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Due Date *</label>
                  <input name="dueDate" onChange={handleChange} type="date"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Term *</label>
                  <select name="term" onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-400 transition">
                    <option value="">Select term</option>
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>
              <button onClick={handleSubmit} disabled={submitting}
                className="mt-4 bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-emerald-600 transition disabled:opacity-50">
                {submitting ? "Adding..." : "Add Fee 💰"}
              </button>
            </div>
          )}

          {/* Fees Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading fees...</div>
            ) : fees.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">No fees yet</h3>
                <p className="text-gray-400 text-sm">Click Add Fee to record your first fee</p>
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
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {fee.student?.firstName} {fee.student?.lastName}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{fee.description}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">₦{fee.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">{fee.term}</td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-bold px-3 py-1 rounded-full capitalize
                          ${fee.status === "paid"
                            ? "text-green-600 bg-green-50"
                            : "text-red-600 bg-red-50"
                          }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {fee.status === "unpaid" && (
                          <button onClick={() => markAsPaid(fee.id)}
                            className="text-sm bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition">
                            Mark Paid
                          </button>
                        )}
                        {fee.status === "paid" && (
                          <span className="text-xs text-gray-400">
                            {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : "Paid"}
                          </span>
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