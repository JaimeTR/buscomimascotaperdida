"use client"

import { useState } from "react"
import { Facebook, Share2, Link2, Instagram, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/toast-modern"

interface SocialShareProps {
    petName: string
    variant?: "inline" | "floating"
}

export function SocialShare({ petName, variant = "inline" }: SocialShareProps) {
    const { toast } = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ""
    const shareText = `¡Ayúdanos a encontrar a ${petName}! 🐾 Por favor comparte este reporte.`

    const handleShare = (platform: 'facebook' | 'twitter' | 'whatsapp' | 'copy') => {
        let url = ""
        switch (platform) {
            case 'facebook':
                url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                break
            case 'twitter':
                url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
                break
            case 'whatsapp':
                url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
                break
            case 'copy':
                navigator.clipboard.writeText(shareUrl)
                toast("Enlace copiado al portapapeles", { type: "success", title: "¡Copiado!" })
                setIsOpen(false)
                return
        }

        if (url) {
            window.open(url, '_blank', 'width=600,height=400')
            setIsOpen(false)
        }
    }

    if (variant === "floating") {
        return (
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <button className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-teal-800 hover:bg-teal-800 text-white shadow-2xl shadow-teal-700/40 flex items-center justify-center transition-all hover:scale-110 group">
                        <Share2 className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4 mb-2 mr-4 rounded-2xl shadow-2xl" align="end" side="top">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-stone-900">Compartir reporte</h3>
                            <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            <button
                                onClick={() => handleShare('facebook')}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-teal-50 transition-colors group"
                            >
                                <div className="h-12 w-12 bg-teal-50 group-hover:bg-teal-100 rounded-full flex items-center justify-center">
                                    <Facebook className="h-5 w-5 fill-teal-800" />
                                </div>
                                <span className="text-[10px] font-bold text-stone-600">Facebook</span>
                            </button>

                            <button
                                onClick={() => handleShare('twitter')}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-teal-50 transition-colors group"
                            >
                                <div className="h-12 w-12 bg-teal-50 group-hover:bg-teal-100 rounded-full flex items-center justify-center">
                                    <svg className="h-4 w-4 fill-stone-800" viewBox="0 0 24 24">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold text-stone-600">Twitter</span>
                            </button>

                            <button
                                onClick={() => handleShare('whatsapp')}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-emerald-50 transition-colors group"
                            >
                                <div className="h-12 w-12 bg-emerald-50 group-hover:bg-emerald-100 rounded-full flex items-center justify-center">
                                    <svg className="h-5 w-5 fill-emerald-600" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </div>
                                <span className="text-[10px] font-bold text-stone-600">WhatsApp</span>
                            </button>

                            <button
                                onClick={() => handleShare('copy')}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-stone-50 transition-colors group"
                            >
                                <div className="h-12 w-12 bg-stone-50 group-hover:bg-stone-100 rounded-full flex items-center justify-center">
                                    <Link2 className="h-5 w-5 text-stone-600" />
                                </div>
                                <span className="text-[10px] font-bold text-stone-600">Copiar</span>
                            </button>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        )
    }

    // Inline variant (original)
    return (
        <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs font-black text-stone-400 uppercase tracking-widest">Compartir reporte</span>
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-12 w-12 border-stone-100 text-stone-500 hover:text-teal-800 hover:bg-teal-50 transition-all"
                    onClick={() => handleShare('facebook')}
                >
                    <Facebook className="h-5 w-5 fill-current" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-12 w-12 border-stone-100 text-stone-500 hover:text-teal-500 hover:bg-teal-50 transition-all"
                    onClick={() => handleShare('twitter')}
                >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-12 w-12 border-stone-100 text-stone-500 hover:text-pink-500 hover:bg-pink-50 transition-all"
                    onClick={() => handleShare('copy')}
                >
                    <Instagram className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full h-12 w-12 border-stone-100 text-stone-500 hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                    onClick={() => handleShare('copy')}
                >
                    <Link2 className="h-5 w-5" />
                </Button>
            </div>
        </div>
    )
}

