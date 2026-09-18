/**
 * Strips Markdown formatting down to readable plain text. Deliberately
 * lightweight — no dependency, just the transformations that matter for
 * "I pasted some Markdown and want the words back".
 */
export function stripMarkdown(md: string): string {
  let text = md

  // Fenced code blocks -> keep the inner code, drop the fences.
  text = text.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code) => code)
  // Inline code -> its contents.
  text = text.replace(/`([^`]+)`/g, '$1')
  // Images -> alt text.
  text = text.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  // Links -> link text.
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  // Headings.
  text = text.replace(/^#{1,6}\s+/gm, '')
  // Blockquotes.
  text = text.replace(/^>\s?/gm, '')
  // Bold / italic / strikethrough markers.
  text = text.replace(/(\*\*\*|___)(.*?)\1/g, '$2')
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2')
  text = text.replace(/(\*|_)(.*?)\1/g, '$2')
  text = text.replace(/~~(.*?)~~/g, '$1')
  // List markers (unordered + ordered).
  text = text.replace(/^\s*[-*+]\s+/gm, '')
  text = text.replace(/^\s*\d+\.\s+/gm, '')
  // Horizontal rules.
  text = text.replace(/^\s*([-*_])\s*(\1\s*){2,}$/gm, '')
  // Table pipe/separator rows.
  text = text.replace(/^\s*\|?[\s:|-]+\|?\s*$/gm, '')
  text = text.replace(/\s*\|\s*/g, ' ')
  // Collapse 3+ blank lines into a single blank line.
  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}
