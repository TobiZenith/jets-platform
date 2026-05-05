import { NextResponse } from "next/server"
import { Client } from "pg"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { studentId, term, publish } = await req.json()
    if (!studentId || !term) return NextResponse.json({ error: "studentId and term are required" }, { status: 400 })
    await client.connect()
    await client.query(
      `UPDATE "Grade" SET published = $1 WHERE "studentId" = $2 AND term = $3`,
      [publish, studentId, term]
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Publish grades error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}