import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    const { searchParams } = new URL(req.url)
    const month = searchParams.get("month") // format: "2026-03"

    if (!month) return NextResponse.json([])

    const startDate = new Date(`${month}-01`)
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0)

    const records = await prisma.attendance.findMany({
      where: {
        student: { schoolId: user?.schoolId! },
        date: { gte: startDate, lte: endDate }
      },
      select: { date: true },
      distinct: ["date"]
    })

    const dates = records.map(r => r.date.toISOString().split("T")[0])
    return NextResponse.json(dates)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch marked dates" }, { status: 500 })
  }
}