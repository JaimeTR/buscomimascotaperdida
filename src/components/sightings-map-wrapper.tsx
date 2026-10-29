"use client"

import dynamic from "next/dynamic"

export const SightingsMapWrapper = dynamic(
    () => import("@/components/sightings-map").then(mod => mod.SightingsMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-slate-50 animate-pulse flex items-center justify-center text-slate-400 text-xs rounded-[2.5rem]">
                Cargando mapa...
            </div>
        )
    }
)
