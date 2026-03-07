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

    const announcements = await prisma.announcement.findMany({
      where: { schoolId: user?.schoolId! },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(announcements)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
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
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        schoolId: user?.schoolId!,
      }
    })

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

