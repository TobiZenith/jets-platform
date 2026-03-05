import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const teacher = await prisma.teacher.findUnique({
      where: { id }
    })
    return NextResponse.json(teacher)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch teacher" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { firstName, lastName, email, subject } = body

    if (!firstName || !lastName || !email || !subject) {
      return NextResponse.json({ error: "Please fill in all required fields" }, { status: 400 })
    }

    const teacher = await prisma.teacher.update({
      where: { id },
      data: { firstName, lastName, email, subject }
    })

    return NextResponse.json(teacher)
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.teacher.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error) console.error("Delete error:", error.message)
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 })
  }
}