"use client"

import dynamic from "next/dynamic"

export const SightingsMapWrapper = dynamic(
    () => import("@/components/sightings-map").then(mod => mod.SightingsMap),
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full bg-background animate-pulse flex items-center justify-center text-muted-foreground text-xs rounded-[2.5rem]">
                Cargando mapa...
            </div>
        )
    }
)
