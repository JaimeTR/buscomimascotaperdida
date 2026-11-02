// Service Worker for Busco Mi Mascota Perdida PWA
const CACHE_NAME = 'busco-mascota-v2';
const RUNTIME_CACHE = 'busco-mascota-runtime-v2';

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/offline',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Precaching static assets');
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.error('[SW] Failed to cache:', err);
            });
        })
    );
    self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Never cache APIs, authentication, user areas, uploads or non-GET requests.
    if (
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/_next/data/') ||
        url.pathname.startsWith('/auth/') ||
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/admin') ||
        url.pathname.startsWith('/reportar') ||
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/register') ||
        url.pathname.startsWith('/forgot-password') ||
        url.pathname.startsWith('/update-password') ||
        request.method !== 'GET'
    ) {
        return;
    }

    // Only cache the public landing page and the offline fallback.
    if (request.mode === 'navigate') {
        const isPublicNavigation = url.pathname === '/' || url.pathname === '/offline';
        if (!isPublicNavigation) {
            return;
        }

        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const responseToCache = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, responseToCache));
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        return caches.match('/offline');
                    });
                })
        );
        return;
    }

    // Cache only same-origin static assets. Dynamic page responses are never cached.
    const isStaticAsset =
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font' ||
        request.destination === 'image' ||
        url.pathname.startsWith('/_next/static/');

    if (!isStaticAsset) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request)
                .then((response) => {
                    // Don't cache if not successful
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    // Clone and cache for future use
                    const responseToCache = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                });
        })
    );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});
