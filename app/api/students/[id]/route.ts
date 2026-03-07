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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { firstName, lastName, studentId, classId, photo } = body

    if (!firstName || !lastName || !studentId) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

   const student = await prisma.student.update({
      where: { id },
      data: {
        firstName,
        lastName,
        studentId,
        classId: classId || null,
        photo: photo || null,
      }
    })
    
    return NextResponse.json(student)
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.grade.deleteMany({ where: { studentId: id } })
    await prisma.attendance.deleteMany({ where: { studentId: id } })
    await prisma.student.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Delete error:", error.message)
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
  }
}