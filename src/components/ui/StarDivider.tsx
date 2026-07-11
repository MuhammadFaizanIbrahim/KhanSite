const GOLD = '#D4AF37'

// The site's standard "line — gold star — line" heading divider, with a soft
// blurred glow bridging where each line meets the star.
export default function StarDivider({ lineWidth = 100, gap = 10, style }: {
  lineWidth?: number
  gap?: number
  style?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap, ...style }}>
      {/* Solid at the far/outer end, fading to nothing right before the star —
          that soft fade is what reads as "blurry" at the star's sides. */}
      <div style={{ width: lineWidth, height: 1, background: `linear-gradient(to right, rgba(212,175,55,0.7), transparent)` }} />
      <div style={{ position: 'relative', width: 10, height: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', inset: -7,
          background: 'radial-gradient(circle, rgba(212,175,55,0.6), transparent 70%)',
          filter: 'blur(3px)',
        }} />
        <svg width="10" height="10" viewBox="0 0 24 24" fill={GOLD} style={{ position: 'relative' }}>
          <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2L12 2Z" />
        </svg>
      </div>
      <div style={{ width: lineWidth, height: 1, background: `linear-gradient(to left, rgba(212,175,55,0.7), transparent)` }} />
    </div>
  )
}
