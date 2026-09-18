import { Link } from 'react-router-dom'
import type { StupidApp } from '@/apps/types'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

/** Landing-page card for a single app. Rendered from the registry. */
export function ToolCard({ app }: { app: StupidApp }) {
  const { icon: Icon } = app
  return (
    <Link to={`/${app.id}`} className="group">
      <Card className="h-full transition-all group-hover:border-primary/60 group-hover:shadow-md">
        <CardHeader>
          <div className="mb-2 grid size-11 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="size-5" />
          </div>
          <CardTitle className="text-base">{app.title}</CardTitle>
          <CardDescription>{app.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  )
}
