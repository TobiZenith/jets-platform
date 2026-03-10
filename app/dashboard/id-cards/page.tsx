"use client"
import { useState, useEffect, useRef } from "react"

const LAYOUTS = ["horizontal", "vertical"]
const FONTS = ["helvetica", "times", "courier"]
const FIELDS = [
  { key: "studentId", label: "Student ID" },
  { key: "class", label: "Class" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "dob", label: "Date of Birth" },
]

const DEFAULT_SETTINGS = {
  bgColor: "#1d4ed8",
  textColor: "#ffffff",
  accentColor: "#ffffff",
  layout: "horizontal",
  font: "helvetica",
  showFields: ["studentId", "class"],
  showPhoto: true,
  showLogo: false,
  logoUrl: "",
  schoolTagline: "",
  cardTitle: "STUDENT IDENTIFICATION CARD",
}

export default function IDCardsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [students, setStudents] = useState<any[]>([])
  const [schoolName, setSchoolName] = useState("")
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch("/api/id-card-settings")
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings })
        if (data.schoolName) setSchoolName(data.schoolName)
      })

    fetch("/api/students")
      .then(res => res.json())
      .then(data => setStudents(data))
  }, [])

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const toggleField = (key: string) => {
    setSettings(prev => ({
      ...prev,
      showFields: prev.showFields.includes(key)
        ? prev.showFields.filter(f => f !== key)
        : [...prev.showFields, key]
    }))
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        updateSetting("logoUrl", data.url)
        updateSetting("showLogo", true)
      }
    } catch {}
    finally { setLogoUploading(false) }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      await fetch("/api/id-card-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {}
    finally { setSaving(false) }
  }

  const generateAllCards = async () => {
    if (students.length === 0) {
      alert("No students found!")
      return
    }
    setGenerating(true)
    try {
      const { default: jsPDF } = await import("jspdf")
      const isHorizontal = settings.layout === "horizontal"
      const doc = new jsPDF({
        orientation: isHorizontal ? "landscape" : "portrait",
        unit: "mm",
        format: [85.6, 53.98]
      })

      for (let idx = 0; idx < students.length; idx++) {
        const student = students[idx]
        if (idx > 0) doc.addPage()
        await drawCard(doc, student, settings, schoolName, isHorizontal)
      }

      doc.save(`${schoolName}_All_ID_Cards.pdf`)
    } catch (err) {
      console.error(err)
      alert("Failed to generate ID cards")
    } finally {
      setGenerating(false)
    }
  }

  const generateSingleCard = async (student: any) => {
    try {
      const { default: jsPDF } = await import("jspdf")
      const isHorizontal = settings.layout === "horizontal"
      const doc = new jsPDF({
        orientation: isHorizontal ? "landscape" : "portrait",
        unit: "mm",
        format: [85.6, 53.98]
      })
      await drawCard(doc, student, settings, schoolName, isHorizontal)
      doc.save(`${student.firstName}_${student.lastName}_ID_Card.pdf`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">🪪 ID Card Designer</h1>
          <p className="text-gray-400 text-sm mt-1">Customize and print student ID cards</p>
        </div>
        <div className="flex gap-2">
          <button onClick={saveSettings} disabled={saving}
            className="bg-gray-800 text-white font-semibold px-4 py-2.5 rounded-full hover:bg-gray-900 transition text-sm disabled:opacity-50">
            {saved ? "✅ Saved!" : saving ? "Saving..." : "💾 Save Design"}
          </button>
          <button onClick={generateAllCards} disabled={generating}
            className="bg-blue-600 text-white font-semibold px-4 py-2.5 rounded-full hover:bg-blue-700 transition text-sm disabled:opacity-50">
            {generating ? "Generating..." : "🖨️ Print All Cards"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Settings Panel */}
        <div className="flex flex-col gap-4">

          {/* Colors */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">🎨 Colors</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Background</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.bgColor}
                    onChange={e => updateSetting("bgColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <span className="text-xs text-gray-400">{settings.bgColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Text Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.textColor}
                    onChange={e => updateSetting("textColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <span className="text-xs text-gray-400">{settings.textColor}</span>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Accent</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={settings.accentColor}
                    onChange={e => updateSetting("accentColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                  <span className="text-xs text-gray-400">{settings.accentColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layout & Font */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">📐 Layout & Font</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Layout</label>
                <select value={settings.layout} onChange={e => updateSetting("layout", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  {LAYOUTS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Font</label>
                <select value={settings.font} onChange={e => updateSetting("font", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  {FONTS.map(f => <option key={f} value={f} className="capitalize">{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Card Text */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">✏️ Card Text</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Card Title</label>
                <input type="text" value={settings.cardTitle}
                  onChange={e => updateSetting("cardTitle", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">School Tagline (optional)</label>
                <input type="text" value={settings.schoolTagline}
                  onChange={e => updateSetting("schoolTagline", e.target.value)}
                  placeholder="e.g. Excellence in Education"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
          </div>

          {/* Fields */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">📋 Fields to Show</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={settings.showPhoto}
                  onChange={e => updateSetting("showPhoto", e.target.checked)}
                  className="w-4 h-4 accent-blue-600" />
                <span className="text-sm text-gray-700">Student Photo</span>
              </label>
              {FIELDS.map(field => (
                <label key={field.key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox"
                    checked={settings.showFields.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                    className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">🖼️ School Logo</h2>
            <div className="flex items-center gap-4">
              {settings.logoUrl && (
                <img src={settings.logoUrl} alt="Logo" className="w-16 h-16 object-contain rounded-xl border border-gray-200" />
              )}
              <div className="flex flex-col gap-2">
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <button onClick={() => logoInputRef.current?.click()} disabled={logoUploading}
                  className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-xl hover:bg-gray-200 transition">
                  {logoUploading ? "Uploading..." : "📁 Upload Logo"}
                </button>
                {settings.logoUrl && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={settings.showLogo}
                      onChange={e => updateSetting("showLogo", e.target.checked)}
                      className="w-4 h-4 accent-blue-600" />
                    <span className="text-xs text-gray-500">Show logo on card</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">👁️ Live Preview</h2>
            <div className="flex justify-center">
              <IDCardPreview settings={settings} schoolName={schoolName} />
            </div>
          </div>

          {/* Students List */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="font-bold text-gray-800 mb-4">🎓 Print Individual Cards ({students.length} students)</h2>
            {students.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No students found</p>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {students.map((student: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                        {student.photo
                          ? <img src={student.photo} alt="" className="w-full h-full object-cover" />
                          : `${student.firstName[0]}${student.lastName[0]}`}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-400">{student.studentId}</p>
                      </div>
                    </div>
                    <button onClick={() => generateSingleCard(student)}
                      className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition">
                      🖨️ Print
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function IDCardPreview({ settings, schoolName }: { settings: any, schoolName: string }) {
  const isHorizontal = settings.layout === "horizontal"
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `${r}, ${g}, ${b}`
  }

  return (
    <div
      style={{
        width: isHorizontal ? "320px" : "200px",
        height: isHorizontal ? "200px" : "320px",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        fontFamily: settings.font === "times" ? "serif" : settings.font === "courier" ? "monospace" : "sans-serif",
        position: "relative",
        background: settings.bgColor,
      }}>

      {/* Header */}
      <div style={{
        background: `rgba(0,0,0,0.2)`,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}>
        {settings.showLogo && settings.logoUrl && (
          <img src={settings.logoUrl} alt="Logo" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "4px" }} />
        )}
        <div>
          <p style={{ color: settings.textColor, fontWeight: "bold", fontSize: "9px", margin: 0 }}>
            {schoolName || "School Name"}
          </p>
          {settings.schoolTagline && (
            <p style={{ color: settings.accentColor, fontSize: "7px", margin: 0, opacity: 0.8 }}>
              {settings.schoolTagline}
            </p>
          )}
        </div>
      </div>

      {/* Card Title */}
      <div style={{ padding: "4px 14px", background: `rgba(255,255,255,0.1)` }}>
        <p style={{ color: settings.accentColor, fontSize: "6px", margin: 0, letterSpacing: "1px" }}>
          {settings.cardTitle}
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "10px 14px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
        {settings.showPhoto && (
          <div style={{
            width: "48px", height: "48px", borderRadius: "50%",
            background: `rgba(255,255,255,0.2)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${settings.accentColor}`,
            flexShrink: 0,
            color: settings.textColor, fontWeight: "bold", fontSize: "14px"
          }}>
            JS
          </div>
        )}
        <div style={{ flex: 1 }}>
          <p style={{ color: settings.textColor, fontWeight: "bold", fontSize: "11px", margin: "0 0 2px 0" }}>
            John Student
          </p>
          {settings.showFields.includes("studentId") && (
            <div style={{ marginBottom: "2px" }}>
              <p style={{ color: settings.accentColor, fontSize: "6px", margin: 0, opacity: 0.7 }}>STUDENT ID</p>
              <p style={{ color: settings.textColor, fontSize: "8px", margin: 0, fontWeight: "bold" }}>STU-001</p>
            </div>
          )}
          {settings.showFields.includes("class") && (
            <div style={{ marginBottom: "2px" }}>
              <p style={{ color: settings.accentColor, fontSize: "6px", margin: 0, opacity: 0.7 }}>CLASS</p>
              <p style={{ color: settings.textColor, fontSize: "8px", margin: 0, fontWeight: "bold" }}>Grade 5</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: `rgba(0,0,0,0.2)`, padding: "4px 14px"
      }}>
        <p style={{ color: settings.accentColor, fontSize: "5px", margin: 0, opacity: 0.6, textAlign: "center" }}>
          JETS School Management System
        </p>
      </div>
    </div>
  )
}

async function drawCard(doc: any, student: any, settings: any, schoolName: string, isHorizontal: boolean) {
  const W = 85.6
  const H = 53.98

  const hexToComponents = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return [r, g, b]
  }

  const [br, bg, bb] = hexToComponents(settings.bgColor)
  const [tr, tg, tb] = hexToComponents(settings.textColor)
  const [ar, ag, ab] = hexToComponents(settings.accentColor)

  // Background
  doc.setFillColor(br, bg, bb)
  doc.rect(0, 0, W, H, "F")

  // Header bar
  doc.setFillColor(0, 0, 0)
  doc.setGlobalAlpha ? doc.setGlobalAlpha(0.2) : null
  doc.setFillColor(Math.max(0, br - 30), Math.max(0, bg - 30), Math.max(0, bb - 30))
  doc.rect(0, 0, W, 16, "F")

  // School name
  doc.setTextColor(tr, tg, tb)
  doc.setFontSize(7)
  doc.setFont(settings.font || "helvetica", "bold")
  doc.text((schoolName || "School Name").toUpperCase(), settings.showLogo && settings.logoUrl ? 22 : 4, 8)

  if (settings.schoolTagline) {
    doc.setFontSize(5)
    doc.setFont(settings.font || "helvetica", "normal")
    doc.setTextColor(ar, ag, ab)
    doc.text(settings.schoolTagline, settings.showLogo && settings.logoUrl ? 22 : 4, 13)
  }

  // Card title bar
  doc.setFillColor(Math.max(0, br - 20), Math.max(0, bg - 20), Math.max(0, bb - 20))
  doc.rect(0, 16, W, 6, "F")
  doc.setTextColor(ar, ag, ab)
  doc.setFontSize(4.5)
  doc.setFont(settings.font || "helvetica", "normal")
  doc.text(settings.cardTitle || "STUDENT IDENTIFICATION CARD", W / 2, 20, { align: "center" })

  // Photo
  let textStartX = 4
  if (settings.showPhoto) {
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.5)
    doc.circle(14, 36, 9, "FD")

    if (student.photo) {
      try {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.src = student.photo
        await new Promise((resolve) => {
          img.onload = resolve
          img.onerror = resolve
          setTimeout(resolve, 2000)
        })
        const canvas = document.createElement("canvas")
        canvas.width = 100
        canvas.height = 100
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.beginPath()
          ctx.arc(50, 50, 50, 0, Math.PI * 2)
          ctx.clip()
          ctx.drawImage(img, 0, 0, 100, 100)
        }
        doc.addImage(canvas.toDataURL("image/jpeg"), "JPEG", 5, 27, 18, 18)
      } catch {}
    } else {
      doc.setTextColor(br, bg, bb)
      doc.setFontSize(9)
      doc.setFont(settings.font || "helvetica", "bold")
      doc.text(`${student.firstName[0]}${student.lastName[0]}`, 14, 38, { align: "center" })
    }
    textStartX = 28
  }

  // Student name
  doc.setTextColor(tr, tg, tb)
  doc.setFontSize(9)
  doc.setFont(settings.font || "helvetica", "bold")
  doc.text(`${student.firstName} ${student.lastName}`, textStartX, 30)

  let yPos = 36
  if (settings.showFields.includes("studentId")) {
    doc.setFontSize(5)
    doc.setFont(settings.font || "helvetica", "normal")
    doc.setTextColor(ar, ag, ab)
    doc.text("STUDENT ID", textStartX, yPos)
    yPos += 3.5
    doc.setFontSize(7)
    doc.setFont(settings.font || "helvetica", "bold")
    doc.setTextColor(tr, tg, tb)
    doc.text(student.studentId, textStartX, yPos)
    yPos += 5
  }

  if (settings.showFields.includes("class")) {
    doc.setFontSize(5)
    doc.setFont(settings.font || "helvetica", "normal")
    doc.setTextColor(ar, ag, ab)
    doc.text("CLASS", textStartX, yPos)
    yPos += 3.5
    doc.setFontSize(7)
    doc.setFont(settings.font || "helvetica", "bold")
    doc.setTextColor(tr, tg, tb)
    doc.text(student.class?.name || "N/A", textStartX, yPos)
  }

  // Footer
  doc.setFillColor(Math.max(0, br - 30), Math.max(0, bg - 30), Math.max(0, bb - 30))
  doc.rect(0, H - 6, W, 6, "F")
  doc.setTextColor(ar, ag, ab)
  doc.setFontSize(4)
  doc.setFont(settings.font || "helvetica", "normal")
  doc.text("Generated by JETS School Management System", W / 2, H - 2, { align: "center" })
}