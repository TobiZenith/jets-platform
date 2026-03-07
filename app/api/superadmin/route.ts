import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: {
            students: true,
            teachers: true,
            classes: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    const totalStudents = await prisma.student.count()
    const totalTeachers = await prisma.teacher.count()
    const totalSchools = schools.length

    return NextResponse.json({ schools, totalStudents, totalTeachers, totalSchools })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}