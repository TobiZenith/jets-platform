import { NextResponse } from "next/server"
import { prisma } from "../../../../lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const student = await prisma.student.findUnique({
      where: { id },
      include: { class: true }
    })

    const grades = await prisma.grade.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" }
    })

    const attendance = await prisma.attendance.findMany({
      where: { studentId: id },
      orderBy: { date: "desc" }
    })

    const announcements = await prisma.announcement.findMany({
      where: { schoolId: student?.schoolId },
      orderBy: { createdAt: "desc" },
      take: 5
    })

    return NextResponse.json({ student, grades, attendance, announcements })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}