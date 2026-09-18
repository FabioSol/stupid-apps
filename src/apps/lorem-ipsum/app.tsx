import { Type } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { OutputBox } from '@/components/common/output-box'
import { Input } from '@/components/ui/input'
import { loremOfLength } from './generate'

function LoremIpsum() {
  const [length, setLength] = useState(280)
  const text = useMemo(
    () => loremOfLength(Math.min(Math.max(length, 0), 100000)),
    [length],
  )

  return (
    <div className="space-y-4">
      <Field
        label="Exact character count"
        hint="Great for testing fields with strict length limits."
        className="max-w-xs"
      >
        <Input
          type="number"
          min={0}
          max={100000}
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
        />
      </Field>
      <Field label={`Output (${text.length} chars)`}>
        <OutputBox value={text} mono={false} />
      </Field>
    </div>
  )
}

export const app: StupidApp = {
  id: 'lorem-ipsum',
  title: 'Lorem Ipsum (exact length)',
  description: 'Generate placeholder text of an exact character count.',
  icon: Type,
  category: 'Text',
  Component: LoremIpsum,
}
