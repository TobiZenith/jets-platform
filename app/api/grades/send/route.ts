import { NextResponse } from "next/server"
import { Client } from "pg"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import nodemailer from "nodemailer"

function getClient() {
  return new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
}

export async function POST(req: Request) {
  const client = getClient()
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { classId, term } = await req.json()
    if (!classId || !term) return NextResponse.json({ error: "classId and term are required" }, { status: 400 })
    await client.connect()
    const classResult = await client.query(`SELECT * FROM "Class" WHERE id = $1`, [classId])
    if (classResult.rows.length === 0) return NextResponse.json({ error: "Class not found" }, { status: 404 })
    const cls = classResult.rows[0]
    const studentsResult = await client.query(
      `SELECT DISTINCT s.* FROM "Student" s
       JOIN "Grade" g ON g."studentId" = s.id
       WHERE s."classId" = $1 AND g.term = $2 AND g.published = TRUE`,
      [classId, term]
    )
    const students = studentsResult.rows
    if (students.length === 0) return NextResponse.json({ error: "No published results found for this class and term" }, { status: 400 })
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    })
    let sent = 0
    for (const student of students) {
      const gradesResult = await client.query(
        `SELECT * FROM "Grade" WHERE "studentId" = $1 AND term = $2 AND published = TRUE ORDER BY subject`,
        [student.id, term]
      )
      const grades = gradesResult.rows
      if (grades.length === 0) continue
      const parentsResult = await client.query(
        `SELECT p.* FROM "Parent" p JOIN "ParentStudent" ps ON ps."parentId" = p.id WHERE ps."studentId" = $1`,
        [student.id]
      )
      const parents = parentsResult.rows
      if (parents.length === 0) continue
      const totalAvg = (grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length).toFixed(1)
      const gradesHtml = grades.map(g => {
        const color = g.score >= 70 ? "#16a34a" : g.score >= 50 ? "#ca8a04" : "#dc2626"
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${g.subject}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${g.caScore ?? "-"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${g.examScore ?? "-"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;font-weight:bold;">${g.score?.toFixed(1) ?? "-"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;color:${color};font-weight:bold;">${g.gradeLetter ?? "-"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;">${g.remark ?? "-"}</td>
        </tr>`
      }).join("")
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#f59e0b;">JETS Platform - Result Report</h2>
          <p>Dear Parent/Guardian,</p>
          <p>Here are the <strong>${term}</strong> results for <strong>${student.firstName} ${student.lastName}</strong> in <strong>${cls.name}</strong>:</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Subject</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">CA</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Exam</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Total</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Grade</th>
                <th style="padding:10px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Remark</th>
              </tr>
            </thead>
            <tbody>${gradesHtml}</tbody>
          </table>
          <p style="font-weight:bold;">Average: ${totalAvg}%</p>
          <p style="color:#6b7280;font-size:13px;">If you have any questions please contact the school directly.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
          <p style="color:#999;font-size:12px;">JETS School Management Platform</p>
        </div>
      `
      for (const parent of parents) {
        await transporter.sendMail({
          from: `"JETS Platform" <${process.env.EMAIL_USER}>`,
          to: parent.email,
          subject: `${term} Result for ${student.firstName} ${student.lastName} - ${cls.name}`,
          html
        })
        sent++
      }
    }
    return NextResponse.json({ success: true, sent })
  } catch (error) {
    if (error instanceof Error) console.error("Send grades error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  } finally {
    await client.end()
  }
}