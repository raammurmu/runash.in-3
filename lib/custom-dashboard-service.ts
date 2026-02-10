import { getSql } from "@/lib/db/neon"
import type { Dashboard, DashboardLayout, DashboardWidget } from "@/types/custom-dashboard"

interface DashboardRow {
  id: string
  owner_id: string
  name: string
  description: string | null
  widgets: DashboardWidget[] | null
  layout: DashboardLayout | null
  is_shared: boolean
  shared_with: string[] | null
  created_at: string
  updated_at: string
}

export interface CreateCustomDashboardInput {
  ownerId: string
  name: string
  description?: string
  widgets?: DashboardWidget[]
  layout: DashboardLayout
  isShared?: boolean
  sharedWith?: string[]
}

export interface UpdateCustomDashboardInput {
  name?: string
  description?: string
  widgets?: DashboardWidget[]
  layout?: DashboardLayout
  isShared?: boolean
  sharedWith?: string[]
}

function mapRowToDashboard(row: DashboardRow): Dashboard {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    widgets: row.widgets ?? [],
    layout: row.layout ?? { cols: 12, rowHeight: 80, compactType: "vertical" },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isShared: row.is_shared,
    sharedWith: row.shared_with ?? [],
  }
}

export async function getCustomDashboards(userId: string) {
  const sql = getSql()
  const rows = await sql<DashboardRow[]>`
    SELECT *
    FROM custom_dashboards
    WHERE owner_id = ${userId}
      OR (is_shared = true AND shared_with ? ${userId})
    ORDER BY updated_at DESC
  `

  return rows.map(mapRowToDashboard)
}

export async function createCustomDashboard(input: CreateCustomDashboardInput) {
  const sql = getSql()
  const [row] = await sql<DashboardRow[]>`
    INSERT INTO custom_dashboards (
      owner_id,
      name,
      description,
      widgets,
      layout,
      is_shared,
      shared_with
    )
    VALUES (
      ${input.ownerId},
      ${input.name},
      ${input.description ?? null},
      ${JSON.stringify(input.widgets ?? [])}::jsonb,
      ${JSON.stringify(input.layout)}::jsonb,
      ${input.isShared ?? false},
      ${JSON.stringify(input.sharedWith ?? [])}::jsonb
    )
    RETURNING *
  `

  return mapRowToDashboard(row)
}

export async function getCustomDashboardById(id: string, userId: string) {
  const sql = getSql()
  const [row] = await sql<DashboardRow[]>`
    SELECT *
    FROM custom_dashboards
    WHERE id = ${id}
      AND (owner_id = ${userId} OR (is_shared = true AND shared_with ? ${userId}))
    LIMIT 1
  `

  if (!row) {
    return null
  }

  return mapRowToDashboard(row)
}

export async function updateCustomDashboard(id: string, ownerId: string, input: UpdateCustomDashboardInput) {
  const sql = getSql()
  const [row] = await sql<DashboardRow[]>`
    UPDATE custom_dashboards
    SET
      name = COALESCE(${input.name ?? null}, name),
      description = COALESCE(${input.description ?? null}, description),
      widgets = COALESCE(${input.widgets ? JSON.stringify(input.widgets) : null}::jsonb, widgets),
      layout = COALESCE(${input.layout ? JSON.stringify(input.layout) : null}::jsonb, layout),
      is_shared = COALESCE(${input.isShared ?? null}, is_shared),
      shared_with = COALESCE(${input.sharedWith ? JSON.stringify(input.sharedWith) : null}::jsonb, shared_with),
      updated_at = now()
    WHERE id = ${id}
      AND owner_id = ${ownerId}
    RETURNING *
  `

  if (!row) {
    return null
  }

  return mapRowToDashboard(row)
}

export async function deleteCustomDashboard(id: string, ownerId: string) {
  const sql = getSql()
  const result = await sql<{ id: string }[]>`
    DELETE FROM custom_dashboards
    WHERE id = ${id}
      AND owner_id = ${ownerId}
    RETURNING id
  `

  return result.length > 0
}
