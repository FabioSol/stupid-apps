import { Gift } from 'lucide-react'
import { useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { NamesInput, parseNames } from '@/components/common/names-input'
import { Button } from '@/components/ui/button'
import { assignSecretSanta, type Pairing } from './assign'

function SecretSanta() {
  const [names, setNames] = useState('')
  const [pairings, setPairings] = useState<Pairing[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const draw = () => {
    try {
      setPairings(assignSecretSanta(parseNames(names)))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setPairings(null)
    }
  }

  return (
    <div className="space-y-4">
      <NamesInput value={names} onChange={setNames} label="Participants" />
      {error ? <p className="text-sm text-destructive">⚠️ {error}</p> : null}
      <Button onClick={draw} className="gap-1.5">
        <Gift className="size-4" />
        Draw names
      </Button>

      {pairings ? (
        <div className="space-y-2">
          {pairings.map((p) => (
            <div
              key={p.giver}
              className="flex items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm"
            >
              <span className="font-medium">{p.giver}</span>
              <span className="text-muted-foreground">gives to</span>
              <span className="font-medium text-primary">{p.receiver}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export const app: StupidApp = {
  id: 'secret-santa',
  title: 'Secret Santa',
  description: 'Randomly pair gift-givers so nobody draws themselves.',
  icon: Gift,
  category: 'Generators',
  Component: SecretSanta,
}
