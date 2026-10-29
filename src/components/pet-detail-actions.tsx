"use client"

import { useState } from "react"
import Link from "next/link"
import { MapPin, MessageCircle, Download, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ReportActionButton } from "@/components/report-action-button"
import { createClient } from "@/utils/supabase/client"
import { useToast } from "@/components/ui/toast-modern"

interface PetDetailActionsProps {
    petId: string
    petStatus: string
}

export function PetDetailActions({ petId, petStatus }: PetDetailActionsProps) {
    const [status, setStatus] = useState(petStatus)
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()
    const { toast } = useToast()

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'lost': return 'bg-orange-500 text-white'
            case 'found': return 'bg-emerald-500 text-white'
            case 'in_contact': return 'bg-blue-500 text-white'
            default: return 'bg-slate-500 text-white'
        }
    }

    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'lost': return 'PERDIDO'
            case 'found': return 'ENCONTRADO'
            case 'in_contact': return 'EN CONTACTO'
            default: return 'REUNIDO'
        }
    }

    const handleStatusChange = async (newStatus: string) => {
        try {
            const { error } = await supabase
                .from('pets')
                .update({ status: newStatus })
                .eq('id', petId)
            
            if (error) throw error
            
            setStatus(newStatus)
            setIsOpen(false)
            toast("¡Estado actualizado con éxito!", { type: "success" })
        } catch (error: any) {
            console.error('Error updating status:', error)
            toast("Error al actualizar el estado", { type: "error" })
        }
    }

    return (
        <div className="space-y-4 pt-4">
            {/* Status Badge + Change State Button */}
            <div className="flex items-center gap-3">
                <Badge
                    className={`text-[10px] font-black tracking-wider uppercase px-3 py-1.5 border-0 ${getStatusColor(status)}`}
                >
                    {getStatusLabel(status)}
                </Badge>
                
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <button className="h-10 px-4 rounded-xl border-2 border-slate-100 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm flex items-center gap-2 transition-all">
                            Cambiar estado <ChevronDown className="h-4 w-4" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                        <div className="space-y-1">
                            <button
                                onClick={() => handleStatusChange('lost')}
                                className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg hover:bg-orange-50 text-orange-600 transition-colors"
                            >
                                Perdido
                            </button>
                            <button
                                onClick={() => handleStatusChange('found')}
                                className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors"
                            >
                                Encontrado
                            </button>
                            <button
                                onClick={() => handleStatusChange('in_contact')}
                                className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            >
                                En Contacto
                            </button>
                            <button
                                onClick={() => handleStatusChange('reunited')}
                                className="w-full text-left px-3 py-2 text-sm font-bold rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                            >
                                Reunido
                            </button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <ReportActionButton
                nextUrl={`/mascotas/${petId}/avistamiento`}
                label="Reportar avistamiento"
                icon={<MapPin className="mr-3 h-6 w-6" />}
                className="w-full h-16 text-xl font-black rounded-2xl shadow-2xl shadow-blue-500/30 bg-blue-600 hover:bg-blue-700 text-white border-0"
                size="lg"
            />
            <Button className="w-full h-16 text-xl font-black rounded-2xl border-2 border-slate-100 bg-white text-slate-900 hover:bg-slate-50" size="lg">
                <MessageCircle className="mr-3 h-6 w-6 text-blue-500" /> Contactar Dueño
            </Button>
            <Button variant="outline" className="w-full h-16 text-lg font-bold rounded-2xl border-2 border-slate-100 text-slate-600 hover:bg-slate-50" size="lg" asChild>
                <Link href={`/cartel?id=${petId}`}>
                    <Download className="mr-3 h-5 w-5" /> Generar Cartel PDF
                </Link>
            </Button>
        </div>
    )
}
