import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from './services/serviceWorkerRegistration'

// Register Service Worker for enhanced caching and offline capabilities
registerSW({
  onSuccess: (_registration) => {
    console.log('🎯 BR2049 System online - Caching enabled for optimal performance');
  },
  onUpdate: (_registration) => {
    console.log('🔄 System update available - New content cached');
    // Could show an update notification to user
  },
  onOffline: () => {
    console.log('📴 Operating in offline mode - Using cached resources');
  },
  onOnline: () => {
    console.log('🌐 Connection restored - Syncing latest content');
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
