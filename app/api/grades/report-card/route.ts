import { NextResponse } from "next/server"
import { Client } from "pg"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function GET(req: Request) {
  const client = getClient()
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const term = searchParams.get("term")
    if (!studentId || !term) return NextResponse.json({ error: "studentId and term are required" }, { status: 400 })
    await client.connect()
    const studentResult = await client.query(
      `SELECT s.*, c.name as "className", sc.name as "schoolName", sc.address as "schoolAddress"
       FROM "Student" s
       JOIN "Class" c ON c.id = s."classId"
       JOIN "School" sc ON sc.id = s."schoolId"
       WHERE s.id = $1`,
      [studentId]
    )
    if (studentResult.rows.length === 0) return NextResponse.json({ error: "Student not found" }, { status: 404 })
    const student = studentResult.rows[0]
    const gradesResult = await client.query(
      `SELECT * FROM "Grade" WHERE "studentId" = $1 AND term = $2 AND published = TRUE ORDER BY subject`,
      [studentId, term]
    )
    const grades = gradesResult.rows
    const settingsResult = await client.query(
      `SELECT * FROM "GradingSettings" WHERE "schoolId" = $1`,
      [student.schoolId]
    )
    const settings = settingsResult.rows[0] || { caWeight: 40, examWeight: 60 }
    const totalStudentsResult = await client.query(
      `SELECT COUNT(*) as count FROM "Student" WHERE "classId" = $1`,
      [student.classId]
    )
    const totalStudents = totalStudentsResult.rows[0].count
    const avg = grades.length > 0 ? (grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length).toFixed(1) : "0"
    return NextResponse.json({
      student,
      grades,
      settings,
      totalStudents,
      avg,
      term
    })
  } catch (error) {
    if (error instanceof Error) console.error("Report card error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}