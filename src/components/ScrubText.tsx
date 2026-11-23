/*
 * Text that lights up word by word as it scrolls through the screen.
 * The scroll position is written to --progress by motion.ts.
 * Words from `accentFrom` onward are set in the accent style.
 */
export function ScrubText({
  text,
  as: Tag = 'span',
  className = '',
  accentFrom,
}: {
  text: string
  as?: 'span' | 'p' | 'h2' | 'blockquote'
  className?: string
  accentFrom?: number
}) {
  const words = text.split(' ')
  return (
    <Tag className={`scrub ${className}`} data-scrub style={{ ['--n' as string]: words.length }} aria-label={text}>
      {words.map((word, i) => {
        const Word = accentFrom !== undefined && i >= accentFrom ? 'em' : 'span'
        return (
          <Word key={i} aria-hidden="true" style={{ ['--i' as string]: i }}>
            {word}{' '}
          </Word>
        )
      })}
    </Tag>
  )
}
