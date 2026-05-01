import { NextResponse } from "next/server"
import { Client } from "pg"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import crypto from "crypto"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function GET() {
  const client = getClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await client.connect()
    const userResult = await client.query(`SELECT * FROM "User" WHERE email = $1`, [session.user?.email])
    const user = userResult.rows[0]
    const result = await client.query(`SELECT * FROM "GradingSettings" WHERE "schoolId" = $1`, [user.schoolId])
    if (result.rows.length === 0) {
      return NextResponse.json({
        caWeight: 40,
        examWeight: 60,
        boundaries: [
          { grade: "A", min: 70, max: 100, remark: "Excellent" },
         { grade: "B", min: 60, max: 69, remark: "Very Good" },
         { grade: "C", min: 50, max: 59, remark: "Good" },
         { grade: "D", min: 45, max: 49, remark: "Pass" },
        { grade: "E", min: 40, max: 44, remark: "Poor" },
         { grade: "F", min: 0, max: 39, remark: "Fail" }
        ]
      })
    }
    return NextResponse.json(result.rows[0])
  } catch (error) {
    if (error instanceof Error) console.error("GradingSettings GET error:", error.message)
    return NextResponse.json({ error: "Failed to fetch grading settings" }, { status: 500 })
  } finally {
    await client.end()
  }
}

export async function PUT(req: Request) {
  const client = getClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await client.connect()
    const userResult = await client.query(`SELECT * FROM "User" WHERE email = $1`, [session.user?.email])
    const user = userResult.rows[0]
    const body = await req.json()
    const { caWeight, examWeight, boundaries } = body
    if (caWeight + examWeight !== 100) {
      return NextResponse.json({ error: "CA weight and Exam weight must add up to 100" }, { status: 400 })
    }
    const existing = await client.query(`SELECT id FROM "GradingSettings" WHERE "schoolId" = $1`, [user.schoolId])
    if (existing.rows.length === 0) {
      const id = crypto.randomUUID()
      await client.query(
        `INSERT INTO "GradingSettings" (id, "schoolId", "caWeight", "examWeight", boundaries, "updatedAt") VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
        [id, user.schoolId, caWeight, examWeight, JSON.stringify(boundaries)]
      )
    } else {
      await client.query(
        `UPDATE "GradingSettings" SET "caWeight" = $1, "examWeight" = $2, boundaries = $3::jsonb, "updatedAt" = NOW() WHERE "schoolId" = $4`,
        [caWeight, examWeight, JSON.stringify(boundaries), user.schoolId]
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("GradingSettings PUT error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}