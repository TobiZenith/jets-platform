import { NextResponse } from "next/server"
import { Client } from "pg"
import bcrypt from "bcryptjs"
import crypto from "crypto"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

function generateSchoolCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const numbers = "0123456789"
  let code = "JETS-"
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)]
  for (let i = 0; i < 3; i++) code += numbers[Math.floor(Math.random() * numbers.length)]
  return code
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const body = await req.json()
    const { schoolName, address, type, firstName, lastName, email, phone, password } = body

    await client.connect()

    const existingUser = await client.query(`SELECT id FROM "User" WHERE email = $1`, [email])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    let schoolCode = generateSchoolCode()
    let codeExists = await client.query(`SELECT id FROM "School" WHERE code = $1`, [schoolCode])
    while (codeExists.rows.length > 0) {
      schoolCode = generateSchoolCode()
      codeExists = await client.query(`SELECT id FROM "School" WHERE code = $1`, [schoolCode])
    }

    const schoolId = crypto.randomUUID()
    await client.query(
      `INSERT INTO "School" (id, name, address, type, code, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [schoolId, schoolName, address, type, schoolCode]
    )

    const userId = crypto.randomUUID()
    await client.query(
      `INSERT INTO "User" (id, "firstName", "lastName", email, password, role, "schoolId", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [userId, firstName, lastName, email, hashedPassword, "schooladmin", schoolId]
    )

    return NextResponse.json({ message: "School registered successfully!" }, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Registration error:", error.message)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  } finally {
    await client.end()
  }
}

