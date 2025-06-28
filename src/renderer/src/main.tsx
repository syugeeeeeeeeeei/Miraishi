import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '@renderer/App'
import '@fontsource/zen-maru-gothic/400.css' // Regular
import '@fontsource/zen-maru-gothic/700.css' // Bold

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
