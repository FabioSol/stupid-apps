import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { apps, categoryOrder } from '@/apps/registry'
import { ToolCard } from '@/components/common/tool-card'
import { Input } from '@/components/ui/input'

export function LandingPage() {
  const [query, setQuery] = useState('')

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? apps.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.description.toLowerCase().includes(q),
        )
      : apps
    return categoryOrder
      .map((category) => ({
        category,
        items: filtered.filter((a) => a.category === category),
      }))
      .filter((group) => group.items.length > 0)
  }, [query])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Stupid Apps
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          {apps.length} tiny tools for the things you Google how to do every
          time. No sign-up, no server — it all runs right here.
        </p>
        <div className="relative mx-auto mt-6 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search apps…"
            className="pl-9"
          />
        </div>
      </div>

      {grouped.length === 0 ? (
        <p className="text-center text-muted-foreground">
          Nothing matches “{query}”.
        </p>
      ) : (
        <div className="space-y-10">
          {grouped.map((group) => (
            <section key={group.category}>
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {group.category}
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((app) => (
                  <ToolCard key={app.id} app={app} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
