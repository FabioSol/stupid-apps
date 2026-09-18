import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { StupidApp } from '@/apps/types'

interface ToolShellProps {
  app: StupidApp
  children: ReactNode
}

/** Standard header + container every tool page renders inside of. */
export function ToolShell({ app, children }: ToolShellProps) {
  const { icon: Icon } = app
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All apps
      </Link>
      <div className="mb-8 flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{app.title}</h1>
          <p className="text-muted-foreground">{app.description}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
