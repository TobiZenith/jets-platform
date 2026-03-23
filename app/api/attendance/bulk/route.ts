import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { sendEmail, attendanceEmailHtml } from "../../../lib/sendEmail"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    const { records, date } = body

    if (!records || !date) {
      return NextResponse.json({ error: "Missing records or date" }, { status: 400 })
    }

    const studentIds = records.map((r: any) => r.studentId)

    await prisma.attendance.deleteMany({
      where: { studentId: { in: studentIds }, date: new Date(date) }
    })

    await prisma.attendance.createMany({
      data: records.map((r: any) => ({
        studentId: r.studentId,
        status: r.status,
        date: new Date(date)
      }))
    })

    // Send email notifications for absent/late students
    const alertRecords = records.filter((r: any) => r.status === "absent" || r.status === "late")

    for (const record of alertRecords) {
      try {
        const student = await prisma.student.findUnique({
          where: { id: record.studentId },
          include: {
            parents: {
              include: { parent: true }
            }
          }
        })

        if (!student) continue

        const studentName = `${student.firstName} ${student.lastName}`
        const formattedDate = new Date(date).toLocaleDateString("en-GB", {
          weekday: "long", year: "numeric", month: "long", day: "numeric"
        })

        for (const ps of student.parents) {
          await sendEmail({
            to: ps.parent.email,
            subject: `Attendance Alert: ${studentName} was marked ${record.status}`,
            html: attendanceEmailHtml(studentName, record.status, formattedDate)
          })
        }
      } catch (e) {
        console.error("Failed to send attendance email:", e)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}