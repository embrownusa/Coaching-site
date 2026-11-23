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

type FieldShape = {
  shape: (props: ShapeProps) => React.JSX.Element
  /** Position and size as CSS lengths. */
  top: string
  left: string
  size: string
  /** How strongly it follows the cursor and scroll (negative moves the other way). */
  depth: number
  /** Degrees it turns per 1000px scrolled. */
  spin?: number
  tone?: 'bright' | 'mid' | 'dim' | 'outline'
}

const fields: Record<string, FieldShape[]> = {
  hero: [
    { shape: BloomShape, top: '14%', left: '58%', size: 'clamp(70px, 8vw, 120px)', depth: 34, spin: 60, tone: 'mid' },
    { shape: ArchShape, top: '64%', left: '44%', size: 'clamp(60px, 6vw, 96px)', depth: -22, tone: 'dim' },
    { shape: QuarterShape, top: '8%', left: '86%', size: 'clamp(80px, 9vw, 140px)', depth: 18, spin: -40, tone: 'dim' },
    { shape: WaveShape, top: '42%', left: '74%', size: 'clamp(54px, 5vw, 80px)', depth: -40, tone: 'outline' },
    { shape: HalfMoonsShape, top: '30%', left: '93%', size: 'clamp(40px, 4vw, 64px)', depth: 50, spin: 90, tone: 'bright' },
  ],
  page: [
    { shape: SparkShape, top: '18%', left: '72%', size: 'clamp(46px, 5vw, 80px)', depth: 40, spin: 120, tone: 'bright' },
    { shape: BloomShape, top: '52%', left: '84%', size: 'clamp(90px, 11vw, 170px)', depth: -24, spin: 50, tone: 'dim' },
    { shape: ArchShape, top: '62%', left: '60%', size: 'clamp(50px, 5vw, 84px)', depth: 26, tone: 'mid' },
    { shape: HalfMoonsShape, top: '10%', left: '92%', size: 'clamp(40px, 4vw, 60px)', depth: -36, spin: -80, tone: 'outline' },
  ],
  band: [
    { shape: QuarterShape, top: '12%', left: '4%', size: 'clamp(60px, 7vw, 110px)', depth: 22, spin: 40, tone: 'dim' },
    { shape: SparkShape, top: '70%', left: '90%', size: 'clamp(36px, 3.5vw, 56px)', depth: -34, spin: 140, tone: 'bright' },
    { shape: WaveShape, top: '18%', left: '84%', size: 'clamp(60px, 6vw, 96px)', depth: 30, tone: 'outline' },
    { shape: BloomShape, top: '66%', left: '10%', size: 'clamp(44px, 4vw, 70px)', depth: -26, spin: -70, tone: 'mid' },
  ],
}

/**
 * A layer of shapes that drift with the cursor and turn as the page scrolls.
 * Place inside a positioned section; it sits behind the section's content.
 */
export function ShapeField({ variant }: { variant: keyof typeof fields }) {
  return (
    <div className="shape-field" data-parallax aria-hidden="true">
      {fields[variant].map(({ shape: Shape, top, left, size, depth, spin = 0, tone = 'mid' }, i) => (
        <span
          key={i}
          className={`field-shape tone-${tone}`}
          style={{ top, left, width: size, ['--d' as string]: depth, ['--spin' as string]: spin, ['--i' as string]: i }}
        >
          <Shape />
        </span>
      ))}
    </div>
  )
}

const buttonShapes = [SparkShape, BloomShape, HalfMoonsShape, QuarterShape]

/** A small shape that lives inside a button: it turns with scrolling and leans toward the cursor. */
export function ButtonShape({ index = 0 }: { index?: number }) {
  const Shape = buttonShapes[index % buttonShapes.length]
  return (
    <i className="btn-shape" aria-hidden="true">
      <Shape />
    </i>
  )
}
