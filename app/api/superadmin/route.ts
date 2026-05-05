import { NextResponse } from "next/server"
import { Client } from "pg"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function GET() {
  const client = getClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== "superadmin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    await client.connect()
    const schoolsResult = await client.query(`
      SELECT s.*,
        (SELECT COUNT(*) FROM "Student" st WHERE st."schoolId" = s.id) as "studentCount",
        (SELECT COUNT(*) FROM "Teacher" t WHERE t."schoolId" = s.id) as "teacherCount",
        (SELECT COUNT(*) FROM "Class" c WHERE c."schoolId" = s.id) as "classCount"
      FROM "School" s
      ORDER BY s."createdAt" DESC
    `)
    const totalStudents = await client.query(`SELECT COUNT(*) as count FROM "Student"`)
    const totalTeachers = await client.query(`SELECT COUNT(*) as count FROM "Teacher"`)
    return NextResponse.json({
      schools: schoolsResult.rows,
      totalStudents: parseInt(totalStudents.rows[0].count),
      totalTeachers: parseInt(totalTeachers.rows[0].count),
      totalSchools: schoolsResult.rows.length
    })
  } catch (error) {
    if (error instanceof Error) console.error("Superadmin GET error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}