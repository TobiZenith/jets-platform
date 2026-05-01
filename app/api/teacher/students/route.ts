import { NextResponse } from "next/server"
import { Client } from "pg"
import crypto from "crypto"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const body = await req.json()
    const { firstName, lastName, studentId, classId, schoolId } = body

    if (!firstName || !lastName || !studentId || !classId || !schoolId) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    await client.connect()

    const existing = await client.query(`SELECT id FROM "Student" WHERE "studentId" = $1`, [studentId])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "A student with this ID already exists" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const result = await client.query(
      `INSERT INTO "Student" (id, "firstName", "lastName", "studentId", "classId", "schoolId", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [id, firstName, lastName, studentId, classId, schoolId]
    )

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Teacher add student error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}
