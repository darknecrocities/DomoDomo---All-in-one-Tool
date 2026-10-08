import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { RootErrorBoundary } from './components/RootErrorBoundary.tsx'

// Global rejection and error shield to prevent unhandled background promise crashes
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('[DomoDomo] Caught unhandled rejection:', event.reason);
    // Prevent unhandled promise rejection from escalating to a fatal crash
    event.preventDefault?.();
  });
  window.addEventListener('error', (event) => {
    console.warn('[DomoDomo] Caught window error:', event.error || event.message);
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </RootErrorBoundary>
  </StrictMode>,
)

// Safe Service Worker Registration: Disabled inside iframes/Anna static-spa to prevent sandbox restrictions
const isIframeOrAnna =
  typeof window !== 'undefined' &&
  (window.self !== window.top ||
   window.location.pathname.includes('/anna-apps/') ||
   window.location.protocol === 'file:' ||
   import.meta.env.BASE_URL === './');

if ('serviceWorker' in navigator && !import.meta.env.DEV && !isIframeOrAnna) {
  window.addEventListener('load', () => {
    try {
      const swPath = (import.meta.env.BASE_URL || './') + 'sw.js';
      navigator.serviceWorker.register(swPath).then(reg => {
        console.log('PWA Service Worker registered:', reg.scope);
        
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent('domodomo:update-available'));
              }
            };
          }
        };

        if (reg.waiting) {
          window.dispatchEvent(new CustomEvent('domodomo:update-available'));
        }
      }).catch(err => {
        console.warn('Service Worker registration skipped or failed:', err);
      });
    } catch (e) {
      console.warn('Service Worker initialization error:', e);
    }
  });
}
