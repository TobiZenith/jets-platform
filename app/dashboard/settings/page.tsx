"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

const DEFAULT_BOUNDARIES = [
  { grade: "A", min: 70, max: 100, remark: "Excellent" },
  { grade: "B", min: 60, max: 69, remark: "Very Good" },
  { grade: "C", min: 50, max: 59, remark: "Good" },
  { grade: "D", min: 45, max: 49, remark: "Pass" },
  { grade: "E", min: 40, max: 44, remark: "Poor" },
  { grade: "F", min: 0, max: 39, remark: "Fail" }
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [form, setForm] = useState({ schoolName: "", address: "", type: "", schoolCode: "" })
  const [grading, setGrading] = useState({ caWeight: 40, examWeight: 60, boundaries: DEFAULT_BOUNDARIES })
  const [gradingSuccess, setGradingSuccess] = useState("")
  const [gradingError, setGradingError] = useState("")
  const [savingGrading, setSavingGrading] = useState(false)

  useEffect(() => {
    setFetching(true)
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setForm({ schoolName: data.name || "", address: data.address || "", type: data.type || "", schoolCode: data.code || "" })
        setFetching(false)
      })
      .catch(() => setFetching(false))
    fetch("/api/grading-settings")
      .then(res => res.json())
      .then(data => {
        if (data.caWeight) setGrading({ caWeight: data.caWeight, examWeight: data.examWeight, boundaries: data.boundaries || DEFAULT_BOUNDARIES })
      })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError("")
    setSuccess("")
    if (!form.schoolName || !form.address || !form.type) { setError("Please fill in all fields"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || "Something went wrong") }
      else { setSuccess("School settings updated successfully!") }
    } catch { setError("Something went wrong. Please try again.") }
    finally { setLoading(false) }
  }

  const handleBoundaryChange = (index: number, field: string, value: string) => {
    const updated = [...grading.boundaries]
    updated[index] = { ...updated[index], [field]: field === "remark" || field === "grade" ? value : parseInt(value) }
    setGrading({ ...grading, boundaries: updated })
  }

  const handleSaveGrading = async () => {
    setGradingError("")
    setGradingSuccess("")
    if (grading.caWeight + grading.examWeight !== 100) {
      setGradingError("CA weight and Exam weight must add up to 100"); return
    }
    setSavingGrading(true)
    try {
      const res = await fetch("/api/grading-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(grading)
      })
      const data = await res.json()
      if (!res.ok) { setGradingError(data.error || "Something went wrong") }
      else { setGradingSuccess("Grading settings saved successfully!") }
    } catch { setGradingError("Something went wrong") }
    finally { setSavingGrading(false) }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Update your school profile and grading system</p>
      </div>

      <div className="max-w-2xl flex flex-col gap-6">
        {/* School Code */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-2">🔑 School Code</h2>
          <p className="text-gray-500 text-sm mb-4">Share this code with parents so they can register on the Parent Portal</p>
          <div className="bg-white rounded-xl px-6 py-4 flex items-center justify-between border border-blue-200">
            {fetching ? (
              <span className="text-gray-400 text-sm">Fetching code...</span>
            ) : form.schoolCode ? (
              <span className="text-2xl font-extrabold text-blue-600 tracking-widest">{form.schoolCode}</span>
            ) : (
              <span className="text-gray-400 text-sm">No code found</span>
            )}
            <button onClick={() => { navigator.clipboard.writeText(form.schoolCode || ""); alert("School code copied!") }}
              className="text-sm bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition">Copy</button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
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
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">School Name</label>
              <input name="schoolName" value={form.schoolName} onChange={handleChange} type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
              <input name="address" value={form.address} onChange={handleChange} type="text"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">School Type</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 transition">
                <option value="">Select type</option>
                <option value="primary">Primary School</option>
                <option value="secondary">Secondary / High School</option>
                <option value="both">Both Primary & Secondary</option>
              </select>
            </div>
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Grading Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-1">📊 Grading Settings</h2>
          <p className="text-gray-400 text-sm mb-4">Set how scores are calculated and graded for all classes</p>
          {gradingError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{gradingError}</div>}
          {gradingSuccess && <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-4">{gradingSuccess}</div>}

          {/* Score Weights */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Score Weights (must add up to 100)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">CA Weight (%)</label>
                <input type="number" min="0" max="100" value={grading.caWeight}
                  onChange={e => setGrading({ ...grading, caWeight: parseInt(e.target.value), examWeight: 100 - parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Exam Weight (%)</label>
                <input type="number" min="0" max="100" value={grading.examWeight}
                  onChange={e => setGrading({ ...grading, examWeight: parseInt(e.target.value), caWeight: 100 - parseInt(e.target.value) })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Total: {grading.caWeight + grading.examWeight}% {grading.caWeight + grading.examWeight === 100 ? "✅" : "❌ Must be 100"}</p>
          </div>

         {/* Grade Boundaries */}
<div className="bg-gray-50 rounded-xl p-4 mb-4">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-bold text-gray-700">Grade Boundaries</h3>
    <button onClick={() => setGrading({ ...grading, boundaries: [...grading.boundaries, { grade: "", min: 0, max: 0, remark: "" }] })}
      className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-full hover:bg-yellow-600 font-semibold">
      + Add Grade
    </button>
  </div>
  <div className="grid grid-cols-5 gap-2 mb-2">
    <span className="text-xs font-bold text-gray-400 uppercase">Grade</span>
    <span className="text-xs font-bold text-gray-400 uppercase">Min</span>
    <span className="text-xs font-bold text-gray-400 uppercase">Max</span>
    <span className="text-xs font-bold text-gray-400 uppercase">Remark</span>
    <span className="text-xs font-bold text-gray-400 uppercase">Action</span>
  </div>
  {grading.boundaries.map((b, i) => (
    <div key={i} className="grid grid-cols-5 gap-2 mb-2">
      <input value={b.grade} onChange={e => handleBoundaryChange(i, "grade", e.target.value)}
        placeholder="A"
        className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
      <input type="number" value={b.min} onChange={e => handleBoundaryChange(i, "min", e.target.value)}
        placeholder="0"
        className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
      <input type="number" value={b.max} onChange={e => handleBoundaryChange(i, "max", e.target.value)}
        placeholder="100"
        className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
      <input value={b.remark} onChange={e => handleBoundaryChange(i, "remark", e.target.value)}
        placeholder="Excellent"
        className="border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
      <button onClick={() => setGrading({ ...grading, boundaries: grading.boundaries.filter((_, idx) => idx !== i) })}
        className="text-red-400 hover:text-red-600 text-xs font-semibold">
        Remove
      </button>
    </div>
  ))}
</div>

          <button onClick={handleSaveGrading} disabled={savingGrading}
            className="w-full bg-yellow-500 text-white font-bold py-3 rounded-xl hover:bg-yellow-600 transition disabled:opacity-50">
            {savingGrading ? "Saving..." : "Save Grading Settings"}
          </button>
        </div>
      </div>
    </div>
  )
}