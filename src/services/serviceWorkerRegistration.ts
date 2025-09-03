// Service Worker Registration for Maidenless Behavior Podcast
// BR2049 themed progressive web app capabilities

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

// Check if service workers are supported and we're not in dev mode with file protocol
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const isValidProtocol = window.location.protocol === 'https:' || isLocalhost;

// Service Worker registration with comprehensive error handling
export function registerSW(config?: ServiceWorkerConfig) {
  if (!('serviceWorker' in navigator)) {
    console.warn('🚫 Service Worker not supported in this browser');
    return;
  }

  if (!isValidProtocol) {
    console.warn('🚫 Service Worker requires HTTPS or localhost');
    return;
  }

  window.addEventListener('load', () => {
    const swUrl = '/sw.js';
    
    if (isLocalhost) {
      // Development environment
      checkValidServiceWorker(swUrl, config);
      
      // Dev info
      navigator.serviceWorker.ready.then(() => {
        console.log('🔧 Development mode: Service Worker registered for offline testing');
      });
    } else {
      // Production environment
      registerValidSW(swUrl, config);
    }
  });

  // Network status monitoring
  setupNetworkStatusHandling(config);
}

// Register service worker in production
function registerValidSW(swUrl: string, config?: ServiceWorkerConfig) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('✅ Service Worker registered successfully');
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available; please refresh
              console.log('🔄 New content available - refresh recommended');
              
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Content cached for offline use
              console.log('📦 Content cached for offline use');
              
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
}

// Check service worker validity in development
function checkValidServiceWorker(swUrl: string, config?: ServiceWorkerConfig) {
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('🌐 No internet connection - running in offline mode');
    });
}

// Unregister service worker
export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('🗑️ Service Worker unregistered');
      })
      .catch((error) => {
        console.error('Service Worker unregistration failed:', error);
      });
  }
}

// Network status handling
function setupNetworkStatusHandling(config?: ServiceWorkerConfig) {
  // Handle online/offline events
  window.addEventListener('online', () => {
    console.log('🌐 Back online - Service Worker will sync data');
    if (config && config.onOnline) {
      config.onOnline();
    }
    
    // Trigger background sync for pending data
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return (registration as any).sync.register('performance-metrics');
      }).catch((error) => {
        console.warn('Background sync registration failed:', error);
      });
    }
  });

  window.addEventListener('offline', () => {
    console.log('📴 Offline mode - Service Worker will serve cached content');
    if (config && config.onOffline) {
      config.onOffline();
    }
  });
}

// Service Worker communication utilities
export class SWMessenger {
  private static instance: SWMessenger;
  
  static getInstance(): SWMessenger {
    if (!this.instance) {
      this.instance = new SWMessenger();
    }
    return this.instance;
  }

  // Cache specific URLs
  async cacheUrls(urls: string[]): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({
          type: 'CACHE_URLS',
          payload: { urls }
        });
      }
    }
  }

  // Clear all caches
  async clearCache(): Promise<void> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        registration.active.postMessage({ type: 'CLEAR_CACHE' });
      }
    }
  }

  // Get cache size
  async getCacheSize(): Promise<number> {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          if (registration.active) {
            const channel = new MessageChannel();
            
            channel.port1.onmessage = (event) => {
              if (event.data.type === 'CACHE_SIZE') {
                resolve(event.data.size);
              }
            };
            
            registration.active.postMessage(
              { type: 'GET_CACHE_SIZE' },
              [channel.port2]
            );
          } else {
            resolve(0);
          }
        });
      } else {
        resolve(0);
      }
    });
  }
}

// Performance monitoring integration
export function updatePerformanceCache() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    // Cache performance-related resources
    const performanceUrls = [
      '/assets/ui-components-*.js',
      '/assets/lazy-components-*.js',
      '/assets/index-*.css'
    ];
    
    SWMessenger.getInstance().cacheUrls(performanceUrls);
  }
}

// Export for global use
declare global {
  interface Window {
    swMessenger: SWMessenger;
  }
}

if (typeof window !== 'undefined') {
  window.swMessenger = SWMessenger.getInstance();
}

export default { registerSW, unregister, SWMessenger };