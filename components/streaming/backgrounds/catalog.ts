export type BackgroundCategoryId = "featured" | "office" | "nature" | "abstract" | "gradients" | "tech" | "custom"

export interface BackgroundCategory {
  id: BackgroundCategoryId
  name: string
}

export interface BackgroundAsset {
  id: string
  name: string
  url: string
  categories: BackgroundCategoryId[]
}

export const BACKGROUND_CATEGORIES: BackgroundCategory[] = [
  { id: "featured", name: "Featured" },
  { id: "office", name: "Office" },
  { id: "nature", name: "Nature" },
  { id: "abstract", name: "Abstract" },
  { id: "gradients", name: "Gradients" },
  { id: "tech", name: "Tech" },
  { id: "custom", name: "My Uploads" },
]

export const BACKGROUND_CATALOG: BackgroundAsset[] = [
  {
    id: "featured-runash-gradient",
    name: "RunAsh Orange Glow",
    url: "/backgrounds/runash-orange-gradient.svg",
    categories: ["featured", "gradients"],
  },
  {
    id: "featured-studio-white",
    name: "White Studio Glow",
    url: "/backgrounds/white-studio-glow.svg",
    categories: ["featured", "office"],
  },
  {
    id: "featured-tech-grid",
    name: "Tech Grid Dark",
    url: "/backgrounds/tech-grid-dark.svg",
    categories: ["featured", "tech"],
  },
  {
    id: "office-minimal",
    name: "Minimal Office",
    url: "/backgrounds/minimal-office.svg",
    categories: ["office"],
  },
  {
    id: "office-soft-waves",
    name: "Soft Light Waves",
    url: "/backgrounds/soft-light-waves.svg",
    categories: ["office", "gradients"],
  },
  {
    id: "nature-forest",
    name: "Forest Mist",
    url: "/backgrounds/forest-mist.svg",
    categories: ["nature", "featured"],
  },
  {
    id: "nature-sunset",
    name: "Sunset Glow",
    url: "/backgrounds/sunset-glow.svg",
    categories: ["nature", "gradients"],
  },
  {
    id: "abstract-orbits",
    name: "Abstract Orbits",
    url: "/backgrounds/abstract-orbits.svg",
    categories: ["abstract", "tech"],
  },
  {
    id: "abstract-template",
    name: "Abstract Template",
    url: "/abstract-template.png",
    categories: ["abstract", "featured"],
  },
  {
    id: "gradient-calm-blue",
    name: "Calm Blue Gradient",
    url: "/backgrounds/calm-blue-gradient.svg",
    categories: ["gradients"],
  },
  {
    id: "tech-pulse-lines",
    name: "Orange Pulse Lines",
    url: "/backgrounds/orange-pulse-lines.svg",
    categories: ["tech", "featured"],
  },
  {
    id: "tech-futuristic",
    name: "Futuristic AI Space",
    url: "/futuristic-ai-video-background.jpg",
    categories: ["tech"],
  },
]

export const UPLOADS_STORAGE_KEY = "runash.virtual-background.uploads"
