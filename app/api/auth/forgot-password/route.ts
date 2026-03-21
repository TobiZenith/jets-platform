import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import nodemailer from "nodemailer"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check User table, Teacher table, and Parent table
    const user = await prisma.user.findUnique({ where: { email } })
    const teacher = await prisma.teacher.findUnique({ where: { email } })
    const parent = await prisma.parent.findUnique({ where: { email } })

    if (!user && !teacher && !parent) {
      return NextResponse.json({ message: "If this email exists, a reset link has been sent." })
    }

    // Delete any existing unused tokens for this email
    await prisma.passwordResetToken.deleteMany({ where: { email } })

    // Generate token
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await prisma.passwordResetToken.create({
      data: { email, token, expires, type: "password_reset" }
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    // Debug logs
    console.log("EMAIL_USER:", process.env.EMAIL_USER)
    console.log("EMAIL_PASS:", process.env.EMAIL_PASS)

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    await transporter.sendMail({
      from: `"JETS Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color: #2563eb;">Reset Your Password</h2>
          <p>You requested a password reset. Click the button below to reset your password.</p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
            Reset Password
          </a>
          <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    })

    return NextResponse.json({ message: "If this email exists, a reset link has been sent." })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}