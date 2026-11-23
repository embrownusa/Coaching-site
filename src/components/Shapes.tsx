/*
 * Bold, flat geometric accents in the spirit of Book of Shapes
 * (https://bookofshapes.com, free for commercial use, no credit required).
 * Each shape uses currentColor, so set `color` in CSS to theme it.
 * To use an exact shape downloaded from Book of Shapes, drop its SVG into
 * src/assets/shapes/ and swap it in where these are used.
 */
type ShapeProps = { className?: string }

export function ArchShape({ className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <path fill="currentColor" d="M20 200V100a80 80 0 0 1 160 0v100h-44v-100a36 36 0 0 0-72 0v100z" />
    </svg>
  )
}

export function BloomShape({ className }: ShapeProps) {
  // Eight overlapping petals around a centre: a soft "flower" form.
  const petals = Array.from({ length: 8 }, (_, i) => i * 45)
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="currentColor">
        {petals.map((angle) => (
          <ellipse key={angle} cx="100" cy="52" rx="26" ry="48" transform={`rotate(${angle} 100 100)`} />
        ))}
      </g>
    </svg>
  )
}

export function QuarterShape({ className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="currentColor">
        <path d="M0 0h100a100 100 0 0 1-100 100z" />
        <path d="M200 200H100a100 100 0 0 1 100-100z" />
        <circle cx="150" cy="50" r="34" />
        <rect x="16" y="116" width="68" height="68" rx="34" />
      </g>
    </svg>
  )
}

export function SparkShape({ className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <path
        fill="currentColor"
        d="M100 0c6 52 22 78 100 100-78 22-94 48-100 100-6-52-22-78-100-100C78 78 94 52 100 0z"
      />
    </svg>
  )
}

export function WaveShape({ className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round">
        <path d="M14 60c31-34 55-34 86 0s55 34 86 0" />
        <path d="M14 110c31-34 55-34 86 0s55 34 86 0" />
        <path d="M14 160c31-34 55-34 86 0s55 34 86 0" />
      </g>
    </svg>
  )
}

export function HalfMoonsShape({ className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="currentColor">
        <path d="M0 100a50 50 0 0 1 100 0z" />
        <path d="M100 100a50 50 0 0 1 100 0z" />
        <path d="M0 100a50 50 0 0 0 100 0z" opacity=".55" />
        <path d="M100 100a50 50 0 0 0 100 0z" opacity=".55" />
        <path d="M50 200a50 50 0 0 1 100 0z" />
      </g>
    </svg>
  )
}

export const resourceShapes = [BloomShape, ArchShape, WaveShape, SparkShape, QuarterShape, HalfMoonsShape]
