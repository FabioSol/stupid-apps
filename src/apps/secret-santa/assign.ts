export interface Pairing {
  giver: string
  receiver: string
}

/** Fisher–Yates shuffle (non-mutating). */
function shuffle<T>(items: T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Assigns each person someone else to gift, guaranteeing nobody draws
 * themselves. Retries the shuffle until it lands on a valid derangement.
 */
export function assignSecretSanta(names: string[]): Pairing[] {
  const people = names.map((n) => n.trim()).filter(Boolean)
  if (people.length < 2) {
    throw new Error('Add at least two people.')
  }

  for (let attempt = 0; attempt < 1000; attempt++) {
    const receivers = shuffle(people)
    const valid = people.every((giver, i) => giver !== receivers[i])
    if (valid) {
      return people.map((giver, i) => ({ giver, receiver: receivers[i] }))
    }
  }
  throw new Error('Could not find a valid assignment — try again.')
}
