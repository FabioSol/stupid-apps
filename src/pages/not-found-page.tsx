import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Nothing here</h1>
      <p className="mt-2 text-muted-foreground">
        That app doesn’t exist (yet).
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Back to all apps</Link>
      </Button>
    </div>
  )
}
