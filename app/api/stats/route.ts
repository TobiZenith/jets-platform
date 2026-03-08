import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ students: 0, teachers: 0, classes: 0, announcements: 0 })

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    const schoolId = user?.schoolId!

    const [students, teachers, classes, announcements] = await Promise.all([
      prisma.student.count({ where: { schoolId } }),
      prisma.teacher.count({ where: { schoolId } }),
      prisma.class.count({ where: { schoolId } }),
      prisma.announcement.count({ where: { schoolId } }),
    ])

    return NextResponse.json({ students, teachers, classes, announcements })
  } catch (error) {
    return NextResponse.json({ students: 0, teachers: 0, classes: 0, announcements: 0 })
  }
}
