import { NextResponse } from "next/server"
import { Client } from "pg"
import nodemailer from "nodemailer"
import crypto from "crypto"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const { email, type } = await req.json()
    if (!email || !type) return NextResponse.json({ error: "Email is required" }, { status: 400 })
    await client.connect()
    let user
    if (type === "admin") {
      const result = await client.query(`SELECT * FROM "User" WHERE email = $1`, [email])
      user = result.rows[0]
    } else {
      const result = await client.query(`SELECT * FROM "Parent" WHERE email = $1`, [email])
      user = result.rows[0]
    }
    if (!user) return NextResponse.json({ error: "No account found with this email" }, { status: 404 })
    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60)
    const id = crypto.randomUUID()
    await client.query(
      `INSERT INTO "PasswordResetToken" (id, email, token, type, expires) VALUES ($1, $2, $3, $4, $5)`,
      [id, email, token, type, expires]
    )
    const baseUrl = process.env.NEXTAUTH_URL || "https://jets-platform.vercel.app"
    const resetUrl = type === "admin" ? `${baseUrl}/reset-password?token=${token}` : `${baseUrl}/parent/reset-password?token=${token}`
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
    await transporter.sendMail({
      from: `"JETS Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password - JETS Platform",
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;"><h2 style="color:#f59e0b;">JETS Platform - Password Reset</h2><p>Hello ${user.firstName},</p><p>You requested a password reset. Click the button below:</p><a href="${resetUrl}" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">Reset Password</a><p>This link expires in <strong>1 hour</strong>.</p><p>If you did not request this, ignore this email.</p></div>`
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}
