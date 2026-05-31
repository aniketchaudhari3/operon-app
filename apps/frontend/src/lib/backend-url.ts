/** Server-only — used by API routes; not available in client bundles. */
export function getBackendBaseUrl(): string {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, '')
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}/_/backend`
  }

  return 'http://localhost:8000'
}
