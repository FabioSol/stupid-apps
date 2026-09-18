export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  signature: string
}

function base64UrlDecode(segment: string): string {
  const padded = segment.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('A JWT has three dot-separated parts.')
  }
  const [header, payload, signature] = parts
  return {
    header: JSON.parse(base64UrlDecode(header)),
    payload: JSON.parse(base64UrlDecode(payload)),
    signature,
  }
}

/** Human-readable label for the standard JWT timestamp claims. */
export const CLAIM_LABELS: Record<string, string> = {
  iat: 'Issued at',
  exp: 'Expires',
  nbf: 'Not before',
}

export function formatClaimDate(seconds: unknown): string | null {
  if (typeof seconds !== 'number') return null
  const date = new Date(seconds * 1000)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString()
}
