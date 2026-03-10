import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { records, date } = body
    // records = [{ studentId, status }]

    if (!records || !date) {
      return NextResponse.json({ error: "Missing records or date" }, { status: 400 })
    }

    // Delete existing records for this date + these students (to allow re-marking)
    const studentIds = records.map((r: any) => r.studentId)
    await prisma.attendance.deleteMany({
      where: {
        studentId: { in: studentIds },
        date: new Date(date)
      }
    })

    // Create all records at once
    await prisma.attendance.createMany({
      data: records.map((r: any) => ({
        studentId: r.studentId,
        status: r.status,
        date: new Date(date)
      }))
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}