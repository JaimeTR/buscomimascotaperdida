"use client"

import { useEffect } from 'react'

export function PWARegister() {
    useEffect(() => {
        // En desarrollo el SW cachearía chunks viejos y confundiría las pruebas.
        if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then((registration) => {
                    console.log('[PWA] Service Worker registrado:', registration.scope)

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('[PWA] Nueva versión disponible')

                                    // Show update notification
                                    if (confirm('Hay una nueva versión disponible. ¿Actualizar ahora?')) {
                                        newWorker.postMessage({ type: 'SKIP_WAITING' })
                                        window.location.reload()
                                    }
                                }
                            })
                        }
                    })
                })
                .catch((error) => {
                    console.error('[PWA] Error al registrar Service Worker:', error)
                })

            // Listen for controller change
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('[PWA] Controlador actualizado')
            })

            // Handle offline/online status
            window.addEventListener('online', () => {
                console.log('[PWA] Conexión restaurada')
            })

            window.addEventListener('offline', () => {
                console.log('[PWA] Sin conexión')
            })
        }
    }, [])

    return null
}
