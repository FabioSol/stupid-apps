function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Distributes names into exactly `teamCount` teams, as evenly as possible. */
export function splitIntoTeams(names: string[], teamCount: number): string[][] {
  const count = Math.max(1, Math.min(teamCount, names.length || 1))
  const teams: string[][] = Array.from({ length: count }, () => [])
  shuffle(names).forEach((name, i) => {
    teams[i % count].push(name)
  })
  return teams
}
