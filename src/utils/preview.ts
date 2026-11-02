export function isDesignPreview(path: string): boolean {
  return /^\/design-preview\/?$/.test(path)
}
export function countdownParts(date: string, now: number): number[] | null {
  const target = Date.parse(date)
  if (!Number.isFinite(target)) return null
  const seconds = Math.max(0, Math.floor((target - now) / 1000))
  return [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ]
}
