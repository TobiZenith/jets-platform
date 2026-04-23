import { NextResponse } from "next/server"
import { Client } from "pg"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

async function getUserEmail(req: Request): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.email) return session.user.email
  } catch {}
  return null
}

export async function GET(req: Request) {
  const client = getClient()
  try {
    const email = await getUserEmail(req)
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await client.connect()
    const userResult = await client.query(`SELECT * FROM "User" WHERE email = $1`, [email])
    if (userResult.rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const user = userResult.rows[0]
    const schoolResult = await client.query(`SELECT * FROM "School" WHERE id = $1`, [user.schoolId])
    return NextResponse.json(schoolResult.rows[0] || {})
  } catch (error) {
    if (error instanceof Error) console.error("Settings GET error:", error.message)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  } finally {
    await client.end()
  }
}

export async function PUT(req: Request) {
  const client = getClient()
  try {
    const email = await getUserEmail(req)
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    await client.connect()
    const userResult = await client.query(`SELECT * FROM "User" WHERE email = $1`, [email])
    if (userResult.rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const user = userResult.rows[0]
    const body = await req.json()
    const { schoolName, address, type } = body
    if (!schoolName || !address || !type) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }
    const result = await client.query(
      `UPDATE "School" SET name = $1, address = $2, type = $3, "updatedAt" = NOW() WHERE id = $4 RETURNING *`,
      [schoolName, address, type, user.schoolId]
    )
    return NextResponse.json(result.rows[0])
  } catch (error) {
    if (error instanceof Error) console.error("Settings PUT error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}
