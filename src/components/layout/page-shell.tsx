import type { ReactNode } from 'react'
import { Footer } from './footer'
import { Header } from './header'

/** Full-height page frame with sticky header and footer. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
