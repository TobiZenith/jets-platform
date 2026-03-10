import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")
    const classId = searchParams.get("classId")

    if (!date || !classId) {
      return NextResponse.json({ error: "Missing date or classId" }, { status: 400 })
    }

    // Get all students in this class
    const students = await prisma.student.findMany({
      where: { classId, schoolId: user?.schoolId! },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }]
    })

    // Get attendance records for this date + these students
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const records = await prisma.attendance.findMany({
      where: {
        studentId: { in: students.map(s => s.id) },
        date: { gte: startOfDay, lte: endOfDay }
      }
    })

    // Merge students with their attendance status
    const result = students.map(student => ({
      ...student,
      status: records.find(r => r.studentId === student.id)?.status || null
    }))

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}