import { CopyButton } from './copy-button'
import { cn } from '@/lib/utils'

interface OutputBoxProps {
  value: string
  placeholder?: string
  mono?: boolean
  className?: string
  copyable?: boolean
}

/** Read-only result surface with an optional copy button. */
export function OutputBox({
  value,
  placeholder = 'Output will appear here…',
  mono = true,
  className,
  copyable = true,
}: OutputBoxProps) {
  return (
    <div className="relative">
      <pre
        className={cn(
          'max-h-[420px] min-h-24 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/40 p-3 text-sm',
          mono && 'font-mono',
          !value && 'text-muted-foreground',
          className,
        )}
      >
        {value || placeholder}
      </pre>
      {copyable && value ? (
        <div className="absolute right-2 top-2">
          <CopyButton value={value} />
        </div>
      ) : null}
    </div>
  )
}
