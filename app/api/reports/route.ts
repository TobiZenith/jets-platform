import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const term = searchParams.get("term")

    if (!studentId || !term) {
      return NextResponse.json({ error: "Student ID and term required" }, { status: 400 })
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        grades: { where: { term } },
        attendance: true,
        class: true,
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 })
  }
}