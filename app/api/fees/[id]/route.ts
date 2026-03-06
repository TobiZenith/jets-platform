import { NextResponse } from "next/server"
import { prisma } from "../../../lib/prisma"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const { status } = body

    const fee = await prisma.fee.update({
      where: { id },
      data: {
        status,
        paidDate: status === "paid" ? new Date() : null
      }
    })

    return NextResponse.json(fee)
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}