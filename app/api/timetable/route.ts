import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")

    if (!classId) return NextResponse.json([])

    const timetable = await prisma.timetable.findMany({
      where: { classId },
      include: { teacher: true },
      orderBy: { startTime: "asc" }
    })

    return NextResponse.json(timetable)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch timetable" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { classId, day, subject, startTime, endTime, teacherId } = body

    if (!classId || !day || !subject || !startTime || !endTime) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    const slot = await prisma.timetable.create({
      data: {
        classId,
        day,
        subject,
        startTime,
        endTime,
        teacherId: teacherId || null
      },
      include: { teacher: true }
    })

    return NextResponse.json(slot, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}