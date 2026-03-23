import { NextResponse } from "next/server"
import { prisma } from "../../lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { sendEmail, announcementEmailHtml } from "../../lib/sendEmail"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })
    const announcements = await prisma.announcement.findMany({
      where: { schoolId: user?.schoolId! },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(announcements)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email! }
    })

    const body = await req.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Please fill in all fields" }, { status: 400 })
    }

    const announcement = await prisma.announcement.create({
      data: { title, content, schoolId: user?.schoolId! }
    })

    // Send email to all parents of students in this school
    try {
      const school = await prisma.school.findUnique({
        where: { id: user?.schoolId! }
      })

      const students = await prisma.student.findMany({
        where: { schoolId: user?.schoolId! },
        include: { parents: { include: { parent: true } } }
      })

      // Collect unique parent emails
      const parentEmails = new Set<string>()
      for (const student of students) {
        for (const ps of student.parents) {
          parentEmails.add(ps.parent.email)
        }
      }

      for (const email of parentEmails) {
        await sendEmail({
          to: email,
          subject: `New Announcement: ${title}`,
          html: announcementEmailHtml(title, content, school?.name || "Your School")
        })
      }
    } catch (e) {
      console.error("Failed to send announcement emails:", e)
    }

    return NextResponse.json(announcement, { status: 201 })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}