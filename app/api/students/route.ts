import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: { class: true }
    })
    return NextResponse.json(students)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    const body = await req.json()
   const { firstName, lastName, studentId, classId, photo } = body

    if (!firstName || !lastName || !studentId) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    const existing = await prisma.student.findUnique({
      where: { studentId }
    })

    if (existing) {
      return NextResponse.json({ error: "A student with this ID already exists" }, { status: 400 })
    }

   const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        studentId,
        classId: classId || null,
        schoolId: user?.schoolId!,
        photo: photo || null,
      }
    })

    return NextResponse.json(student, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}