import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME)
console.log("API Key:", process.env.CLOUDINARY_API_KEY)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`

    const result = await cloudinary.uploader.upload(base64, {
      folder: "jets-students",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }]
    })

    return NextResponse.json({ url: result.secure_url })
  } catch (error) {
    if (error instanceof Error) console.error("Error:", error.message)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}