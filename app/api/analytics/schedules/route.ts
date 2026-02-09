import { type NextRequest, NextResponse } from "next/server"
import { addSchedule, listSchedules, removeSchedule } from "@/lib/scheduler"

export async function GET() {
  try {
    const schedules = await listSchedules()
    return NextResponse.json(schedules)
  } catch (error) {
    console.error("schedules api error", error)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, frequency, recipients, format } = body

    if (!name || !frequency) {
      return NextResponse.json({ error: "name and frequency required" }, { status: 400 })
    }

    const created = await addSchedule({ name, frequency, recipients, format })
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("schedules api error", error)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    const removed = await removeSchedule(id)
    return NextResponse.json({ removed })
  } catch (error) {
    console.error("schedules api error", error)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
