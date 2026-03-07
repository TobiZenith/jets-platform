import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Delete in correct order to avoid foreign key errors
    await prisma.announcement.deleteMany({ where: { schoolId: id } })
    await prisma.timetable.deleteMany({ where: { classId: { in: (await prisma.class.findMany({ where: { schoolId: id }, select: { id: true } })).map(c => c.id) } } })
    await prisma.grade.deleteMany({ where: { student: { schoolId: id } } })
    await prisma.attendance.deleteMany({ where: { student: { schoolId: id } } })
    await prisma.fee.deleteMany({ where: { student: { schoolId: id } } })
    await prisma.parentStudent.deleteMany({ where: { student: { schoolId: id } } })
    await prisma.student.deleteMany({ where: { schoolId: id } })
    await prisma.class.deleteMany({ where: { schoolId: id } })
    await prisma.teacher.deleteMany({ where: { schoolId: id } })
    await prisma.user.deleteMany({ where: { schoolId: id } })
    await prisma.school.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}