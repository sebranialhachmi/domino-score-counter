import { useRef, useState } from 'react'

const ACTIONS_WIDTH = 132
const DRAG_THRESHOLD = 8

// A row that slides sideways to reveal action buttons. In RTL the actions sit
// on the left edge, so the row is dragged to the right to uncover them.
// A plain tap toggles the row too, so it works with a mouse as well.
export default function SwipeRow({ open, onOpenChange, actions, children }) {
  const [dragX, setDragX] = useState(null)
  const gesture = useRef(null)

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    gesture.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      base: open ? ACTIONS_WIDTH : 0,
      axis: null,
    }
  }

  const onPointerMove = (e) => {
    const g = gesture.current
    if (!g || g.id !== e.pointerId) return
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (!g.axis) {
      if (Math.abs(dx) > DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        g.axis = 'x'
        e.currentTarget.setPointerCapture(e.pointerId)
      } else if (Math.abs(dy) > DRAG_THRESHOLD) {
        g.axis = 'y'
      }
    }
    if (g.axis === 'x') {
      setDragX(Math.max(0, Math.min(ACTIONS_WIDTH + 28, g.base + dx)))
    }
  }

  const onPointerUp = (e) => {
    const g = gesture.current
    gesture.current = null
    if (!g || g.id !== e.pointerId) return
    if (g.axis === 'x') {
      onOpenChange(dragX !== null && dragX > ACTIONS_WIDTH / 2)
    } else if (!g.axis) {
      onOpenChange(!open)
    }
    setDragX(null)
  }

  const onPointerCancel = () => {
    gesture.current = null
    setDragX(null)
  }

  const offset = dragX ?? (open ? ACTIONS_WIDTH : 0)

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div
        className="absolute inset-y-0 left-0 flex items-stretch gap-1.5 p-1.5"
        style={{ width: ACTIONS_WIDTH }}
        aria-hidden={!open}
      >
        {actions}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        className={`relative cursor-grab touch-pan-y select-none ${dragX === null ? 'transition-transform duration-200 ease-out' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  )
}
