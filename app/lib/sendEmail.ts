import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  await transporter.sendMail({
    from: `"JETS Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

export function attendanceEmailHtml(studentName: string, status: string, date: string) {
  const color = status === "absent" ? "#ef4444" : "#f59e0b"
  const emoji = status === "absent" ? "❌" : "⚠️"
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: ${color};">${emoji} Attendance Alert</h2>
      <p>Dear Parent,</p>
      <p>This is to inform you that <strong>${studentName}</strong> was marked <strong style="color:${color};">${status}</strong> on <strong>${date}</strong>.</p>
      <p>Please contact the school if you have any questions.</p>
      <p style="color:#888;font-size:13px;">— JETS School Platform</p>
    </div>
  `
}

export function feeEmailHtml(studentName: string, description: string, amount: number, dueDate: string, term: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: #2563eb;">💳 Fee Notification</h2>
      <p>Dear Parent,</p>
      <p>A new fee has been added for <strong>${studentName}</strong>:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Description</td><td style="padding:8px;border:1px solid #e5e7eb;">${description}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Amount</td><td style="padding:8px;border:1px solid #e5e7eb;">₦${amount.toLocaleString()}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Term</td><td style="padding:8px;border:1px solid #e5e7eb;">${term}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Due Date</td><td style="padding:8px;border:1px solid #e5e7eb;">${dueDate}</td></tr>
      </table>
      <p style="color:#888;font-size:13px;">— JETS School Platform</p>
    </div>
  `
}

export function gradeEmailHtml(studentName: string, subject: string, score: number, term: string) {
  const color = score >= 70 ? "#16a34a" : score >= 50 ? "#f59e0b" : "#ef4444"
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: #2563eb;">📊 Grade Published</h2>
      <p>Dear Parent,</p>
      <p>A new grade has been recorded for <strong>${studentName}</strong>:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Subject</td><td style="padding:8px;border:1px solid #e5e7eb;">${subject}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Score</td><td style="padding:8px;border:1px solid #e5e7eb;color:${color};font-weight:bold;">${score}%</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Term</td><td style="padding:8px;border:1px solid #e5e7eb;">${term}</td></tr>
      </table>
      <p style="color:#888;font-size:13px;">— JETS School Platform</p>
    </div>
  `
}

export function announcementEmailHtml(title: string, content: string, schoolName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
      <h2 style="color: #2563eb;">📢 New Announcement</h2>
      <p>Dear Parent,</p>
      <p>A new announcement has been posted by <strong>${schoolName}</strong>:</p>
      <div style="background:#f8fafc;border-left:4px solid #2563eb;padding:16px;margin:16px 0;border-radius:4px;">
        <h3 style="margin:0 0 8px 0;">${title}</h3>
        <p style="margin:0;color:#4b5563;">${content}</p>
      </div>
      <p style="color:#888;font-size:13px;">— JETS School Platform</p>
    </div>
  `
}