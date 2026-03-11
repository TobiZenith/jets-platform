import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import bcrypt from "bcryptjs"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cls = await prisma.class.findUnique({
      where: { id },
      include: { students: true, teacher: true }
    })
    return NextResponse.json(cls)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch class" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, level, teacherId, teacherPassword } = body

    if (!name || !level) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const cls = await prisma.class.update({
      where: { id },
      data: { name, level, teacherId: teacherId || null }
    })

    // If a teacher is being assigned and password is provided, set their password
    if (teacherId && teacherPassword) {
      const hashed = await bcrypt.hash(teacherPassword, 10)
      await prisma.teacher.update({
        where: { id: teacherId },
        data: { password: hashed }
      })
    }

    return NextResponse.json(cls)
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.class.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Delete error:", error.message)
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 })
  }
}