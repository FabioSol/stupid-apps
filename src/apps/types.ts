import type { LucideIcon } from 'lucide-react'
import type { ComponentType } from 'react'

/** A category used to group apps on the landing page. */
export type AppCategory =
  | 'Encoding & Crypto'
  | 'Text'
  | 'Art'
  | 'Generators'
  | 'Time'
  | 'Calculators'

/**
 * The contract every stupid app must fulfil. Drop a folder under `src/apps/`
 * that exports one of these as `app` and it shows up on the landing page
 * automatically — see `registry.ts`.
 */
export interface StupidApp {
  /** URL slug, e.g. `jwt-decoder`. Must be unique and kebab-case. */
  id: string
  /** Short human title shown on the card and page header. */
  title: string
  /** One-line pitch shown on the card. */
  description: string
  /** Lucide icon rendered on the card. */
  icon: LucideIcon
  /** Grouping bucket for the landing page. */
  category: AppCategory
  /** The tool itself. Rendered inside the standard tool layout. */
  Component: ComponentType
}
