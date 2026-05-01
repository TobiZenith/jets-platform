"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export default function TeacherDashboard() {
  const router = useRouter()
  const [teacher, setTeacher] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("students")
  const [students, setStudents] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")
  const [adding, setAdding] = useState(false)
  const [studentForm, setStudentForm] = useState({ firstName: "", lastName: "", studentId: "" })

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

  const [grades, setGrades] = useState<any[]>([])
  const [showGradeForm, setShowGradeForm] = useState(false)
  const [gradeForm, setGradeForm] = useState({ studentId: "", subjectId: "", score: "", term: "" })
  const [gradeError, setGradeError] = useState("")
  const [addingGrade, setAddingGrade] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("teacherToken") : null
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  useEffect(() => {
    const data = localStorage.getItem("teacherData")
    if (!data || !token) { router.push("/teacher/login"); return }
    const parsed = JSON.parse(data)
    setTeacher(parsed)
    if (parsed.classes?.[0]?.students) setStudents(parsed.classes[0].students)
    if (parsed.classes?.[0]?.id) {
      fetch(`/api/subjects?classId=${parsed.classes[0].id}`)
        .then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : []))
    }
  }, [])

  useEffect(() => {
    if (!teacher) return
    const classId = teacher.classes?.[0]?.id
    if (!classId) return
    const month = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
    fetch(`/api/attendance/marked-dates?month=${month}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setMarkedDates(Array.isArray(data) ? data : []))
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
      }).catch(() => setLoadingAttendance(false))
  }, [selectedDate, teacher])

  useEffect(() => {
    if (!teacher || activeTab !== "grades") return
    const classId = teacher.classes?.[0]?.id
    if (!classId) return
    fetch(`/api/grades?classId=${classId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setGrades(Array.isArray(data) ? data : []))
  }, [activeTab, teacher])

  const handleLogout = () => {
    localStorage.removeItem("teacherToken")
    localStorage.removeItem("teacherData")
    router.push("/teacher/login")
  }

  const handleAddStudent = async () => {
    setAddError("")
    if (!studentForm.firstName || !studentForm.lastName || !studentForm.studentId) { setAddError("Please fill in all fields"); return }
    setAdding(true)
    try {
      const classId = teacher.classes?.[0]?.id
      const res = await fetch("/api/teacher/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...studentForm, classId, schoolId: teacher.schoolId })
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error || "Something went wrong") }
      else {
        setStudents([...students, data])
        setStudentForm({ firstName: "", lastName: "", studentId: "" })
        setShowAddStudent(false)
        setAddSuccess("Student added successfully!")
        setTimeout(() => setAddSuccess(""), 3000)
      }
    } catch { setAddError("Something went wrong") }
    finally { setAdding(false) }
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
      const records = students.map(s => ({ studentId: s.id, status: attendance[s.id] || "absent" }))
      const res = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records, date: selectedDate })
      })
      if (res.ok) {
        setSaved(true)
        if (!markedDates.includes(selectedDate)) setMarkedDates(prev => [...prev, selectedDate])
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {} finally { setSaving(false) }
  }

  const handleAddGrade = async () => {
    setGradeError("")
    if (!gradeForm.studentId || !gradeForm.subjectId || !gradeForm.score || !gradeForm.term) {
      setGradeError("Please fill in all fields"); return
    }
    setAddingGrade(true)
    try {
      const subject = subjects.find(s => s.id === gradeForm.subjectId)
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId: gradeForm.studentId, subject: subject?.name, score: gradeForm.score, term: gradeForm.term })
      })
      const data = await res.json()
      if (!res.ok) { setGradeError(data.error || "Something went wrong") }
      else {
        setGrades(prev => [data, ...prev])
        setGradeForm({ studentId: "", subjectId: "", score: "", term: "" })
        setShowGradeForm(false)
      }
    } catch { setGradeError("Something went wrong") }
    finally { setAddingGrade(false) }
  }

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()

  if (!teacher) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <img src="/images/logo.jpeg" alt="JETS" className="h-10 w-auto" />
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden md:block">Welcome, {teacher.firstName}!</span>
          <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-semibold">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-2xl">&#128105;&#8205;&#127979;</div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{teacher.firstName} {teacher.lastName}</h1>
              <p className="text-gray-500 text-sm">{teacher.subject} Teacher  {teacher.schoolName}</p>
              <p className="text-gray-400 text-sm">Class: {teacher.classes?.[0]?.name || "No class assigned"}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-green-600">{students.length}</p>
              <p className="text-xs text-gray-500 mt-1">Students</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{subjects.length}</p>
              <p className="text-xs text-gray-500 mt-1">Subjects</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{grades.length}</p>
              <p className="text-xs text-gray-500 mt-1">Grades</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 bg-white rounded-2xl shadow-sm p-2">
          {["students", "attendance", "grades"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition ${activeTab === tab ? "bg-green-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
              {tab === "students" ? "Students" : tab === "attendance" ? "Attendance" : "Grades"}
            </button>
          ))}
        </div>

        {activeTab === "students" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Students ({students.length})</h2>
              <button onClick={() => setShowAddStudent(!showAddStudent)}
                className="bg-green-500 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-green-600 transition">
                {showAddStudent ? "Cancel" : "+ Add Student"}
              </button>
            </div>
            {addSuccess && <div className="bg-green-50 border border-green-200 text-green-600 rounded-xl px-4 py-3 text-sm mb-4">{addSuccess}</div>}
            {showAddStudent && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                {addError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-3">{addError}</div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input placeholder="First Name" value={studentForm.firstName} onChange={e => setStudentForm({ ...studentForm, firstName: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400" />
                  <input placeholder="Last Name" value={studentForm.lastName} onChange={e => setStudentForm({ ...studentForm, lastName: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400" />
                  <input placeholder="Student ID" value={studentForm.studentId} onChange={e => setStudentForm({ ...studentForm, studentId: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-green-400" />
                </div>
                <button onClick={handleAddStudent} disabled={adding}
                  className="mt-3 bg-green-500 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-green-600 transition disabled:opacity-50 text-sm">
                  {adding ? "Adding..." : "Add Student"}
                </button>
              </div>
            )}
            {students.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No students in this class yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {students.map((s: any, i: number) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
                        {s.firstName?.[0]}{s.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-gray-400">{s.studentId}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Attendance</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) } else setCurrentMonth(m => m - 1) }}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">&#8249;</button>
                <span className="text-sm font-semibold text-gray-700">{MONTHS[currentMonth]} {currentYear}</span>
                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) } else setCurrentMonth(m => m + 1) }}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600">&#8250;</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-6">
              {Array.from({ length: firstDay }).map((_, i) => <div key={i} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const isToday = dateStr === todayStr
                const isMarked = markedDates.includes(dateStr)
                const isSelected = selectedDate === dateStr
                return (
                  <button key={day} onClick={() => handleDateClick(day)}
                    className={`relative aspect-square rounded-xl text-sm font-medium flex items-center justify-center transition
                      ${isSelected ? "bg-green-500 text-white" : isToday ? "border-2 border-green-500 text-green-600" : "hover:bg-gray-100 text-gray-700"}`}>
                    {day}
                    {isMarked && !isSelected && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-green-400 rounded-full" />}
                  </button>
                )
              })}
            </div>
            {selectedDate && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">{selectedDate}</h3>
                  {!isPastDate && (
                    <div className="flex gap-2">
                      <button onClick={() => markAll("present")} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold hover:bg-green-200">All Present</button>
                      <button onClick={() => markAll("absent")} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold hover:bg-red-200">All Absent</button>
                    </div>
                  )}
                </div>
                {loadingAttendance ? <p className="text-gray-400 text-sm">Loading...</p> : (
                  <div className="flex flex-col gap-2">
                    {students.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                        <span className="text-sm font-medium text-gray-800">{s.firstName} {s.lastName}</span>
                        {isPastDate ? (
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${attendance[s.id] === "present" ? "bg-green-100 text-green-700" : attendance[s.id] === "late" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            {attendance[s.id] || "absent"}
                          </span>
                        ) : (
                          <div className="flex gap-1">
                            {["present", "absent", "late"].map(status => (
                              <button key={status} onClick={() => setAttendance(prev => ({ ...prev, [s.id]: status }))}
                                className={`text-xs px-2 py-1 rounded-full font-semibold capitalize transition ${attendance[s.id] === status ? (status === "present" ? "bg-green-500 text-white" : status === "late" ? "bg-yellow-500 text-white" : "bg-red-500 text-white") : "bg-gray-200 text-gray-600 hover:bg-gray-300"}`}>
                                {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {!isPastDate && (
                  <button onClick={saveAttendance} disabled={saving}
                    className="mt-4 w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 transition disabled:opacity-50">
                    {saving ? "Saving..." : saved ? "Saved!" : "Save Attendance"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "grades" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800">Grades</h2>
              <button onClick={() => setShowGradeForm(!showGradeForm)}
                className="bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-purple-700 transition">
                {showGradeForm ? "Cancel" : "+ Add Grade"}
              </button>
            </div>
            {showGradeForm && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                {gradeError && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-3">{gradeError}</div>}
                {subjects.length === 0 && <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl px-4 py-3 text-sm mb-3">No subjects added for this class yet. Ask your school admin to add subjects.</div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select value={gradeForm.studentId} onChange={e => setGradeForm({ ...gradeForm, studentId: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400">
                    <option value="">Select student</option>
                    {students.map((s: any) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                  <select value={gradeForm.subjectId} onChange={e => setGradeForm({ ...gradeForm, subjectId: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400">
                    <option value="">Select subject</option>
                    {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input placeholder="Score (%)" type="number" min="0" max="100" value={gradeForm.score}
                    onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400" />
                  <select value={gradeForm.term} onChange={e => setGradeForm({ ...gradeForm, term: e.target.value })}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-purple-400">
                    <option value="">Select term</option>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Third Term">Third Term</option>
                  </select>
                </div>
                <button onClick={handleAddGrade} disabled={addingGrade}
                  className="mt-3 bg-purple-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 text-sm">
                  {addingGrade ? "Saving..." : "Save Grade"}
                </button>
              </div>
            )}
            {grades.length === 0 ? (
              <div className="text-center py-8">
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
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{grade.student?.firstName} {grade.student?.lastName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{grade.subject}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${grade.score >= 70 ? "bg-green-50 text-green-600" : grade.score >= 50 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"}`}>
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
      </div>
    </div>
  )
}
