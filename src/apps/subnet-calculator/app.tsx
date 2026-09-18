import { Network } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Input } from '@/components/ui/input'
import { calculateSubnet, type SubnetInfo } from './subnet'

const ROWS: { key: keyof SubnetInfo; label: string }[] = [
  { key: 'network', label: 'Network address' },
  { key: 'broadcast', label: 'Broadcast address' },
  { key: 'firstHost', label: 'First usable host' },
  { key: 'lastHost', label: 'Last usable host' },
  { key: 'netmask', label: 'Subnet mask' },
  { key: 'wildcard', label: 'Wildcard mask' },
  { key: 'totalAddresses', label: 'Total addresses' },
  { key: 'usableHosts', label: 'Usable hosts' },
]

function SubnetCalculator() {
  const [input, setInput] = useState('192.168.1.42/24')

  const result = useMemo(() => {
    try {
      return { info: calculateSubnet(input), error: null as string | null }
    } catch (e) {
      return { info: null, error: (e as Error).message }
    }
  }, [input])

  return (
    <div className="space-y-4">
      <Field label="IP address / CIDR" hint="e.g. 10.0.0.1/16">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="192.168.1.0/24"
          className="font-mono"
        />
      </Field>

      {result.error ? (
        <p className="text-sm text-destructive">⚠️ {result.error}</p>
      ) : result.info ? (
        <div className="divide-y rounded-lg border">
          {ROWS.map((row) => (
            <div
              key={row.key}
              className="flex items-center justify-between px-3 py-2 text-sm"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <code className="font-medium">
                {result.info![row.key].toLocaleString()}
              </code>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export const app: StupidApp = {
  id: 'subnet-calculator',
  title: 'IP / Subnet Calculator',
  description: 'Work out network, broadcast and host range from a CIDR.',
  icon: Network,
  category: 'Calculators',
  Component: SubnetCalculator,
}
