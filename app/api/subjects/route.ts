import { NextResponse } from "next/server"
import { Client } from "pg"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import crypto from "crypto"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function GET(req: Request) {
  const client = getClient()
  try {
    const { searchParams } = new URL(req.url)
    const classId = searchParams.get("classId")
    if (!classId) return NextResponse.json({ error: "classId is required" }, { status: 400 })
    await client.connect()
    const result = await client.query(
      `SELECT * FROM "Subject" WHERE "classId" = $1 ORDER BY name ASC`,
      [classId]
    )
    return NextResponse.json(result.rows)
  } catch (error) {
    if (error instanceof Error) console.error("Subjects GET error:", error.message)
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  } finally {
    await client.end()
  }
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const body = await req.json()
    const { name, classId } = body
    if (!name || !classId) return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    await client.connect()
    const userResult = await client.query(`SELECT * FROM "User" WHERE email = $1`, [session.user?.email])
    const user = userResult.rows[0]
    const id = crypto.randomUUID()
    const result = await client.query(
      `INSERT INTO "Subject" (id, name, "classId", "schoolId", "createdAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [id, name, classId, user.schoolId]
    )
    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Subjects POST error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}

export async function DELETE(req: Request) {
  const client = getClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })
    await client.connect()
    await client.query(`DELETE FROM "Subject" WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Subjects DELETE error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}
