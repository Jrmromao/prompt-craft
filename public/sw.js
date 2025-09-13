const CACHE_NAME = 'promptcraft-v1'
const STATIC_CACHE = 'promptcraft-static-v1'
const DYNAMIC_CACHE = 'promptcraft-dynamic-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  // Add critical CSS and JS files
]

// API routes to cache
const API_CACHE_PATTERNS = [
  /^\/api\/prompts\/\w+$/,
  /^\/api\/user\/profile$/,
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      })
      .then(() => self.clients.claim())
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle static assets
  if (request.destination === 'document') {
    event.respondWith(handlePageRequest(request))
    return
  }

  // Handle other assets (images, fonts, etc.)
  event.respondWith(handleAssetRequest(request))
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return fetch(request)
  }

  // Don't cache unsupported schemes
  if (request.url.startsWith('chrome-extension:') || 
      request.url.startsWith('moz-extension:') || 
      request.url.startsWith('safari-extension:') ||
      request.url.startsWith('chrome:') ||
      request.url.startsWith('about:') ||
      request.url.startsWith('data:')) {
    return fetch(request)
  }

  const shouldCache = API_CACHE_PATTERNS.some(pattern => 
    pattern.test(new URL(request.url).pathname)
  )

  if (!shouldCache) {
    return fetch(request)
  }

  try {
    const response = await fetch(request)
    
    if (response.ok) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, response.clone())
      } catch (cacheError) {
        console.warn('Failed to cache API response:', cacheError)
        // Continue without caching
      }
    }
    
    return response
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ error: 'Offline', offline: true }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle page requests with cache-first strategy
async function handlePageRequest(request) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return fetch(request)
  }

  // Don't cache unsupported schemes
  if (request.url.startsWith('chrome-extension:') || 
      request.url.startsWith('moz-extension:') || 
      request.url.startsWith('safari-extension:') ||
      request.url.startsWith('chrome:') ||
      request.url.startsWith('about:') ||
      request.url.startsWith('data:')) {
    return fetch(request)
  }

  try {
    const response = await fetch(request)
    
    if (response.ok) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, response.clone())
      } catch (cacheError) {
        console.warn('Failed to cache page response:', cacheError)
        // Continue without caching
      }
    }
    
    return response
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    return caches.match('/offline.html')
  }
}

// Handle asset requests with cache-first strategy
async function handleAssetRequest(request) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return fetch(request)
  }

  // Don't cache unsupported schemes
  if (request.url.startsWith('chrome-extension:') || 
      request.url.startsWith('moz-extension:') || 
      request.url.startsWith('safari-extension:') ||
      request.url.startsWith('chrome:') ||
      request.url.startsWith('about:') ||
      request.url.startsWith('data:')) {
    return fetch(request)
  }

  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const response = await fetch(request)
    
    if (response.ok) {
      try {
        const cache = await caches.open(DYNAMIC_CACHE)
        await cache.put(request, response.clone())
      } catch (cacheError) {
        console.warn('Failed to cache asset response:', cacheError)
        // Continue without caching
      }
    }
    
    return response
  } catch (error) {
    // Return placeholder for images
    if (request.destination === 'image') {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }
    
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync())
  }
})

async function handleBackgroundSync() {
  // Handle queued actions when back online
  // Note: We don't cache POST requests, so this is mainly for cleanup
  const cache = await caches.open(DYNAMIC_CACHE)
  const requests = await cache.keys()
  
  // Clean up any stale cache entries
  for (const request of requests) {
    if (request.url.includes('/api/') && request.method === 'POST') {
      // Remove any POST requests that shouldn't be cached
      await cache.delete(request)
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || []
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})
