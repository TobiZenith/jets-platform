import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import bcrypt from "bcryptjs"

function generateSchoolCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  let code = "JETS-"
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)]
  for (let i = 0; i < 3; i++) code += numbers[Math.floor(Math.random() * numbers.length)]
  return code
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { schoolName, address, type, firstName, lastName, email, phone, password } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate unique school code
    let schoolCode = generateSchoolCode()
    let codeExists = await prisma.school.findUnique({ where: { code: schoolCode } })
    while (codeExists) {
      schoolCode = generateSchoolCode()
      codeExists = await prisma.school.findUnique({ where: { code: schoolCode } })
    }

    // Create the school
    const school = await prisma.school.create({
      data: {
        name: schoolName,
        address,
        type,
        code: schoolCode,
      }
    })

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "schooladmin",
        schoolId: school.id,
      }
    })

    return NextResponse.json(
      { message: "School registered successfully!" },
      { status: 201 }
    )

  } catch (error) {
    console.error("Registration error:", JSON.stringify(error, null, 2))
    if (error instanceof Error) console.error("Message:", error.message)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
