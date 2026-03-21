import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Find token
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    }

    if (resetToken.used) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 })
    }

    if (new Date() > resetToken.expires) {
      return NextResponse.json({ error: "This reset link has expired" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { email } = resetToken

    // Update whichever table the email belongs to
    const user = await prisma.user.findUnique({ where: { email } })
    const teacher = await prisma.teacher.findUnique({ where: { email } })
    const parent = await prisma.parent.findUnique({ where: { email } })

    if (user) await prisma.user.update({ where: { email }, data: { password: hashedPassword } })
    if (teacher) await prisma.teacher.update({ where: { email }, data: { password: hashedPassword } })
    if (parent) await prisma.parent.update({ where: { email }, data: { password: hashedPassword } })

    // Mark token as used
    await prisma.passwordResetToken.update({ where: { token }, data: { used: true } })

    return NextResponse.json({ message: "Password reset successfully" })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}