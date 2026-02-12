export interface AiImageSet {
  image: string
  imageHd: string
  imageThumb: string
  imageAlt: string
}

interface AiImageOptions {
  prompt: string
  seed?: string
  alt?: string
}

const FALLBACK_IMAGE_SET: AiImageSet = {
  image: "https://picsum.photos/seed/runash-fallback/640/640",
  imageHd: "https://picsum.photos/seed/runash-fallback-hd/1200/1200",
  imageThumb: "https://picsum.photos/seed/runash-fallback-thumb/320/320",
  imageAlt: "RunAsh AI generated image",
}

const DEFAULT_IMAGE_SERVICE = ""

const hashString = (value: string): string => {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash).toString(36)
}

const buildPicsumUrl = (seed: string, width: number, height: number): string => {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`
}

const buildServiceUrl = (
  baseUrl: string,
  prompt: string,
  seed: string,
  width: number,
  height: number,
): string => {
  const url = new URL(baseUrl)
  url.searchParams.set("prompt", prompt)
  url.searchParams.set("seed", seed)
  url.searchParams.set("width", String(width))
  url.searchParams.set("height", String(height))
  return url.toString()
}

export const getAiImageSet = ({ prompt, seed, alt }: AiImageOptions): AiImageSet => {
  try {
    const promptText = prompt.trim()
    const normalizedSeed = (seed ?? hashString(promptText || "runash")).toLowerCase()

    if (!promptText && !seed) {
      return { ...FALLBACK_IMAGE_SET, imageAlt: alt ?? FALLBACK_IMAGE_SET.imageAlt }
    }

    const serviceUrl = process.env.NEXT_PUBLIC_AI_IMAGE_ENDPOINT?.trim() ?? DEFAULT_IMAGE_SERVICE

    if (serviceUrl) {
      return {
        image: buildServiceUrl(serviceUrl, promptText, normalizedSeed, 640, 640),
        imageHd: buildServiceUrl(serviceUrl, promptText, `${normalizedSeed}-hd`, 1200, 1200),
        imageThumb: buildServiceUrl(serviceUrl, promptText, `${normalizedSeed}-thumb`, 320, 320),
        imageAlt: alt ?? promptText || FALLBACK_IMAGE_SET.imageAlt,
      }
    }

    return {
      image: buildPicsumUrl(normalizedSeed, 640, 640),
      imageHd: buildPicsumUrl(`${normalizedSeed}-hd`, 1200, 1200),
      imageThumb: buildPicsumUrl(`${normalizedSeed}-thumb`, 320, 320),
      imageAlt: alt ?? promptText || FALLBACK_IMAGE_SET.imageAlt,
    }
  } catch {
    return { ...FALLBACK_IMAGE_SET, imageAlt: alt ?? FALLBACK_IMAGE_SET.imageAlt }
  }
}
