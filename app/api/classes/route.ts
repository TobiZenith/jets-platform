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

    const classes = await prisma.class.findMany({
      where: { schoolId: user?.schoolId! },
      include: {
        teacher: true,
        _count: { select: { students: true } }
      },
      orderBy: { name: "asc" }
    })

    return NextResponse.json(classes)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
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
    const { name, level } = body

    if (!name || !level) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const newClass = await prisma.class.create({
      data: { name, level, schoolId: user?.schoolId! }
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
