import { useEffect, useRef, type ReactNode } from 'react'
import { Link } from './Link'
import { LiquidGlass, refreshGlass, type GlassShape } from '../vendor/liquid-glass/glass'

/**
 * A link drawn as liquid glass (liquid-glass-js): the page behind it is refracted,
 * blurred and tinted on a WebGL canvas under the label.
 */
export function GlassLink({
  href,
  className,
  shape = 'pill',
  onClick,
  children,
}: {
  href: string
  className: string
  shape?: GlassShape
  onClick?: () => void
  children: ReactNode
}) {
  const host = useRef<HTMLAnchorElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!host.current || !canvas.current) return
    const glass = new LiquidGlass(host.current, canvas.current, shape)
    return () => glass.destroy()
  }, [shape])

  return (
    <Link ref={host} href={href} className={className} onClick={onClick}>
      <canvas ref={canvas} className="liquid-glass-canvas" aria-hidden="true" />
      {children}
    </Link>
  )
}

export { refreshGlass }
