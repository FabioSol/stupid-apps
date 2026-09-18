import { Fingerprint, RefreshCw } from 'lucide-react'
import { useCallback, useState } from 'react'
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import type { StupidApp } from '@/apps/types'
import { CopyButton } from '@/components/common/copy-button'
import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Version = 'v4' | 'v7'

function generate(version: Version, count: number): string[] {
  const make = version === 'v7' ? uuidv7 : uuidv4
  return Array.from({ length: count }, () => make())
}

function UuidGenerator() {
  const [version, setVersion] = useState<Version>('v4')
  const [count, setCount] = useState(5)
  const [ids, setIds] = useState<string[]>(() => generate('v4', 5))

  const regenerate = useCallback(() => {
    setIds(generate(version, Math.min(Math.max(count, 1), 100)))
  }, [version, count])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <Tabs value={version} onValueChange={(v) => setVersion(v as Version)}>
          <TabsList>
            <TabsTrigger value="v4">v4 (random)</TabsTrigger>
            <TabsTrigger value="v7">v7 (time-ordered)</TabsTrigger>
          </TabsList>
        </Tabs>
        <Field label="How many" className="w-28">
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </Field>
        <Button onClick={regenerate} className="gap-1.5">
          <RefreshCw className="size-4" />
          Generate
        </Button>
      </div>

      <div className="space-y-2">
        {ids.map((id, i) => (
          <div
            key={`${id}-${i}`}
            className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2"
          >
            <code className="truncate text-sm">{id}</code>
            <CopyButton value={id} label="" />
          </div>
        ))}
      </div>
      <CopyButton value={ids.join('\n')} label="Copy all" />
    </div>
  )
}

export const app: StupidApp = {
  id: 'uuid-generator',
  title: 'UUID Generator',
  description: 'Generate v4 (random) or v7 (time-ordered) UUIDs in bulk.',
  icon: Fingerprint,
  category: 'Generators',
  Component: UuidGenerator,
}
