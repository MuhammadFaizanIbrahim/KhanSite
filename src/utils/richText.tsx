// Client-editable copy uses **double asterisks** to mark the gold-highlighted
// phrase(s) — familiar Markdown-style bold, safe for a non-technical editor to
// type in a JSON file without needing to know HTML/JSX.
export function RichText({ text, goldColor = 'var(--text-gold)' }: { text: string; goldColor?: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\*\*([^*]+)\*\*$/)
        return match
          ? <span key={i} style={{ color: goldColor }}>{match[1]}</span>
          : <span key={i}>{part}</span>
      })}
    </>
  )
}
