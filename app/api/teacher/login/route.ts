import { NextResponse } from "next/server"
import { Client } from "pg"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    await client.connect()

    const result = await client.query(
      `SELECT t.*, s.name as "schoolName" 
       FROM "Teacher" t 
       LEFT JOIN "School" s ON t."schoolId" = s.id 
       WHERE t.email = $1`,
      [email]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const teacher = result.rows[0]

    if (!teacher.password) {
      return NextResponse.json({ error: "No password set. Ask your school admin to assign you a class and password." }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, teacher.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Get teacher's classes with students
    const classResult = await client.query(
      `SELECT c.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'firstName', s."firstName",
              'lastName', s."lastName",
              'studentId', s."studentId",
              'photo', s.photo
            ) ORDER BY s."firstName", s."lastName"
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) as students
       FROM "Class" c
       LEFT JOIN "Student" s ON s."classId" = c.id
       WHERE c."teacherId" = $1
       GROUP BY c.id`,
      [teacher.id]
    )

    const token = jwt.sign(
      { teacherId: teacher.id, schoolId: teacher.schoolId },
      process.env.NEXTAUTH_SECRET || "jets-super-secret-key-2026",
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      token,
      teacher: {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        subject: teacher.subject,
        schoolId: teacher.schoolId,
        schoolName: teacher.schoolName,
        classes: classResult.rows
      }
    })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}
