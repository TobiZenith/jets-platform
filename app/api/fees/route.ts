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

    const fees = await prisma.fee.findMany({
      where: { student: { schoolId: user?.schoolId! } },
      include: { student: true },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(fees)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { studentId, amount, description, dueDate, term } = body

    if (!studentId || !amount || !description || !dueDate || !term) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const fee = await prisma.fee.create({
      data: {
        studentId,
        amount: parseFloat(amount),
        description,
        dueDate: new Date(dueDate),
        term,
        status: "unpaid"
      },
      include: { student: true }
    })

    return NextResponse.json(fee, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}