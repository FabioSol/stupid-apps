import { diffChars, diffLines, diffWords, type Change } from 'diff'
import { cn } from '@/lib/utils'

export type Granularity = 'line' | 'word' | 'char'

function computeChanges(a: string, b: string, mode: Granularity): Change[] {
  if (mode === 'line') return diffLines(a, b)
  if (mode === 'char') return diffChars(a, b)
  return diffWords(a, b)
}

export function diffStats(a: string, b: string, mode: Granularity) {
  const changes = computeChanges(a, b, mode)
  let added = 0
  let removed = 0
  for (const part of changes) {
    if (part.added) added += part.count ?? 0
    if (part.removed) removed += part.count ?? 0
  }
  return { changes, added, removed }
}

/** Inline unified diff: removals struck in red, additions in green. */
export function DiffView({
  a,
  b,
  mode,
}: {
  a: string
  b: string
  mode: Granularity
}) {
  const { changes } = diffStats(a, b, mode)

  return (
    <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3 font-mono text-sm leading-relaxed">
      {changes.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.added &&
              'rounded bg-green-500/20 text-green-700 dark:text-green-300',
            part.removed &&
              'rounded bg-red-500/20 text-red-700 line-through dark:text-red-300',
          )}
        >
          {part.value}
        </span>
      ))}
    </pre>
  )
}
