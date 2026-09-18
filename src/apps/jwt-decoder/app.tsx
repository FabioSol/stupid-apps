import { KeyRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { OutputBox } from '@/components/common/output-box'
import { Textarea } from '@/components/ui/textarea'
import { CLAIM_LABELS, decodeJwt, formatClaimDate } from './decode'

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE)

  const result = useMemo(() => {
    if (!token.trim()) return null
    try {
      return { data: decodeJwt(token), error: null as string | null }
    } catch (e) {
      return { data: null, error: (e as Error).message }
    }
  }, [token])

  const payload = result?.data?.payload
  const timeClaims = payload
    ? Object.keys(CLAIM_LABELS)
        .filter((k) => k in payload)
        .map((k) => ({
          label: CLAIM_LABELS[k],
          value: formatClaimDate(payload[k]),
        }))
        .filter((c) => c.value)
    : []

  return (
    <div className="space-y-4">
      <Field label="JWT" hint="Decoded locally — the token never leaves your browser.">
        <Textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste a JWT…"
          className="min-h-28 font-mono text-xs"
        />
      </Field>

      {result?.error ? (
        <p className="text-sm text-destructive">⚠️ {result.error}</p>
      ) : null}

      {result?.data ? (
        <div className="space-y-4">
          <Field label="Header">
            <OutputBox value={JSON.stringify(result.data.header, null, 2)} />
          </Field>
          <Field label="Payload">
            <OutputBox value={JSON.stringify(result.data.payload, null, 2)} />
          </Field>
          {timeClaims.length > 0 ? (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              {timeClaims.map((c) => (
                <div key={c.label} className="flex justify-between gap-4 py-0.5">
                  <span className="text-muted-foreground">{c.label}</span>
                  <span>{c.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export const app: StupidApp = {
  id: 'jwt-decoder',
  title: 'JWT Decoder',
  description: 'Decode a JWT’s header and payload and read its expiry claims.',
  icon: KeyRound,
  category: 'Encoding & Crypto',
  Component: JwtDecoder,
}
