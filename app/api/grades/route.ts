import { NextResponse } from "next/server"
import { Client } from "pg"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import jwt from "jsonwebtoken"
import crypto from "crypto"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

async function getSchoolId(req: Request): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email) {
      const client = getClient()
      await client.connect()
      const result = await client.query(`SELECT "schoolId" FROM "User" WHERE email = $1`, [session.user.email])
      await client.end()
      return result.rows[0]?.schoolId || null
    }
  } catch {}
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.replace("Bearer ", "")
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "jets-super-secret-key-2026") as any
      return decoded.schoolId || null
    } catch {}
  }
  return null
}

function calcGrade(total: number, boundaries: any[]) {
  for (const b of boundaries) {
    if (total >= b.min && total <= b.max) return { grade: b.grade, remark: b.remark }
  }
  return { grade: "F", remark: "Fail" }
}

export async function GET(req: Request) {
  const client = getClient()
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    const studentId = searchParams.get("studentId")
    const term = searchParams.get("term")
    const schoolId = await getSchoolId(req)
    if (!schoolId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await client.connect()
    let query = `
      SELECT g.*, 
        json_build_object('id', s.id, 'firstName', s."firstName", 'lastName', s."lastName", 'studentId', s."studentId", 'classId', s."classId") as student
      FROM "Grade" g
      JOIN "Student" s ON g."studentId" = s.id
      WHERE s."schoolId" = $1
    `
    const params: any[] = [schoolId]
    let idx = 2
    if (classId) { query += ` AND s."classId" = $${idx}`; params.push(classId); idx++ }
    if (studentId) { query += ` AND g."studentId" = $${idx}`; params.push(studentId); idx++ }
    if (term) { query += ` AND g.term = $${idx}`; params.push(term); idx++ }
    query += ` ORDER BY s."firstName", s."lastName", g.subject`
    const result = await client.query(query, params)
    return NextResponse.json(result.rows)
  } catch (error) {
    if (error instanceof Error) console.error("GET grades error:", error.message)
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  } finally {
    await client.end()
  }
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const schoolId = await getSchoolId(req)
    if (!schoolId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const { studentId, subject, caScore, examScore, term } = body
    if (!studentId || !subject || caScore === undefined || examScore === undefined || !term) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }
    await client.connect()
    const settingsResult = await client.query(`SELECT * FROM "GradingSettings" WHERE "schoolId" = $1`, [schoolId])
    let caWeight = 40, examWeight = 60
    let boundaries = [
      { grade: "A", min: 70, max: 100, remark: "Excellent" },
      { grade: "B", min: 60, max: 69, remark: "Very Good" },
      { grade: "C", min: 50, max: 59, remark: "Good" },
      { grade: "D", min: 45, max: 49, remark: "Pass" },
      { grade: "E", min: 40, max: 44, remark: "Poor" },
      { grade: "F", min: 0, max: 39, remark: "Fail" }
    ]
    if (settingsResult.rows.length > 0) {
      caWeight = settingsResult.rows[0].caWeight
      examWeight = settingsResult.rows[0].examWeight
      boundaries = settingsResult.rows[0].boundaries
    }
    const total = parseFloat(caScore) + parseFloat(examScore)
    const { grade, remark } = calcGrade(total, boundaries)
    const existing = await client.query(
      `SELECT id FROM "Grade" WHERE "studentId" = $1 AND subject = $2 AND term = $3`,
      [studentId, subject, term]
    )
    let result
    if (existing.rows.length > 0) {
      result = await client.query(
        `UPDATE "Grade" SET "caScore" = $1, "examScore" = $2, score = $3, "gradeLetter" = $4, remark = $5, "updatedAt" = NOW()
         WHERE "studentId" = $6 AND subject = $7 AND term = $8 RETURNING *`,
        [parseFloat(caScore), parseFloat(examScore), total, grade, remark, studentId, subject, term]
      )
    } else {
      const id = crypto.randomUUID()
      result = await client.query(
        `INSERT INTO "Grade" (id, "studentId", subject, "caScore", "examScore", score, "gradeLetter", remark, term, published, "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, NOW()) RETURNING *`,
        [id, studentId, subject, parseFloat(caScore), parseFloat(examScore), total, grade, remark, term]
      )
    }
    const studentResult = await client.query(
      `SELECT id, "firstName", "lastName", "studentId" FROM "Student" WHERE id = $1`, [studentId]
    )
    return NextResponse.json({ ...result.rows[0], student: studentResult.rows[0] }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("POST grades error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}