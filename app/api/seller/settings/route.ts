import { type NextRequest, NextResponse } from "next/server"
import { getSql } from "@/lib/db/neon"

type SellerSettingsPayload = {
  businessName?: string
  businessType?: string
  description?: string
  businessHours?: string
  deliveryRadius?: string
  minimumOrder?: string
  returnPolicy?: string
  paymentMethods?: string[]
  shippingOptions?: string[]
  certifications?: string[]
}

const defaultSettings: Required<SellerSettingsPayload> = {
  businessName: "",
  businessType: "organic-farm",
  description: "",
  businessHours: "",
  deliveryRadius: "",
  minimumOrder: "",
  returnPolicy: "",
  paymentMethods: ["credit_card"],
  shippingOptions: ["local_delivery"],
  certifications: [],
}

export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.headers.get("x-user-id") || 1)
    const sql = getSql()

    const [row] = await sql/* sql */`
      SELECT id, name, bio, role
      FROM public.users
      WHERE id = ${userId}
        AND role = 'seller'
      LIMIT 1
    `

    if (!row) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }

    let parsedBio: Record<string, any> = {}
    if (row.bio) {
      try {
        parsedBio = typeof row.bio === "string" ? JSON.parse(row.bio) : row.bio
      } catch {
        parsedBio = {}
      }
    }

    const settings = {
      ...defaultSettings,
      ...(parsedBio?.sellerSettings || {}),
      businessName: parsedBio?.sellerSettings?.businessName || row.name || defaultSettings.businessName,
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load seller settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = Number(request.headers.get("x-user-id") || 1)
    const payload = (await request.json()) as SellerSettingsPayload
    const sql = getSql()

    const [row] = await sql/* sql */`
      SELECT id, bio
      FROM public.users
      WHERE id = ${userId}
        AND role = 'seller'
      LIMIT 1
    `

    if (!row) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 })
    }

    let parsedBio: Record<string, any> = {}
    if (row.bio) {
      try {
        parsedBio = typeof row.bio === "string" ? JSON.parse(row.bio) : row.bio
      } catch {
        parsedBio = {}
      }
    }

    const mergedSettings = {
      ...defaultSettings,
      ...(parsedBio?.sellerSettings || {}),
      ...payload,
    }

    const mergedBio = {
      ...parsedBio,
      sellerSettings: mergedSettings,
    }

    const [updated] = await sql/* sql */`
      UPDATE public.users
      SET bio = ${JSON.stringify(mergedBio)}, updated_at = NOW()
      WHERE id = ${userId}
        AND role = 'seller'
      RETURNING id
    `

    if (!updated) {
      return NextResponse.json({ error: "Unable to update seller settings" }, { status: 500 })
    }

    return NextResponse.json(mergedSettings)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update seller settings" }, { status: 500 })
  }
}
