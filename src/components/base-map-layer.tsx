"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import { setWorkerUrl } from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import "@maplibre/maplibre-gl-leaflet"

// Mapa base vectorial gratuito (OpenFreeMap sobre datos de OpenStreetMap): sin clave ni límites,
// nítido en pantallas retina y sin los picos/ruido del estilo estándar. Se usa dentro de Leaflet.
const STYLE = "https://tiles.openfreemap.org/styles/positron"
// El empaquetador no localiza solo el worker de maplibre: se sirve desde /public/maplibre
// (copia de maplibre-gl-worker.mjs y maplibre-gl-shared.mjs). Si se actualiza maplibre-gl, volver a copiarlos.
const WORKER = "/maplibre/maplibre-gl-worker.mjs"

export function BaseMapLayer() {
    const map = useMap()
    useEffect(() => {
        setWorkerUrl(new URL(WORKER, window.location.origin).href)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- el plugin añade maplibreGL a L sin tipos globales
        const layer = (L as any).maplibreGL({ style: STYLE, attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' })
        layer.addTo(map)
        return () => { map.removeLayer(layer) }
    }, [map])
    return null
}
