import { Binary } from 'lucide-react'
import { useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { OutputBox } from '@/components/common/output-box'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

type Mode = 'encode' | 'decode'

function convert(input: string, mode: Mode): string {
  if (!input) return ''
  try {
    if (mode === 'encode') {
      // UTF-8 safe encode
      return btoa(String.fromCharCode(...new TextEncoder().encode(input)))
    }
    const bytes = Uint8Array.from(atob(input), (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return mode === 'decode' ? '⚠️ Not valid Base64' : '⚠️ Could not encode'
  }
}

function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode')
  const [input, setInput] = useState('')

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList>
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
      </Tabs>
      <Field label={mode === 'encode' ? 'Plain text' : 'Base64'}>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? 'Hello world' : 'SGVsbG8gd29ybGQ='}
          className="min-h-32 font-mono"
        />
      </Field>
      <Field label="Result">
        <OutputBox value={convert(input, mode)} />
      </Field>
    </div>
  )
}

export const app: StupidApp = {
  id: 'base64',
  title: 'Base64 Encoder / Decoder',
  description: 'Encode text to Base64 or decode it back. UTF-8 safe.',
  icon: Binary,
  category: 'Encoding & Crypto',
  Component: Base64Tool,
}
