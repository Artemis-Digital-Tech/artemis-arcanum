import { DEPTH_SCALE_MAX } from '../data/spreads'

interface DepthGaugeProps {
  count: number
  max?: number
  /** Reference points from every spread, drawn as a shared constellation arc. */
  ticks?: number[]
}

const CX = 60
const CY = 58
const R = 46

/** count=0 -> 180deg (left), count=max -> 0deg (right), through 90deg (top). */
function angleFor(count: number, max: number) {
  return 180 - (count / max) * 180
}

function pointOn(radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),
  }
}

/** An 8-point sparkle/star glyph, the arc's unit of light. */
function starPath(cx: number, cy: number, outerR: number, innerR: number) {
  const points: string[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i * 45 * Math.PI) / 180
    const radius = i % 2 === 0 ? outerR : innerR
    const x = cx + radius * Math.sin(angle)
    const y = cy - radius * Math.cos(angle)
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }
  return `${points.join(' ')} Z`
}

export default function DepthGauge({ count, max = DEPTH_SCALE_MAX, ticks = [1, 3, 7, 10] }: DepthGaugeProps) {
  const start = pointOn(R, 180)
  const end = pointOn(R, 0)

  return (
    <svg className="depth-gauge" viewBox="0 0 120 68" aria-hidden="true">
      <path
        d={`M ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${end.x} ${end.y}`}
        fill="none"
        stroke="var(--line-bright)"
        strokeWidth="1"
        strokeDasharray="1 7"
      />
      {ticks.map((tick) => {
        const lit = tick <= count
        const { x, y } = pointOn(R, angleFor(tick, max))
        return (
          <path
            key={tick}
            d={starPath(x, y, lit ? 5.5 : 3, lit ? 2.4 : 1.3)}
            fill={lit ? 'var(--brass-bright)' : 'var(--ink-2)'}
            stroke={lit ? 'var(--brass-bright)' : 'var(--paper-dim)'}
            strokeWidth={lit ? 0.6 : 0.8}
          />
        )
      })}
    </svg>
  )
}
