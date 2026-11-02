"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDistrictsForDepartment, PERU_DEPARTMENTS } from "@/lib/peru-locations"

interface ProfileLocationFieldsProps {
    department: string
    district: string
    onDepartmentChange: (department: string) => void
    onDistrictChange: (district: string) => void
    departmentError?: string
    districtError?: string
    compact?: boolean
}

export function ProfileLocationFields({
    department,
    district,
    onDepartmentChange,
    onDistrictChange,
    departmentError,
    districtError,
    compact = false,
}: ProfileLocationFieldsProps) {
    const districts = getDistrictsForDepartment(department)
    const heightClass = compact ? "h-12" : "h-12"

    return (
        <div className={`grid grid-cols-2 ${compact ? "gap-3" : "gap-3"}`}>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-stone-500">Departamento</label>
                <Select value={department} onValueChange={onDepartmentChange}>
                    <SelectTrigger className={`${heightClass} bg-stone-50 border-stone-200 ${departmentError ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={compact ? "DPTO" : "Selecciona tu departamento"} />
                    </SelectTrigger>
                    <SelectContent>
                        {PERU_DEPARTMENTS.map((value) => (
                            <SelectItem key={value} value={value}>{value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {departmentError && <p className="text-xs text-red-500">{departmentError}</p>}
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-stone-500">Distrito</label>
                <Select value={district} onValueChange={onDistrictChange} disabled={!department}>
                    <SelectTrigger className={`${heightClass} bg-stone-50 border-stone-200 ${districtError ? "border-red-500" : ""}`}>
                        <SelectValue placeholder={compact ? "DIST" : "Selecciona tu distrito"} />
                    </SelectTrigger>
                    <SelectContent>
                        {districts.map((value) => (
                            <SelectItem key={value} value={value}>{value}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {districtError && <p className="text-xs text-red-500">{districtError}</p>}
            </div>
        </div>
    )
}
