import { Dices } from 'lucide-react'
import { useState } from 'react'
import type { StupidApp } from '@/apps/types'
import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

function CoinFlipper() {
  const [result, setResult] = useState<string | null>(null)
  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="text-6xl">{result === 'Heads' ? '🪙' : result === 'Tails' ? '🌛' : '🪙'}</div>
      <div className="text-2xl font-semibold">{result ?? 'Flip it'}</div>
      <Button onClick={() => setResult(Math.random() < 0.5 ? 'Heads' : 'Tails')}>
        Flip coin
      </Button>
    </div>
  )
}

function DiceRoller() {
  const [count, setCount] = useState(2)
  const [rolls, setRolls] = useState<number[]>([])
  const roll = () =>
    setRolls(Array.from({ length: Math.min(Math.max(count, 1), 12) }, () => randInt(1, 6)))
  const total = rolls.reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <Field label="Number of dice" className="w-32">
          <Input
            type="number"
            min={1}
            max={12}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </Field>
        <Button onClick={roll}>Roll</Button>
      </div>
      {rolls.length > 0 ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex flex-wrap justify-center gap-2 text-5xl">
            {rolls.map((r, i) => (
              <span key={i} title={String(r)}>
                {DIE_FACES[r - 1]}
              </span>
            ))}
          </div>
          <div className="text-lg font-medium">Total: {total}</div>
        </div>
      ) : null}
    </div>
  )
}

function RangePicker() {
  const [min, setMin] = useState(1)
  const [max, setMax] = useState(100)
  const [result, setResult] = useState<number | null>(null)
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3">
        <Field label="Min" className="w-28">
          <Input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} />
        </Field>
        <Field label="Max" className="w-28">
          <Input type="number" value={max} onChange={(e) => setMax(Number(e.target.value))} />
        </Field>
        <Button onClick={() => setResult(randInt(Math.min(min, max), Math.max(min, max)))}>
          Generate
        </Button>
      </div>
      {result !== null ? (
        <div className="py-4 text-center text-5xl font-bold tabular-nums">{result}</div>
      ) : null}
    </div>
  )
}

function RandomNumber() {
  return (
    <Tabs defaultValue="range">
      <TabsList>
        <TabsTrigger value="range">Number</TabsTrigger>
        <TabsTrigger value="dice">Dice</TabsTrigger>
        <TabsTrigger value="coin">Coin</TabsTrigger>
      </TabsList>
      <TabsContent value="range" className="mt-4">
        <RangePicker />
      </TabsContent>
      <TabsContent value="dice" className="mt-4">
        <DiceRoller />
      </TabsContent>
      <TabsContent value="coin" className="mt-4">
        <CoinFlipper />
      </TabsContent>
    </Tabs>
  )
}

export const app: StupidApp = {
  id: 'random-number',
  title: 'Random Number, Dice & Coin',
  description: 'Roll dice, flip a coin, or pick a number in a range.',
  icon: Dices,
  category: 'Generators',
  Component: RandomNumber,
}
