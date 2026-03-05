import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

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

    return NextResponse.json({ student, grades, attendance })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch student" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Delete related records first
    await prisma.grade.deleteMany({ where: { studentId: id } })
    await prisma.attendance.deleteMany({ where: { studentId: id } })
    
    // Then delete the student
    await prisma.student.delete({ where: { id } })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Delete error:", error.message)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}