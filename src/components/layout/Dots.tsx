interface DotsProps {
  total: number
  current: number
  autoOn: boolean
  onDotClick: (idx: number) => void
}

export default function Dots({ total, current, autoOn, onDotClick }: DotsProps) {
  return (
    <div className="fixed right-9 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-2.5 fade-in">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          onClick={() => { if (!autoOn) onDotClick(i) }}
          className={`nav-dot ${i === current ? 'active' : ''}`}
          style={{ cursor: autoOn ? 'default' : 'pointer' }}
        />
      ))}
    </div>
  )
}
