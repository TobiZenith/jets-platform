import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const term = searchParams.get("term")

    if (!studentId || !term) {
      return NextResponse.json({ error: "Missing studentId or term" }, { status: 400 })
    }

    // Fetch student with class and school separately
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        school: true
      }
    })

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    // Fetch grades for this term
    const grades = await prisma.grade.findMany({
      where: { studentId, term }
    })

    // Fetch all attendance (no term field in schema)
    const attendance = await prisma.attendance.findMany({
      where: { studentId }
    })

    const totalAttendance = attendance.length
    const presentCount = attendance.filter((a: any) => a.status === "present").length
    const absentCount = attendance.filter((a: any) => a.status === "absent").length
    const attendancePercentage = totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0

    const totalScore = grades.reduce((sum: number, g: any) => sum + g.score, 0)
    const averageScore = grades.length > 0
      ? Math.round(totalScore / grades.length)
      : 0

    const overallRemark = averageScore >= 70
      ? "Excellent"
      : averageScore >= 50
      ? "Good"
      : "Needs Improvement"

    return NextResponse.json({
      student: {
        name: `${student.firstName} ${student.lastName}`,
        studentId: student.studentId,
        class: student.class?.name || "N/A",
        school: student.school?.name || "N/A"
      },
      term,
      grades,
      attendance: {
        total: totalAttendance,
        present: presentCount,
        absent: absentCount,
        percentage: attendancePercentage
      },
      averageScore,
      overallRemark
    })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}