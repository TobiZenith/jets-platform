import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import jwt from "jsonwebtoken"
import { Client } from "pg"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")

    const session = await getServerSession(authOptions)

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      const where: any = { student: { schoolId: user?.schoolId! } }
      if (classId) where.student.classId = classId
      const grades = await prisma.grade.findMany({
        where,
        include: { student: true },
        orderBy: { createdAt: "desc" }
      })
      return NextResponse.json(grades)
    }

    // Teacher JWT - use direct pg
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "")
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "jets-super-secret-key-2026") as any

        const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
        await client.connect()

        let query = `
          SELECT g.*, 
            json_build_object(
              'id', s.id,
              'firstName', s."firstName",
              'lastName', s."lastName",
              'studentId', s."studentId"
            ) as student
          FROM "Grade" g
          JOIN "Student" s ON g."studentId" = s.id
          WHERE s."schoolId" = $1
        `
        const params: any[] = [decoded.schoolId]

        if (classId) {
          query += ` AND s."classId" = $2`
          params.push(classId)
        }

        query += ` ORDER BY g."createdAt" DESC`

        const result = await client.query(query, params)
        await client.end()

        return NextResponse.json(result.rows)
      } catch (e) {
        console.error(e)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const authHeader = req.headers.get("authorization")
    const isTeacher = !session && authHeader?.startsWith("Bearer ")

    if (!session && !isTeacher) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { studentId, subject, score, term } = body

    if (!studentId || !subject || !score || !term) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    // Use direct pg for both admin and teacher to avoid adapter issues
    const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
    await client.connect()

    const result = await client.query(
      `INSERT INTO "Grade" (id, "studentId", subject, score, term, "createdAt")
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
       RETURNING *`,
      [studentId, subject, parseFloat(score), term]
    )

    // Get student info
    const studentResult = await client.query(
      `SELECT id, "firstName", "lastName", "studentId" FROM "Student" WHERE id = $1`,
      [studentId]
    )

    await client.end()

    const grade = {
      ...result.rows[0],
      student: studentResult.rows[0]
    }

    return NextResponse.json(grade, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
