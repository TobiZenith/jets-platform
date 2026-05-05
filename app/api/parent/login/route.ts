import { NextResponse } from "next/server"
import { Client } from "pg"
import bcrypt from "bcryptjs"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    await client.connect()
    const result = await client.query(`SELECT * FROM "Parent" WHERE email = $1`, [email])
    if (result.rows.length === 0) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    const parent = result.rows[0]
    const isValid = await bcrypt.compare(password, parent.password)
    if (!isValid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    const childrenResult = await client.query(
      `SELECT s.*, c.name as "className", sc.name as "schoolName"
       FROM "ParentStudent" ps
       JOIN "Student" s ON s.id = ps."studentId"
       JOIN "Class" c ON c.id = s."classId"
       JOIN "School" sc ON sc.id = s."schoolId"
       WHERE ps."parentId" = $1`,
      [parent.id]
    )
    return NextResponse.json({
      parent: {
        id: parent.id,
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
        phone: parent.phone,
        children: childrenResult.rows
      }
    })
  } catch (error) {
    if (error instanceof Error) console.error("Parent login error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}