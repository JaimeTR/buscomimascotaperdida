"use client"

import { useState } from "react"
import {
    Phone,
    MessageCircle,
    Mail,
    Copy,
    Check
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast-modern"

interface OwnerContactModalProps {
    ownerName?: string
    phone?: string
    whatsapp?: string
    email?: string
}

export function OwnerContactModal({
    ownerName = "Dueño",
    phone,
    whatsapp,
    email
}: OwnerContactModalProps) {
    const { toast } = useToast()
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        toast(`${field} copiado`, { type: "success" })
        setTimeout(() => setCopiedField(null), 2000)
    }

    const handleWhatsApp = () => {
        if (whatsapp) {
            // Formatear número para WhatsApp
            const cleanNumber = whatsapp.replace(/\D/g, '')
            const whatsappUrl = `https://wa.me/${cleanNumber}`
            window.open(whatsappUrl, '_blank')
        }
    }

    const handleCall = () => {
        if (phone) {
            window.location.href = `tel:${phone}`
        }
    }

    const handleEmail = () => {
        if (email) {
            window.location.href = `mailto:${email}`
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button className="w-full h-16 text-xl font-black rounded-2xl border-2 border-slate-100 bg-white text-slate-900 hover:bg-slate-50" size="lg">
                    <MessageCircle className="mr-3 h-6 w-6 text-blue-500" /> Contactar Dueño
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-4">
                <div className="space-y-2 mb-4">
                    <h3 className="font-black text-lg">Contactar a {ownerName}</h3>
                    <p className="text-sm text-slate-600">Datos de contacto disponibles</p>
                </div>

                <div className="space-y-3">
                    {/* WhatsApp */}
                    {whatsapp && (
                        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-3">
                                <MessageCircle className="h-5 w-5 text-green-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">WhatsApp</p>
                                    <p className="text-sm text-slate-600">{whatsapp}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(whatsapp, 'WhatsApp')}
                                >
                                    {copiedField === 'WhatsApp' ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleWhatsApp}
                                >
                                    Enviar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Phone */}
                    {phone && (
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-blue-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">Teléfono</p>
                                    <p className="text-sm text-slate-600">{phone}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(phone, 'Teléfono')}
                                >
                                    {copiedField === 'Teléfono' ? (
                                        <Check className="h-4 w-4 text-blue-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleCall}
                                >
                                    Llamar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Email */}
                    {email && (
                        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-purple-600" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-700">Email</p>
                                    <p className="text-sm text-slate-600 truncate">{email}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => copyToClipboard(email, 'Email')}
                                >
                                    {copiedField === 'Email' ? (
                                        <Check className="h-4 w-4 text-purple-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={handleEmail}
                                >
                                    Enviar Email
                                </Button>
                            </div>
                        </div>
                    )}

                    {!phone && !whatsapp && !email && (
                        <div className="p-4 bg-slate-100 rounded-lg text-center text-slate-600">
                            El dueño no ha proporcionado datos de contacto público
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
