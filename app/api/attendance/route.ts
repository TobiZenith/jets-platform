import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    const attendance = await prisma.attendance.findMany({
      where: { student: { schoolId: user?.schoolId! } },
      include: { student: true },
      orderBy: { date: "desc" }
    })

    return NextResponse.json(attendance)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { studentId, date, status } = body

    if (!studentId || !date || !status) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const attendance = await prisma.attendance.create({
      data: {
        studentId,
        date: new Date(date),
        status,
      }
    })

    return NextResponse.json(attendance, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}