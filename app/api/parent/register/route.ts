import { NextResponse } from "next/server"
import { Client } from "pg"
import bcrypt from "bcryptjs"
import crypto from "crypto"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, password, studentId, schoolCode } = body

    if (!firstName || !lastName || !email || !password || !studentId || !schoolCode) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    await client.connect()

    const schoolResult = await client.query(`SELECT * FROM "School" WHERE code = $1`, [schoolCode])
    if (schoolResult.rows.length === 0) {
      return NextResponse.json({ error: "Invalid school code. Please check with your school admin." }, { status: 400 })
    }
    const school = schoolResult.rows[0]

    const studentResult = await client.query(
      `SELECT * FROM "Student" WHERE "studentId" = $1 AND "schoolId" = $2`,
      [studentId, school.id]
    )
    if (studentResult.rows.length === 0) {
      return NextResponse.json({ error: "Student ID not found in this school. Please check with your admin." }, { status: 400 })
    }
    const student = studentResult.rows[0]

    const existingParent = await client.query(`SELECT id FROM "Parent" WHERE email = $1`, [email])
    if (existingParent.rows.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const parentId = crypto.randomUUID()
    const linkId = crypto.randomUUID()

    await client.query(
      `INSERT INTO "Parent" (id, "firstName", "lastName", email, phone, password, "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [parentId, firstName, lastName, email, phone || "", hashedPassword]
    )

    await client.query(
      `INSERT INTO "ParentStudent" (id, "parentId", "studentId") VALUES ($1, $2, $3)`,
      [linkId, parentId, student.id]
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Parent register error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}