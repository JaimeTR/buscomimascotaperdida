
"use client"

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Search, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Dynamically import Map to avoid SSR issues
const MapPicker = dynamic(() => import('./map-picker').then(mod => mod.MapPicker), {
    ssr: false,
    loading: () => <div className="h-48 w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs">Cargando mapa...</div>
})

// Simplified Peru Data (subset)
const PERU_DATA: Record<string, Record<string, string[]>> = {
    "Lima": {
        "Lima": [
            "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos", "Cieneguilla",
            "Comas", "El Agustino", "Independencia", "Jesús María", "La Molina", "La Victoria",
            "Lima (Cercado)", "Lince", "Los Olivos", "Lurigancho-Chosica", "Lurín", "Magdalena del Mar",
            "Miraflores", "Pachacamac", "Pucusana", "Pueblo Libre", "Puente Piedra", "Punta Hermosa",
            "Punta Negra", "Rímac", "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho",
            "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita",
            "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo", "Villa El Salvador",
            "Villa María del Triunfo"
        ],
        "Callao": ["Bellavista", "Callao", "Carmen de la Legua-Reynoso", "La Perla", "La Punta", "Ventanilla", "Mi Perú"]
    },
    "Arequipa": {
        "Arequipa": ["Arequipa", "Yanahuara", "Cayma", "Selva Alegre", "Miraflores (Arequipa)", "Jose Luis Bustamante"]
    },
    "Cusco": {
        "Cusco": ["Cusco", "San Jerónimo", "San Sebastián", "Wanchaq", "Saylla"]
    },
    "La Libertad": {
        "Trujillo": ["Trujillo", "Victor Larco Herrera", "Huanchaco", "Moche", "Laredo"]
    },
    "Piura": {
        "Piura": ["Piura", "Castilla", "Catacaos", "Veintiseis de Octubre"]
    },
    "Lambayeque": {
        "Chiclayo": ["Chiclayo", "Jose Leonardo Ortiz", "La Victoria", "Pimentel"]
    }
}

// Geographic data with approx coordinates for centering
const AREA_COORDS: Record<string, { lat: number, lng: number, zoom: number }> = {
    "Lima": { lat: -12.046374, lng: -77.042793, zoom: 11 },
    "Arequipa": { lat: -16.4090, lng: -71.5375, zoom: 12 },
    "Cusco": { lat: -13.5319, lng: -71.9675, zoom: 12 },
    "La Libertad": { lat: -8.1119, lng: -79.0286, zoom: 12 },
    "Piura": { lat: -5.1945, lng: -80.6328, zoom: 12 },
    "Lambayeque": { lat: -6.7719, lng: -79.8441, zoom: 12 },
}

interface LocationPopoverProps {
    onLocationChange: (loc: { department: string, province: string, district: string, lat?: number, lng?: number, address?: string }) => void
    initialValues?: { department: string, province: string, district: string, lat?: number, lng?: number, address?: string }
    showMap?: boolean // Optional prop to show/hide map selector
}

export function LocationPopover({ onLocationChange, initialValues, showMap = true }: LocationPopoverProps) {
    const [department, setDepartment] = useState(initialValues?.department || "")
    const [province, setProvince] = useState(initialValues?.province || "")
    const [district, setDistrict] = useState(initialValues?.district || "")
    const [address, setAddress] = useState(initialValues?.address || "")

    // Coords for the marker
    const [coords, setCoords] = useState<{ lat: number, lng: number } | undefined>(
        initialValues?.lat && initialValues?.lng ? { lat: initialValues.lat, lng: initialValues.lng } : undefined
    )

    // Coords for the map view (flyTo)
    const [mapCenter, setMapCenter] = useState<{ lat: number, lng: number, zoom: number }>({
        lat: initialValues?.lat || -12.046374,
        lng: initialValues?.lng || -77.042793,
        zoom: initialValues?.lat ? 15 : 11
    })

    const departments = Object.keys(PERU_DATA)
    const provinces = department ? Object.keys(PERU_DATA[department]) : []
    const districts = (department && province) ? PERU_DATA[department][province] : []

    const handleDepartmentChange = (v: string) => {
        setDepartment(v)
        setProvince("")
        setDistrict("")
        if (AREA_COORDS[v]) {
            setMapCenter({ ...AREA_COORDS[v], zoom: 10 })
        }
    }

    const handleProvinceChange = (v: string) => {
        setProvince(v)
        setDistrict("")
        // Use generic coords for the department if province coords not specific
        if (AREA_COORDS[department]) {
            setMapCenter({ ...AREA_COORDS[department], zoom: 12 })
        }
    }

    const handleDistrictChange = (v: string) => {
        setDistrict(v)
        if (AREA_COORDS[department]) {
            setMapCenter({ ...AREA_COORDS[department], zoom: 14 })
        }
    }

    useEffect(() => {
        onLocationChange({ department, province, district, lat: coords?.lat, lng: coords?.lng, address })
    }, [department, province, district, coords, address])

    return (
        <div className="space-y-4 p-1">
            <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Departamento</label>
                    <Select value={department} onValueChange={handleDepartmentChange}>
                        <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                            {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                {department && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Provincia</label>
                        <Select value={province} onValueChange={handleProvinceChange}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                {provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {province && (
                    <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">Distrito</label>
                        <Select value={district} onValueChange={handleDistrictChange}>
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                            <SelectContent>
                                {districts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Ubicación Exacta / Referencia</label>
                    <Input
                        placeholder="Ej: Frente al parque..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-9 text-sm"
                    />
                </div>

                {showMap && (
                    <div className="space-y-2 pt-1 border-t border-slate-100 mt-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> Seleccionar en Mapa
                        </p>
                        <div className="h-48 rounded-xl overflow-hidden border border-slate-200">
                            <MapPicker
                                lat={mapCenter.lat}
                                lng={mapCenter.lng}
                                zoom={mapCenter.zoom}
                                onChange={(lat, lng) => setCoords({ lat, lng })}
                            />
                        </div>
                        {coords && (
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] text-blue-500 font-medium italic">
                                    Coordenadas fijadas: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[9px] text-slate-400 hover:text-red-500"
                                    onClick={() => setCoords(undefined)}
                                >
                                    Quitar marcador
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
