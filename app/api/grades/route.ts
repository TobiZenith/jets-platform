import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import jwt from "jsonwebtoken"

async function getSchoolId(req: Request): Promise<string | null> {
  // Try NextAuth session first
  const session = await getServerSession(authOptions)
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    return user?.schoolId || null
  }

  // Try teacher JWT token
  const authHeader = req.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.replace("Bearer ", "")
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "jets-super-secret-key-2026") as any
      return decoded.schoolId || null
    } catch {}
  }

  return null
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")

    const session = await getServerSession(authOptions)

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
      const where: any = { student: { schoolId: user?.schoolId! } }
      if (classId) where.student.classId = classId
      const grades = await prisma.grade.findMany({
        where,
        include: { student: true },
        orderBy: { createdAt: "desc" }
      })
      return NextResponse.json(grades)
    }

    // Teacher JWT
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.replace("Bearer ", "")
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "jets-super-secret-key-2026") as any
        const where: any = { student: { schoolId: decoded.schoolId } }
        if (classId) where.student.classId = classId
        const grades = await prisma.grade.findMany({
          where,
          include: { student: true },
          orderBy: { createdAt: "desc" }
        })
        return NextResponse.json(grades)
      } catch {}
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    // Accept both NextAuth session and teacher JWT
    const session = await getServerSession(authOptions)
    const authHeader = req.headers.get("authorization")
    const isTeacher = !session && authHeader?.startsWith("Bearer ")

    if (!session && !isTeacher) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (isTeacher) {
      try {
        const token = authHeader!.replace("Bearer ", "")
        jwt.verify(token, process.env.NEXTAUTH_SECRET || "jets-super-secret-key-2026")
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const body = await req.json()
    const { studentId, subject, score, term } = body

    if (!studentId || !subject || !score || !term) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const grade = await prisma.grade.create({
      data: {
        studentId,
        subject,
        score: parseFloat(score),
        term,
      },
      include: { student: true }
    })

    return NextResponse.json(grade, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
