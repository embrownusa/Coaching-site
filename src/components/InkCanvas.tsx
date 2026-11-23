import { useEffect, useRef, useState } from 'react'

/*
 * A small ink-style drawing pad, our own (chosen over embedding Ink Draw).
 */
const INKS = [
  { name: 'Silver', value: '#dfe6ea' },
  { name: 'Pearl', value: '#ffffff' },
  { name: 'Ice', value: '#a9cfe2' },
  { name: 'Mist', value: '#9fb3ba' },
]

type Point = { x: number; y: number; t: number; w: number }

export function InkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const last = useRef<Point | null>(null)
  const [ink, setInk] = useState(INKS[0].value)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const ratio = window.devicePixelRatio || 1
      const { width, height } = canvas.getBoundingClientRect()
      const snapshot = canvas.width ? canvas.toDataURL() : null
      canvas.width = width * ratio
      canvas.height = height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.scale(ratio, ratio)
      if (snapshot) {
        const img = new Image()
        img.onload = () => ctx.drawImage(img, 0, 0, width, height)
        img.src = snapshot
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const pointFrom = (event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top, t: performance.now(), w: 6 }
  }

  const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    const p = pointFrom(event)
    last.current = p
    const ctx = event.currentTarget.getContext('2d')!
    ctx.fillStyle = ink
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2)
    ctx.fill()
    setHasDrawn(true)
  }

  const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const prev = last.current
    if (!prev) return
    const p = pointFrom(event)
    const distance = Math.hypot(p.x - prev.x, p.y - prev.y)
    if (distance < 1) return
    const speed = distance / Math.max(p.t - prev.t, 1)
    // Faster strokes thin out, slower strokes pool, like a brush pen.
    const target = Math.max(1.5, Math.min(11, 10 - speed * 4))
    p.w = prev.w + (target - prev.w) * 0.35
    const ctx = event.currentTarget.getContext('2d')!
    ctx.strokeStyle = ink
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = p.w
    ctx.shadowColor = ink
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.moveTo(prev.x, prev.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
  }

  const end = () => {
    last.current = null
  }

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  const save = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'my-finish-line.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="ink-pad">
      <canvas
        ref={canvasRef}
        className="ink-canvas"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerLeave={end}
        aria-label="Drawing area. Draw your goal or your race route."
        role="img"
      />
      {!hasDrawn && <p className="ink-hint">Draw here</p>}
      <div className="ink-tools">
        <div className="ink-swatches" role="radiogroup" aria-label="Ink colour">
          {INKS.map((option) => (
            <button
              key={option.value}
              role="radio"
              aria-checked={ink === option.value}
              aria-label={option.name}
              className={ink === option.value ? 'active' : ''}
              style={{ background: option.value }}
              onClick={() => setInk(option.value)}
            />
          ))}
        </div>
        <div className="ink-actions">
          <button onClick={clear}>Clear</button>
          <button onClick={save} disabled={!hasDrawn}>Save image</button>
        </div>
      </div>
    </div>
  )
}
