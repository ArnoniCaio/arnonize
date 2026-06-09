import { registerSW } from 'virtual:pwa-register'
import { StrictMode } from 'react'

registerSW({
  immediate: true,
  onRegistered(r) {
    r && setInterval(() => r.update(), 60 * 60 * 1000)
  },
})
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import './styles/index.css'
import App from './App.tsx'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
