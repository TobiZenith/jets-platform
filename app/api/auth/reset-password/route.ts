import { NextResponse } from "next/server"
import { Client } from "pg"
import bcrypt from "bcryptjs"
import crypto from "crypto"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    await client.connect()
    const result = await client.query(
      `SELECT * FROM "PasswordResetToken" WHERE token = $1 AND used = FALSE AND expires > NOW()`,
      [token]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
    const resetToken = result.rows[0]
    const hashed = await bcrypt.hash(password, 10)
    if (resetToken.type === "admin") {
      await client.query(`UPDATE "User" SET password = $1 WHERE email = $2`, [hashed, resetToken.email])
    } else {
      await client.query(`UPDATE "Parent" SET password = $1 WHERE email = $2`, [hashed, resetToken.email])
    }
    await client.query(`UPDATE "PasswordResetToken" SET used = TRUE WHERE token = $1`, [token])
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}
