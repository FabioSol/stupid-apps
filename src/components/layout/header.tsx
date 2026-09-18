import { Link } from 'react-router-dom'
import { ThemeToggle } from '@/components/common/theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            🤖
          </span>
          <span className="text-lg tracking-tight">Stupid Apps</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
