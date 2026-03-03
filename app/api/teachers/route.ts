import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany()
    return NextResponse.json(teachers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 })
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
    const { firstName, lastName, email, subject } = body

    if (!firstName || !lastName || !email || !subject) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    const existing = await prisma.teacher.findUnique({
      where: { email }
    })

    if (existing) {
      return NextResponse.json({ error: "A teacher with this email already exists" }, { status: 400 })
    }

    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        email,
        subject,
        schoolId: user?.schoolId!,
      }
    })

    return NextResponse.json(teacher, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}