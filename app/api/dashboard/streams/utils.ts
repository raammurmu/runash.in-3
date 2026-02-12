import { promises as fs } from "fs"
import path from "path"
import type { DashboardStreamsStore } from "@/lib/types/dashboard-streams"

export const DATA_FILE = path.join(process.cwd(), "data", "streams.json")

const EMPTY_STORE: DashboardStreamsStore = { recent: [], scheduled: [], invites: [] }

export async function readData(): Promise<DashboardStreamsStore> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8")
    const parsed = JSON.parse(raw) as Partial<DashboardStreamsStore>

    return {
      recent: Array.isArray(parsed.recent) ? parsed.recent : [],
      scheduled: Array.isArray(parsed.scheduled) ? parsed.scheduled : [],
      invites: Array.isArray(parsed.invites) ? parsed.invites : [],
    }
  } catch {
    return EMPTY_STORE
  }
}

export async function writeData(data: DashboardStreamsStore) {
  await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8")
}

export function getCanonicalStreamUrl(id: string) {
  const base = (process.env.NEXT_PUBLIC_BASE_URL ?? "").replace(/\/$/, "")
  return `${base}/stream/${id}`
}
