import { Users } from 'lucide-react'
import { useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { NamesInput, parseNames } from '@/components/common/names-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { splitIntoTeams } from './split'

function TeamGenerator() {
  const [names, setNames] = useState('')
  const [teamCount, setTeamCount] = useState(2)
  const [teams, setTeams] = useState<string[][] | null>(null)

  const generate = () => {
    const parsed = parseNames(names)
    if (parsed.length === 0) return
    setTeams(splitIntoTeams(parsed, teamCount))
  }

  return (
    <div className="space-y-4">
      <NamesInput value={names} onChange={setNames} label="People" />
      <div className="flex items-end gap-3">
        <Field label="Number of teams" className="w-40">
          <Input
            type="number"
            min={1}
            max={50}
            value={teamCount}
            onChange={(e) => setTeamCount(Number(e.target.value))}
          />
        </Field>
        <Button onClick={generate} className="gap-1.5">
          <Users className="size-4" />
          Make teams
        </Button>
      </div>

      {teams ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team, i) => (
            <div key={i} className="rounded-lg border bg-muted/40 p-3">
              <div className="mb-2 text-sm font-semibold text-primary">
                Team {i + 1}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({team.length})
                </span>
              </div>
              <ul className="space-y-1 text-sm">
                {team.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export const app: StupidApp = {
  id: 'team-generator',
  title: 'Random Team Generator',
  description: 'Shuffle a list of people into balanced random teams.',
  icon: Users,
  category: 'Generators',
  Component: TeamGenerator,
}
