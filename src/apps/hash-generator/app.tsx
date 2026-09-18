import CryptoJS from 'crypto-js'
import { Hash } from 'lucide-react'
import { useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { CopyButton } from '@/components/common/copy-button'
import { Field } from '@/components/common/field'
import { Textarea } from '@/components/ui/textarea'

const ALGOS = ['MD5', 'SHA1', 'SHA256', 'SHA512'] as const
type Algo = (typeof ALGOS)[number]

const hashers: Record<Algo, (input: string) => string> = {
  MD5: (i) => CryptoJS.MD5(i).toString(),
  SHA1: (i) => CryptoJS.SHA1(i).toString(),
  SHA256: (i) => CryptoJS.SHA256(i).toString(),
  SHA512: (i) => CryptoJS.SHA512(i).toString(),
}

function HashGenerator() {
  const [input, setInput] = useState('')

  return (
    <div className="space-y-4">
      <Field label="Input">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type anything to hash it…"
          className="min-h-28 font-mono"
        />
      </Field>
      <div className="space-y-2">
        {ALGOS.map((algo) => {
          const digest = input ? hashers[algo](input) : ''
          return (
            <div
              key={algo}
              className="flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2"
            >
              <span className="w-16 shrink-0 text-sm font-medium">{algo}</span>
              <code className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {digest || '—'}
              </code>
              <CopyButton value={digest} label="" />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const app: StupidApp = {
  id: 'hash-generator',
  title: 'Hash Generator',
  description: 'Hash text with MD5, SHA-1, SHA-256 and SHA-512 instantly.',
  icon: Hash,
  category: 'Encoding & Crypto',
  Component: HashGenerator,
}
