import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { email },
      include: {
        classes: {
          include: {
            students: {
              orderBy: [{ firstName: "asc" }, { lastName: "asc" }]
            }
          }
        },
        school: true
      }
    })

    if (!teacher) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    if (!teacher.password) {
      return NextResponse.json({ error: "No password set. Ask your school admin to assign you a class and password." }, { status: 401 })
    }

    const isValid = await bcrypt.compare(password, teacher.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = jwt.sign(
      { teacherId: teacher.id, schoolId: teacher.schoolId },
      process.env.NEXTAUTH_SECRET || "jets-super-secret-key-2026",
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      token,
      teacher: {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        subject: teacher.subject,
        schoolId: teacher.schoolId,
        schoolName: teacher.school?.name,
        classes: teacher.classes
      }
    })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
