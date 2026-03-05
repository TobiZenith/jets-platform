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

    const parent = await prisma.parent.findUnique({
      where: { email },
      include: {
        children: {
          include: {
            student: true
          }
        }
      }
    })

    if (!parent) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, parent.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = jwt.sign(
      { id: parent.id, email: parent.email },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: "7d" }
    )

    return NextResponse.json({
      token,
      parent: {
        id: parent.id,
        firstName: parent.firstName,
        lastName: parent.lastName,
        email: parent.email,
        children: parent.children
      }
    })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
