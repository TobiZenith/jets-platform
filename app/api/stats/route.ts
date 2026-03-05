import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"

export async function GET() {
  try {
    const [students, teachers, classes, announcements] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.announcement.count(),
    ])

    return NextResponse.json({ students, teachers, classes, announcements })
  } catch (error) {
    return NextResponse.json({ students: 0, teachers: 0, classes: 0, announcements: 0 })
  }
}