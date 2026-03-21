import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { firstName, lastName, email, phone, password, studentIds, schoolCode } = body

    if (!firstName || !lastName || !email || !password || !schoolCode || !studentIds || studentIds.length === 0) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    // Check if school exists
    const school = await prisma.school.findFirst({ where: { code: schoolCode } })
    if (!school) {
      return NextResponse.json({ error: "Invalid school code. Please check with your school admin." }, { status: 400 })
    }

    // Validate all student IDs
    const students = []
    for (const studentId of studentIds) {
      const student = await prisma.student.findUnique({ where: { studentId } })
      if (!student || student.schoolId !== school.id) {
        return NextResponse.json({ error: `Student ID "${studentId}" not found in this school.` }, { status: 400 })
      }
      students.push(student)
    }

    // Check if parent already exists
    const existingParent = await prisma.parent.findUnique({ where: { email } })
    if (existingParent) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create parent with all children
    await prisma.parent.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || "",
        password: hashedPassword,
        children: {
          create: students.map(student => ({ studentId: student.id }))
        }
      }
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}