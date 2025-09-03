// Maidenless Behavior Podcast - BR2049 Service Worker
// Advanced caching strategy for optimal performance

const CACHE_NAME = 'mbpodcast-v1.0.0';
const STATIC_CACHE = 'mbpodcast-static-v1.0.0';
const RUNTIME_CACHE = 'mbpodcast-runtime-v1.0.0';

// Resources to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/vite.svg',
  '/brand_assets/logo.png',
  '/brand_assets/favicon.ico'
];

// Runtime cache patterns for different resource types
const CACHE_STRATEGIES = {
  // Static assets - Cache first (long term caching)
  static: /\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/,
  
  // API calls - Network first with fallback
  api: /^https?:\/\/.*\/api\//,
  
  // External resources - Stale while revalidate
  external: /^https?:\/\/(fonts\.googleapis\.com|cdnjs\.cloudflare\.com|.*\.youtube\.com)/,
  
  // HTML pages - Network first
  html: /\.html$/
};

// Performance-focused cache configuration
const CACHE_CONFIG = {
  maxEntries: 100,
  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  networkTimeoutSeconds: 3,
  
  // Cache sizes by resource type
  limits: {
    static: 50,
    runtime: 30,
    external: 20
  }
};

// Install event - Precache essential resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE);
        await cache.addAll(PRECACHE_ASSETS);
        console.log('✅ Precached essential assets');
        
        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error('❌ Precaching failed:', error);
      }
    })()
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith('mbpodcast-') && 
          ![CACHE_NAME, STATIC_CACHE, RUNTIME_CACHE].includes(name)
        );
        
        await Promise.all(oldCaches.map(name => caches.delete(name)));
        
        if (oldCaches.length > 0) {
          console.log('🧹 Cleaned up old caches:', oldCaches);
        }
        
        // Take control of all clients immediately
        self.clients.claim();
        console.log('✅ Service Worker activated');
      } catch (error) {
        console.error('❌ Cache cleanup failed:', error);
      }
    })()
  );
});

// Fetch event - Implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

// Main request handler with different strategies
async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Static assets - Cache First
    if (CACHE_STRATEGIES.static.test(url.pathname)) {
      return await cacheFirst(request, STATIC_CACHE);
    }
    
    // Strategy 2: External resources - Stale While Revalidate
    if (CACHE_STRATEGIES.external.test(url.origin)) {
      return await staleWhileRevalidate(request, RUNTIME_CACHE);
    }
    
    // Strategy 3: API calls - Network First
    if (CACHE_STRATEGIES.api.test(url.href)) {
      return await networkFirst(request, RUNTIME_CACHE);
    }
    
    // Strategy 4: HTML pages - Network First with offline fallback
    if (CACHE_STRATEGIES.html.test(url.pathname) || url.pathname === '/') {
      return await networkFirstWithFallback(request);
    }
    
    // Default: Network first for everything else
    return await networkFirst(request, RUNTIME_CACHE);
    
  } catch (error) {
    console.warn('🔥 Request failed:', request.url, error);
    return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Cache First Strategy - Great for static assets
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(request);
  
  if (response.ok) {
    cache.put(request, response.clone());
  }
  
  return response;
}

// Network First Strategy - Fresh content when possible
async function networkFirst(request, cacheName, timeout = CACHE_CONFIG.networkTimeoutSeconds * 1000) {
  const cache = await caches.open(cacheName);
  
  try {
    // Try network first with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      cache.put(request, response.clone());
      await trimCache(cacheName, CACHE_CONFIG.limits.runtime);
    }
    
    return response;
  } catch (error) {
    // Fall back to cache
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate - Best for external resources
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Fetch fresh copy in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
      trimCache(cacheName, CACHE_CONFIG.limits.external);
    }
    return response;
  }).catch(() => {
    // Ignore background fetch errors
  });
  
  // Return cached version immediately if available
  return cached || await fetchPromise;
}

// Network First with Offline Fallback for HTML
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Try cache first
    const cache = await caches.open(RUNTIME_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Fallback to index.html for SPA routing
    const fallback = await cache.match('/index.html') || 
                    await caches.match('/index.html');
    
    return fallback || new Response('Offline', { status: 503 });
  }
}

// Cache maintenance - Trim cache size
async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxEntries) {
      const deleteCount = keys.length - maxEntries;
      const deletePromises = keys
        .slice(0, deleteCount)
        .map(key => cache.delete(key));
      
      await Promise.all(deletePromises);
    }
  } catch (error) {
    console.warn('Cache trim failed:', error);
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'performance-metrics') {
    event.waitUntil(syncPerformanceMetrics());
  }
});

// Sync performance metrics when online
async function syncPerformanceMetrics() {
  try {
    // This would sync with analytics when implemented
    console.log('📊 Syncing performance metrics...');
  } catch (error) {
    console.warn('Metrics sync failed:', error);
  }
}

// Message handling for cache management
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(payload.urls));
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(clearCaches());
      break;
      
    case 'GET_CACHE_SIZE':
      event.waitUntil(getCacheSize().then(size => 
        event.ports[0].postMessage({ type: 'CACHE_SIZE', size })
      ));
      break;
  }
});

// Cache specific URLs on demand
async function cacheUrls(urls) {
  const cache = await caches.open(RUNTIME_CACHE);
  await Promise.all(
    urls.map(url => 
      fetch(url).then(response => {
        if (response.ok) {
          return cache.put(url, response);
        }
      }).catch(() => {
        // Ignore failed caching
      })
    )
  );
}

// Clear all caches
async function clearCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(name => name.startsWith('mbpodcast-'))
      .map(name => caches.delete(name))
  );
}

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    if (name.startsWith('mbpodcast-')) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      totalSize += keys.length;
    }
  }
  
  return totalSize;
}

console.log('🎯 BR2049 Service Worker loaded - Advanced caching enabled');