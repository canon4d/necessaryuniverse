const CX = 500
const CY = 268
const RX = 372
const RY = 138

/** Point on the ellipse at angle `deg`, measured clockwise from the top. */
function onLoop(deg: number) {
  const r = (deg * Math.PI) / 180
  return { x: CX + RX * Math.sin(r), y: CY - RY * Math.cos(r) }
}

/** A small right-pointing pennant. Flipped, it visibly points the other way —
 *  the whole diagram rests on that one piece of everyday visual grammar. */
function Pennant({
  x,
  y,
  rotate,
  scale = 1,
  fill,
  stroke,
  opacity = 1,
  delay,
}: {
  x: number
  y: number
  rotate: number
  scale?: number
  fill: string
  stroke?: string
  opacity?: number
  delay?: string
}) {
  return (
    <g
      className="torus-pennant"
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
      opacity={opacity}
      style={delay ? ({ animationDelay: delay } as React.CSSProperties) : undefined}
    >
      <path
        d="M -9 -11 L -9 11 L 13 0 Z"
        fill={fill}
        stroke={stroke ?? 'none'}
        strokeWidth={stroke ? 1.4 : 0}
        strokeLinejoin="round"
      />
      <line x1={-9} y1={-11} x2={-9} y2={11} stroke={stroke ?? fill} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

// Leave a wide gap at the top of the loop (roughly ±40°) clear for the
// before/after comparison, so the travelling trail never collides with it.
const TRAIL = Array.from({ length: 11 }, (_, i) => 44 + (272 * i) / 10)

/**
 * The claim in one picture: travel once around the loop of time, and the same
 * point in space comes back mirrored. A row of pennants fades from solid
 * (just starting out) to faint (most of the way around); the top of the loop
 * holds the payoff, set well clear of the trail — the same pennant, shown
 * twice, flipped.
 */
export default function MappingTorus() {
  return (
    <figure className="torus">
      <svg
        className="torus-diagram"
        viewBox="0 0 1000 470"
        role="img"
        aria-labelledby="torus-title torus-desc"
      >
        <title id="torus-title">Travel once around the loop of time, and space comes back mirrored</title>
        <desc id="torus-desc">
          An oval loop represents time closing back on itself. A small flag travels once around it,
          rotating gradually and fading as it goes. At the top, where the loop closes, the flag that
          set out pointing right is compared with the same flag one full circuit later — now pointing
          left, its mirror image.
        </desc>

        <ellipse
          cx={CX}
          cy={CY}
          rx={RX}
          ry={RY}
          fill="none"
          stroke="var(--rule-2)"
          strokeWidth={1.5}
          strokeDasharray="1 9"
          strokeLinecap="round"
        />

        <text className="torus-text" x={CX} y={CY - 6} textAnchor="middle" fontFamily="var(--mono)" fontSize="15" fill="var(--muted)" letterSpacing="0.06em">
          TIME
        </text>
        <text className="torus-text" x={CX} y={CY + 17} textAnchor="middle" fontFamily="var(--serif)" fontStyle="italic" fontSize="14" fill="var(--muted)">
          a loop, not a line
        </text>

        {/* the trail: one pennant travelling once around, fading as it goes and rotating 0deg to 180deg */}
        {TRAIL.map((deg, i) => {
          const { x, y } = onLoop(deg)
          const t = i / (TRAIL.length - 1)
          const rotate = 180 * t
          const opacity = 0.95 - 0.68 * t
          return (
            <Pennant
              key={i}
              x={x}
              y={y}
              rotate={rotate}
              scale={0.9}
              fill="var(--accent)"
              opacity={opacity}
              delay={`${90 + i * 70}ms`}
            />
          )
        })}

        {/* the payoff, set well above the loop: the same point, shown twice */}
        <line x1={CX - 78} y1={126} x2={onLoop(-6).x} y2={onLoop(-6).y - 6} stroke="var(--rule-2)" strokeWidth={1} strokeDasharray="2 4" />
        <line x1={CX + 78} y1={126} x2={onLoop(6).x} y2={onLoop(6).y - 6} stroke="var(--rule-2)" strokeWidth={1} strokeDasharray="2 4" />

        <text className="torus-text" x={CX} y={78} textAnchor="middle" fontFamily="var(--sans)" fontSize="11.5" fill="var(--muted)">
          the same location on the loop
        </text>
        <path
          className="torus-text"
          d={`M ${CX - 52} 88 L ${CX + 52} 88`}
          fill="none"
          stroke="var(--rule-2)"
          strokeWidth={1.2}
          markerStart="url(#torus-tick)"
          markerEnd="url(#torus-tick)"
        />
        <defs>
          <marker id="torus-tick" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="10" orient="auto">
            <line x1="5" y1="1" x2="5" y2="9" stroke="var(--rule-2)" strokeWidth="1.6" />
          </marker>
        </defs>

        <Pennant x={CX - 78} y={112} rotate={0} scale={1.5} fill="var(--accent)" />
        <text className="torus-text" x={CX - 78} y={155} textAnchor="middle" fontFamily="var(--sans)" fontSize="12.5" fontWeight={600} fill="var(--ink)">
          you set out here
        </text>
        <text className="torus-text" x={CX - 78} y={171} textAnchor="middle" fontFamily="var(--mono)" fontSize="12" fill="var(--accent)">
          t = 0
        </text>

        <Pennant x={CX + 78} y={112} rotate={180} scale={1.5} fill="none" stroke="var(--ink)" />
        <text className="torus-text" x={CX + 78} y={155} textAnchor="middle" fontFamily="var(--sans)" fontSize="12.5" fontWeight={600} fill="var(--ink)">
          same spot, mirrored
        </text>
        <text className="torus-text" x={CX + 78} y={171} textAnchor="middle" fontFamily="var(--mono)" fontSize="12" fill="var(--ink-2)">
          t = L
        </text>
      </svg>

      <div className="torus-legend">
        <span>
          <Swatch kind="solid" /> t = 0 — you set out here, pointing right
        </span>
        <span>
          <Swatch kind="outline" /> t = L — one loop later, same spot, mirrored
        </span>
      </div>

      <figcaption>
        Follow the little flag once around. It rotates gradually as it travels — and by the time it
        gets back to where it started, it isn&rsquo;t pointing the same way anymore. It&rsquo;s a
        mirror image of itself. That single fact about the shape of time &mdash; worked out precisely,
        for space rather than a flag &mdash; is what the three papers derive, classify, and then try
        to build physics on.
      </figcaption>
    </figure>
  )
}

function Swatch({ kind }: { kind: 'solid' | 'outline' }) {
  return (
    <svg
      width="18"
      height="14"
      viewBox="0 0 18 14"
      aria-hidden="true"
      style={{ verticalAlign: '-2px', marginRight: '0.4rem', flex: 'none' }}
    >
      <path
        d={kind === 'solid' ? 'M2 1 L2 13 L16 7 Z' : 'M16 1 L16 13 L2 7 Z'}
        fill={kind === 'solid' ? 'var(--accent)' : 'none'}
        stroke={kind === 'solid' ? 'none' : 'var(--ink)'}
        strokeWidth={kind === 'solid' ? 0 : 1.4}
      />
    </svg>
  )
}
