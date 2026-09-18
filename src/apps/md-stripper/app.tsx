import { Eraser } from 'lucide-react'
import { useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { OutputBox } from '@/components/common/output-box'
import { Textarea } from '@/components/ui/textarea'
import { stripMarkdown } from './strip'

const SAMPLE = `# Title

Some **bold** and *italic* text with a [link](https://example.com).

- one
- two

\`\`\`js
const x = 1
\`\`\``

function MdStripper() {
  const [input, setInput] = useState(SAMPLE)

  return (
    <div className="space-y-4">
      <Field label="Markdown">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste Markdown here…"
          className="min-h-40 font-mono text-sm"
        />
      </Field>
      <Field label="Plain text">
        <OutputBox value={stripMarkdown(input)} mono={false} />
      </Field>
    </div>
  )
}

export const app: StupidApp = {
  id: 'md-stripper',
  title: 'Markdown Stripper',
  description: 'Turn Markdown into clean, formatting-free raw text.',
  icon: Eraser,
  category: 'Text',
  Component: MdStripper,
}
