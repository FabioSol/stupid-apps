import type { StupidApp } from './types'

/**
 * Auto-discovers every stupid app. Any `src/apps/<slug>/app.tsx` that exports
 * `app: StupidApp` is picked up here with zero extra wiring — adding a new tool
 * never means editing this file.
 */
const modules = import.meta.glob<{ app: StupidApp }>('./*/app.tsx', {
  eager: true,
})

export const apps: StupidApp[] = Object.values(modules)
  .map((mod) => mod.app)
  .sort((a, b) => a.title.localeCompare(b.title))

const byId = new Map(apps.map((app) => [app.id, app]))

export function getApp(id: string): StupidApp | undefined {
  return byId.get(id)
}

export const categoryOrder: StupidApp['category'][] = [
  'Encoding & Crypto',
  'Text',
  'Generators',
  'Time',
  'Calculators',
]
