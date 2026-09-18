const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
  'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
  'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis',
  'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex',
  'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur',
]

/**
 * Produces Lorem Ipsum text that is *exactly* `length` characters long.
 * Words are appended until the target would be exceeded, then the final
 * fragment is trimmed to land precisely on the requested count.
 */
export function loremOfLength(length: number): string {
  if (length <= 0) return ''

  let out = ''
  let i = 0
  while (out.length < length) {
    const word = WORDS[i % WORDS.length]
    i++
    const next = out ? `${out} ${word}` : word
    if (next.length <= length) {
      out = next
    } else {
      // Fill the remaining gap with a truncated word so we hit N exactly.
      const remaining = length - out.length
      if (remaining >= 2) {
        out += ` ${word.slice(0, remaining - 1)}`
      } else {
        out += remaining === 1 ? '.' : ''
      }
      break
    }
  }

  // Capitalise the opening letter for a touch of polish.
  return out.charAt(0).toUpperCase() + out.slice(1)
}
