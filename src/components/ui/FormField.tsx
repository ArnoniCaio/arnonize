interface Props {
  label: string
  children: React.ReactNode
}

export function FormField({ label, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <label className="text-[11px] font-semibold text-[#6b6b80] uppercase tracking-widest">
        {label}
      </label>
      {children}
    </div>
  )
}

export const inputClass = `
  w-full bg-[#13131f] border border-[#1e1e32] rounded-xl px-3 py-3
  text-[14px] text-[#e2e2f0] placeholder-[#3a3a50]
  focus:outline-none focus:border-[#6366f1]
  transition-colors
`.trim()

export const selectClass = inputClass
