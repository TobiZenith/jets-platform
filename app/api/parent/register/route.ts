import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, password, studentId } = body

    if (!firstName || !lastName || !email || !password || !studentId) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    // Check if parent already exists
    const existingParent = await prisma.parent.findUnique({
      where: { email }
    })

    if (existingParent) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { studentId }
    })

    if (!student) {
      return NextResponse.json({ error: "Student ID not found. Please check with your school admin." }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create parent
    const parent = await prisma.parent.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || "",
        password: hashedPassword,
        children: {
          create: {
            studentId: student.id
          }
        }
      }
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}