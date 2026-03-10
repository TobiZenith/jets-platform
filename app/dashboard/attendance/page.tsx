"use client"
import { useState, useEffect } from "react"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]

export default function AttendancePage() {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [classes, setClasses] = useState<any[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [students, setStudents] = useState<any[]>([])
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [markedDates, setMarkedDates] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isPastDate, setIsPastDate] = useState(false)

  // Fetch classes
  useEffect(() => {
    fetch("/api/classes")
      .then(res => res.json())
      .then(data => setClasses(data))
  }, [])

  // Fetch marked dates when month changes
  useEffect(() => {
    const month = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}`
    fetch(`/api/attendance/marked-dates?month=${month}`)
      .then(res => res.json())
      .then(data => setMarkedDates(data))
  }, [currentMonth, currentYear])

  // Fetch students + attendance when date or class changes
  useEffect(() => {
    if (!selectedDate || !selectedClass) return
    setLoading(true)
    setStudents([])
    setAttendance({})

    fetch(`/api/attendance/by-date?date=${selectedDate}&classId=${selectedClass}`)
      .then(res => res.json())
      .then(data => {
        setStudents(data)
        const existing: Record<string, string> = {}
        data.forEach((s: any) => {
          if (s.status) existing[s.id] = s.status
        })
        setAttendance(existing)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [selectedDate, selectedClass])

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateClick = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const clickedDate = new Date(dateStr)
    const todayDate = new Date(today.toDateString())
    setSelectedDate(dateStr)
    setIsPastDate(clickedDate < todayDate)
    setSelectedClass("")
    setStudents([])
    setAttendance({})
    setSaved(false)
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const markAll = (status: string) => {
    const newAttendance: Record<string, string> = {}
    students.forEach(s => { newAttendance[s.id] = status })
    setAttendance(newAttendance)
  }

  const toggleStudent = (studentId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }))
  }

  const saveAttendance = async () => {
    if (!selectedDate || !selectedClass) return
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

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const presentCount = Object.values(attendance).filter(s => s === "present").length
  const absentCount = Object.values(attendance).filter(s => s === "absent").length
  const lateCount = Object.values(attendance).filter(s => s === "late").length

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Attendance</h1>
        <p className="text-gray-400 text-sm mt-1">Click a date to mark or view attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-600">
              ‹
            </button>
            <h2 className="font-bold text-gray-800">{MONTHS[currentMonth]} {currentYear}</h2>
            <button onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition text-gray-600">
              ›
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
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
                  {isMarked && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-500" />
                  )}
                  {isSelected && isMarked && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-400">Attendance marked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-blue-300 bg-blue-50" />
              <span className="text-xs text-gray-400">Today</span>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col gap-4">
          {!selectedDate ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Select a Date</h3>
              <p className="text-gray-400 text-sm">Click any date on the calendar to mark or view attendance</p>
            </div>
          ) : (
            <>
              {/* Date Header */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric"
                      })}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isPastDate ? "📖 Viewing past attendance" : "✏️ Mark attendance for today"}
                    </p>
                  </div>
                  {saved && (
                    <span className="text-green-600 text-sm font-bold bg-green-50 px-3 py-1 rounded-full">✅ Saved!</span>
                  )}
                </div>
              </div>

              {/* Class Selector */}
              <div className="bg-white rounded-2xl shadow-sm p-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Select Class</label>
                <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition">
                  <option value="">Choose a class...</option>
                  {classes.map((cls: any) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
              </div>

              {/* Students */}
              {selectedClass && (
                <div className="bg-white rounded-2xl shadow-sm p-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-400">Loading students...</div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-3xl mb-2">👥</div>
                      <p className="text-gray-400 text-sm">No students in this class</p>
                    </div>
                  ) : (
                    <>
                      {/* Summary */}
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

                      {/* Mark All buttons */}
                      {!isPastDate && (
                        <div className="flex gap-2 mb-4">
                          <button onClick={() => markAll("present")}
                            className="flex-1 text-xs bg-green-50 text-green-600 py-2 rounded-xl hover:bg-green-100 transition font-medium">
                            ✅ All Present
                          </button>
                          <button onClick={() => markAll("absent")}
                            className="flex-1 text-xs bg-red-50 text-red-500 py-2 rounded-xl hover:bg-red-100 transition font-medium">
                            ❌ All Absent
                          </button>
                        </div>
                      )}

                      {/* Student List */}
                      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                        {students.map((student: any) => (
                          <div key={student.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0">
                                {student.photo
                                  ? <img src={student.photo} alt="" className="w-full h-full object-cover" />
                                  : `${student.firstName[0]}${student.lastName[0]}`}
                              </div>
                              <p className="text-sm font-medium text-gray-800">
                                {student.firstName} {student.lastName}
                              </p>
                            </div>
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
                                  <button key={status} onClick={() => toggleStudent(student.id, status)}
                                    className={`text-xs px-2.5 py-1.5 rounded-xl font-medium transition border
                                      ${attendance[student.id] === status
                                        ? status === "present" ? "bg-green-500 text-white border-green-500"
                                          : status === "absent" ? "bg-red-500 text-white border-red-500"
                                          : "bg-yellow-400 text-white border-yellow-400"
                                        : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"}`}>
                                    {status === "present" ? "✅" : status === "absent" ? "❌" : "⏰"}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Save button */}
                      {!isPastDate && (
                        <button onClick={saveAttendance} disabled={saving}
                          className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                          {saving ? "Saving..." : `💾 Save Attendance (${students.length} students)`}
                        </button>
                      )}

                      {/* Edit button for past dates */}
                      {isPastDate && (
                        <button onClick={() => setIsPastDate(false)}
                          className="w-full mt-4 bg-orange-500 text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition">
                          ✏️ Edit This Attendance
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
