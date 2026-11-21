"use client"

import dynamic from "next/dynamic"

export const PetsMapWrapper = dynamic(() => import("@/components/pets-map").then((m) => m.PetsMap), {
    ssr: false,
    loading: () => <div className="h-[520px] animate-pulse rounded-2xl bg-secondary" />,
})
