import { useEffect, useState } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: Props) {
  const [visible, setVisible] = useState(false)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (open) {
      setVisible(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)))
    } else {
      setAnimate(false)
      const t = setTimeout(() => setVisible(false), 300)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        style={{ opacity: animate ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className="relative bg-[#0d0d14] rounded-t-2xl border-t border-[#1e1e2e] px-4 pt-3 overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          transform: animate ? 'translateY(0)' : 'translateY(100%)',
          maxHeight: '85dvh',
          paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))',
        }}
      >
        <div className="w-10 h-1 bg-[#1e1e32] rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-[#e2e2f0]">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center active:scale-95 transition-transform"
          >
            <i className="ti ti-x text-[#6b6b80]" style={{ fontSize: 14 }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
