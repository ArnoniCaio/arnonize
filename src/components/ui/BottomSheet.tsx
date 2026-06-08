import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <div className="relative bg-[#0d0d14] rounded-t-2xl border-t border-[#1e1e2e] px-4 pt-3 pb-8 max-h-[90vh] overflow-y-auto">
        <div className="w-10 h-1 bg-[#1e1e32] rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-[#e2e2f0]">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#1a1a2e] flex items-center justify-center"
          >
            <i className="ti ti-x text-[#6b6b80]" style={{ fontSize: 14 }} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
