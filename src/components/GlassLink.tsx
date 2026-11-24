import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from './Link'
import { LiquidGlass, refreshGlass, type GlassShape } from '../vendor/liquid-glass/glass'

/** Turns the element into liquid glass (liquid-glass-js) by drawing on a canvas behind its content. */
function useLiquidGlass<T extends HTMLElement>(shape: GlassShape) {
  const host = useRef<T>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (!host.current || !canvas.current) return
    const glass = new LiquidGlass(host.current, canvas.current, shape)
    return () => glass.destroy()
  }, [shape])
  return { host, canvas }
}

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
  const { host, canvas } = useLiquidGlass<HTMLAnchorElement>(shape)
  return (
    <Link ref={host} href={href} className={className} onClick={onClick}>
      <canvas ref={canvas} className="liquid-glass-canvas" aria-hidden="true" />
      {children}
    </Link>
  )
}

/** A form button drawn as liquid glass, like GlassLink. */
export function GlassButton({ shape = 'pill', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { shape?: GlassShape }) {
  const { host, canvas } = useLiquidGlass<HTMLButtonElement>(shape)
  return (
    <button ref={host} {...rest}>
      <canvas ref={canvas} className="liquid-glass-canvas" aria-hidden="true" />
      {children}
    </button>
  )
}

export { refreshGlass }
