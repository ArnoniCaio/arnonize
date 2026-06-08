import { useRef, useState } from 'react'

interface Action {
  icon: string
  color: string
  bg: string
  onPress: () => void
}

interface Props {
  children: React.ReactNode
  actions: Action[]
}

const ACTION_WIDTH = 64

export function SwipeableRow({ children, actions }: Props) {
  const [offset, setOffset] = useState(0)
  const startX = useRef(0)
  const startOffset = useRef(0)
  const isDragging = useRef(false)
  const maxOffset = actions.length * ACTION_WIDTH

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    startOffset.current = offset
    isDragging.current = false
  }

  function onTouchMove(e: React.TouchEvent) {
    const dx = e.touches[0].clientX - startX.current
    if (Math.abs(dx) > 5) isDragging.current = true
    const next = Math.max(-maxOffset, Math.min(0, startOffset.current + dx))
    setOffset(next)
  }

  function onTouchEnd() {
    if (offset < -maxOffset / 2) {
      setOffset(-maxOffset)
    } else {
      setOffset(0)
    }
  }

  function handleClick() {
    if (isDragging.current) return
    if (offset !== 0) { setOffset(0); return }
  }

  return (
    <div
      className="relative overflow-hidden bg-[#0a0a0f]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={action.onPress}
            className="flex items-center justify-center"
            style={{ width: ACTION_WIDTH, background: action.bg }}
          >
            <i className={`ti ${action.icon}`} style={{ fontSize: 20, color: action.color }} />
          </button>
        ))}
      </div>
      <div
        className="relative transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offset}px)` }}
        onClick={handleClick}
      >
        {children}
      </div>
    </div>
  )
}
