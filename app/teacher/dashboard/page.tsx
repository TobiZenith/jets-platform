"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

export default function TeacherDashboard() {
  const router = useRouter()
  const [teacher, setTeacher] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("students")
  const [students, setStudents] = useState<any[]>([])
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")
  const [adding, setAdding] = useState(false)
  const [studentForm, setStudentForm] = useState({ firstName: "", lastName: "", studentId: "" })

  // Attendance state
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [markedDates, setMarkedDates] = useState<string[]>([])
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isPastDate, setIsPastDate] = useState(false)

  // Grades state
  const [grades, setGrades] = useState<any[]>([])
  const [showGradeForm, setShowGradeForm] = useState(false)
  const [gradeForm, setGradeForm] = useState({ studentId: "", subject: "", score: "", term: "" })
  const [gradeError, setGradeError] = useState("")
  const [addingGrade, setAddingGrade] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("teacherToken") : null
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  useEffect(() => {
    const data = localStorage.getItem("teacherData")
    if (!data || !token) {
      router.push("/teacher/login")
      return
    }
    const parsed = JSON.parse(data)
    setTeacher(parsed)
    if (parsed.classes?.[0]?.students) {
      setStudents(parsed.classes[0].students)
    }
  }, [])

  useEffect(() => {
    if (!teacher) return
    const classId = teacher.classes?.[0]?.id
    if (!classId) return
    const month = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
    fetch(`/api/attendance/marked-dates?month=${month}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMarkedDates(Array.isArray(data) ? data : []))
  }, [currentMonth, currentYear, teacher])

  useEffect(() => {
    if (!teacher || !selectedDate) return
    const classId = teacher.classes?.[0]?.id
    if (!classId) return
    setLoadingAttendance(true)
    fetch(`/api/attendance/by-date?date=${selectedDate}&classId=${classId}`)
      .then(res => res.json())
      .then(data => {
        const existing: Record<string, string> = {}
        data.forEach((s: any) => { if (s.status) existing[s.id] = s.status })
        setAttendance(existing)
        setLoadingAttendance(false)
      })
      .catch(() => setLoadingAttendance(false))
  }, [selectedDate, teacher])

  useEffect(() => {
    if (!teacher || activeTab !== "grades") return
    const classId = teacher.classes?.[0]?.id
    if (!classId) return
    fetch(`/api/grades?classId=${classId}`)
      .then(res => res.json())
      .then(data => setGrades(Array.isArray(data) ? data : []))
  }, [activeTab, teacher])

  const handleLogout = () => {
    localStorage.removeItem("teacherToken")
    localStorage.removeItem("teacherData")
    router.push("/teacher/login")
  }

  const handleAddStudent = async () => {
    setAddError("")
    if (!studentForm.firstName || !studentForm.lastName || !studentForm.studentId) {
      setAddError("Please fill in all fields")
      return
    }
    setAdding(true)
    try {
      const classId = teacher.classes?.[0]?.id
      const res = await fetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...studentForm, classId, schoolId: teacher.schoolId })
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error || "Something went wrong")
      } else {
        setStudents([...students, data])
        setStudentForm({ firstName: "", lastName: "", studentId: "" })
        setShowAddStudent(false)
        setAddSuccess("Student added successfully! ✅")
        setTimeout(() => setAddSuccess(""), 3000)
        const stored = localStorage.getItem("teacherData")
        if (stored) {
          const parsed = JSON.parse(stored)
          parsed.classes[0].students = [...students, data]
          localStorage.setItem("teacherData", JSON.stringify(parsed))
        }
      }
    } catch {
      setAddError("Something went wrong")
    } finally {
      setAdding(false)
    }
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const clickedDate = new Date(dateStr)
    const todayDate = new Date(todayStr)
    setSelectedDate(dateStr)
    setIsPastDate(clickedDate < todayDate)
    setAttendance({})
    setSaved(false)
  }

  const markAll = (status: string) => {
    const newAttendance: Record<string, string> = {}
    students.forEach(s => { newAttendance[s.id] = status })
    setAttendance(newAttendance)
  }

  const saveAttendance = async () => {
    if (!selectedDate) return
    setSaving(true)
    try {
      const records = students.map(s => ({
        studentId: s.id,
        status: attendance[s.id] || "absent"
      }))
      const res = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, date: selectedDate })
      })
      if (res.ok) {
        setSaved(true)
        if (!markedDates.includes(selectedDate)) {
          setMarkedDates(prev => [...prev, selectedDate])
        }
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {}
    finally { setSaving(false) }
  }

  const handleAddGrade = async () => {
    setGradeError("")
    if (!gradeForm.studentId || !gradeForm.subject || !gradeForm.score || !gradeForm.term) {
      setGradeError("Please fill in all fields")
      return
    }
    setAddingGrade(true)
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gradeForm)
      })
      const data = await res.json()
      if (!res.ok) {
        setGradeError(data.error || "Something went wrong")
      } else {
        setGrades([data, ...grades])
        setGradeForm({ studentId: "", subject: "", score: "", term: "" })
        setShowGradeForm(false)
      }
    } catch {
      setGradeError("Something went wrong")
    } finally {
      setAddingGrade(false)
    }
  }

  const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDay = (month: number, year: number) => new Date(year, month, 1).getDay()
  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }

  const presentCount = Object.values(attendance).filter(s => s === "present").length
  const absentCount = Object.values(attendance).filter(s => s === "absent").length
  const lateCount = Object.values(attendance).filter(s => s === "late").length

  if (!teacher) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400">Loading...</div>
    </div>
  )

  const myClass = teacher.classes?.[0]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-10 md:h-14 w-auto" />
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden md:block">👩‍🏫 {teacher.firstName} {teacher.lastName}</span>
          <button onClick={handleLogout}
            className="text-sm bg-red-50 text-red-500 px-4 py-2 rounded-full hover:bg-red-100 transition">
            Sign Out
          </button>
        </div>
      </nav>

      <div className="p-4 md:p-8">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            Welcome, {teacher.firstName}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">{teacher.schoolName}</p>
        </div>

        {/* Class Info */}
        {!myClass ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="font-bold text-gray-800 mb-1">No Class Assigned Yet</h3>
            <p className="text-gray-400 text-sm">Ask your school admin to assign you a class</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-2xl p-4">
                <p className="text-2xl font-extrabold text-blue-600">{students.length}</p>
                <p className="text-gray-500 text-sm">Students</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4">
                <p className="text-2xl font-extrabold text-green-600">{myClass.name}</p>
                <p className="text-gray-500 text-sm">My Class</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 col-span-2 md:col-span-1">
                <p className="text-2xl font-extrabold text-purple-600">{teacher.subject}</p>
                <p className="text-gray-500 text-sm">Subject</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
              {[
                { key: "students", label: "🎓 Students" },
                { key: "attendance", label: "📅 Attendance" },
                { key: "grades", label: "📊 Grades" },
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition
                    ${activeTab === tab.key ? "bg-blue-600 text-white" : "bg-white text-gray-500 hover:bg-gray-100"}`}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Students Tab */}
            {activeTab === "students" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">Students in {myClass.name}</h2>
                  <button onClick={() => setShowAddStudent(!showAddStudent)}
                    className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-blue-700 transition">
                    {showAddStudent ? "✕ Cancel" : "➕ Add Student"}
                  </button>
                </div>

                {addSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-4">{addSuccess}</div>
                )}

                {showAddStudent && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 className="font-medium text-gray-800 mb-3">Add New Student</h3>
                    {addError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-3">{addError}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input placeholder="First Name" value={studentForm.firstName}
                        onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
                      <input placeholder="Last Name" value={studentForm.lastName}
                        onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
                      <input placeholder="Student ID (e.g. STU001)" value={studentForm.studentId}
                        onChange={e => setStudentForm({ ...studentForm, studentId: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400" />
                    </div>
                    <button onClick={handleAddStudent} disabled={adding}
                      className="mt-3 bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                      {adding ? "Adding..." : "Add Student"}
                    </button>
                  </div>
                )}

                {students.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🎓</div>
                    <p className="text-gray-400 text-sm">No students yet. Add your first student!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {students.map((student: any, i: number) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                            {student.photo
                              ? <img src={student.photo} alt="" className="w-full h-full object-cover" />
                              : `${student.firstName[0]}${student.lastName[0]}`}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-gray-400">{student.studentId}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === "attendance" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Calendar */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">‹</button>
                    <h2 className="font-bold text-gray-800">{MONTHS[currentMonth]} {currentYear}</h2>
                    <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition">›</button>
                  </div>
                  <div className="grid grid-cols-7 mb-2">
                    {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: getFirstDay(currentMonth, currentYear) }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, i) => {
                      const day = i + 1
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                      const isToday = dateStr === todayStr
                      const isSelected = dateStr === selectedDate
                      const isMarked = markedDates.includes(dateStr)
                      const isPast = new Date(dateStr) < new Date(todayStr)
                      return (
                        <button key={day} onClick={() => handleDateClick(day)}
                          className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition
                            ${isSelected ? "bg-blue-600 text-white shadow-md" :
                              isToday ? "bg-blue-50 text-blue-600 border-2 border-blue-300" :
                              isPast ? "text-gray-400 hover:bg-gray-50" :
                              "text-gray-700 hover:bg-gray-50"}`}>
                          {day}
                          {isMarked && !isSelected && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-500" />}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Attendance Panel */}
                <div className="flex flex-col gap-4">
                  {!selectedDate ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                      <div className="text-5xl mb-4">📅</div>
                      <p className="text-gray-400 text-sm">Click a date to mark attendance</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">
                            {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                          </h3>
                          <p className="text-xs text-gray-400">{isPastDate ? "📖 Past attendance" : "✏️ Mark attendance"}</p>
                        </div>
                        {saved && <span className="text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">✅ Saved!</span>}
                      </div>

                      {Object.keys(attendance).length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-green-50 rounded-xl p-2 text-center">
                            <p className="text-lg font-extrabold text-green-600">{presentCount}</p>
                            <p className="text-xs text-gray-400">Present</p>
                          </div>
                          <div className="bg-red-50 rounded-xl p-2 text-center">
                            <p className="text-lg font-extrabold text-red-500">{absentCount}</p>
                            <p className="text-xs text-gray-400">Absent</p>
                          </div>
                          <div className="bg-yellow-50 rounded-xl p-2 text-center">
                            <p className="text-lg font-extrabold text-yellow-500">{lateCount}</p>
                            <p className="text-xs text-gray-400">Late</p>
                          </div>
                        </div>
                      )}

                      {!isPastDate && (
                        <div className="flex gap-2 mb-4">
                          <button onClick={() => markAll("present")} className="flex-1 text-xs bg-green-50 text-green-600 py-2 rounded-xl hover:bg-green-100 transition font-medium">✅ All Present</button>
                          <button onClick={() => markAll("absent")} className="flex-1 text-xs bg-red-50 text-red-500 py-2 rounded-xl hover:bg-red-100 transition font-medium">❌ All Absent</button>
                        </div>
                      )}

                      <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                        {loadingAttendance ? (
                          <p className="text-center text-gray-400 py-4">Loading...</p>
                        ) : students.map((student: any) => (
                          <div key={student.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                            <p className="text-sm font-medium text-gray-800">{student.firstName} {student.lastName}</p>
                            {isPastDate ? (
                              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize
                                ${attendance[student.id] === "present" ? "bg-green-50 text-green-600" :
                                  attendance[student.id] === "late" ? "bg-yellow-50 text-yellow-600" :
                                  attendance[student.id] === "absent" ? "bg-red-50 text-red-500" :
                                  "bg-gray-50 text-gray-400"}`}>
                                {attendance[student.id] || "not marked"}
                              </span>
                            ) : (
                              <div className="flex gap-1">
                                {["present", "absent", "late"].map(status => (
                                  <button key={status} onClick={() => setAttendance(prev => ({ ...prev, [student.id]: status }))}
                                    className={`text-xs px-2 py-1.5 rounded-xl font-medium transition border
                                      ${attendance[student.id] === status
                                        ? status === "present" ? "bg-green-500 text-white border-green-500"
                                          : status === "absent" ? "bg-red-500 text-white border-red-500"
                                          : "bg-yellow-400 text-white border-yellow-400"
                                        : "bg-white text-gray-400 border-gray-200"}`}>
                                    {status === "present" ? "✅" : status === "absent" ? "❌" : "⏰"}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {!isPastDate && (
                        <button onClick={saveAttendance} disabled={saving}
                          className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                          {saving ? "Saving..." : `💾 Save Attendance`}
                        </button>
                      )}
                      {isPastDate && (
                        <button onClick={() => setIsPastDate(false)}
                          className="w-full mt-4 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition">
                          ✏️ Edit Attendance
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grades Tab */}
            {activeTab === "grades" && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-800">Grades</h2>
                  <button onClick={() => setShowGradeForm(!showGradeForm)}
                    className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-purple-700 transition">
                    {showGradeForm ? "✕ Cancel" : "➕ Add Grade"}
                  </button>
                </div>

                {showGradeForm && (
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    {gradeError && (
                      <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-3">{gradeError}</div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select value={gradeForm.studentId} onChange={e => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400">
                        <option value="">Select student</option>
                        {students.map((s: any) => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                        ))}
                      </select>
                      <input placeholder="Subject" value={gradeForm.subject}
                        onChange={e => setGradeForm({ ...gradeForm, subject: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400" />
                      <input placeholder="Score (%)" type="number" value={gradeForm.score}
                        onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400" />
                      <select value={gradeForm.term} onChange={e => setGradeForm({ ...gradeForm, term: e.target.value })}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400">
                        <option value="">Select term</option>
                        <option value="Term 1">Term 1</option>
                        <option value="Term 2">Term 2</option>
                        <option value="Term 3">Term 3</option>
                      </select>
                    </div>
                    <button onClick={handleAddGrade} disabled={addingGrade}
                      className="mt-3 bg-purple-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-purple-700 transition disabled:opacity-50">
                      {addingGrade ? "Saving..." : "Save Grade"}
                    </button>
                  </div>
                )}

                {grades.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-400 text-sm">No grades yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[400px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Student</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Subject</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Score</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Term</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((grade: any, i: number) => (
                          <tr key={i} className="border-t border-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              {grade.student?.firstName} {grade.student?.lastName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{grade.subject}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full
                                ${grade.score >= 70 ? "bg-green-50 text-green-600" :
                                  grade.score >= 50 ? "bg-yellow-50 text-yellow-600" :
                                  "bg-red-50 text-red-500"}`}>
                                {grade.score}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">{grade.term}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}