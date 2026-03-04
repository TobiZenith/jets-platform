import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")

    const timetable = await prisma.timetable.findMany({
      where: classId ? { classId } : {},
      include: { teacher: true, class: true },
      orderBy: { day: "asc" }
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

    if (!classId || !day || !subject || !startTime || !endTime || !teacherId) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const entry = await prisma.timetable.create({
      data: { classId, day, subject, startTime, endTime, teacherId }
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await prisma.timetable.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}