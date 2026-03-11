import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, studentId, classId, schoolId } = body

    if (!firstName || !lastName || !studentId || !classId || !schoolId) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    const existing = await prisma.student.findUnique({ where: { studentId } })
    if (existing) {
      return NextResponse.json({ error: "A student with this ID already exists" }, { status: 400 })
    }

    const student = await prisma.student.create({
      data: { firstName, lastName, studentId, classId, schoolId }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}