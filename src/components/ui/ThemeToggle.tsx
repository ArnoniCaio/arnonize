import { useTheme } from '@/context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-40 w-9 h-9 rounded-xl flex items-center justify-center active:opacity-70"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
      }}
      aria-label="Alternar tema"
    >
      <i
        className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'} text-[18px]`}
        style={{ color: 'var(--text-muted)' }}
      />
    </button>
  )
}
