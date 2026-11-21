'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ImageGalleryProps {
    images: string[]
    petName: string
    status: string
}

export function ImageGallery({ images, petName, status }: ImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const gallery = images.length > 0 ? images : ["/img/sin-foto.svg"]

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1))
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] shadow-xl border-4 border-white bg-card group">
                <Badge
                    className={`absolute top-6 left-6 z-10 px-6 py-2 text-xs uppercase tracking-widest font-bold shadow-lg border-0 ${status === 'lost' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                        }`}
                >
                    {status === 'lost' ? 'PERDIDO' : 'ENCONTRADO'}
                </Badge>

                <img
                    src={gallery[currentIndex]}
                    alt={petName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {gallery.length > 1 && (
                    <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-2xl bg-white/90 hover:bg-card border-0"
                            onClick={goToPrevious}
                        >
                            <ChevronLeft className="h-6 w-6 text-foreground" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-12 w-12 rounded-full shadow-2xl bg-white/90 hover:bg-card border-0"
                            onClick={goToNext}
                        >
                            <ChevronRight className="h-6 w-6 text-foreground" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {gallery.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide">
                    {gallery.map((url: string, i: number) => (
                        <div
                            key={i}
                            className={`shrink-0 w-24 h-24 rounded-2xl border-2 overflow-hidden cursor-pointer transition-all ${i === currentIndex
                                    ? 'border-teal-700 shadow-md scale-105'
                                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
                                }`}
                            onClick={() => setCurrentIndex(i)}
                        >
                            <img src={url} alt={`${petName} ${i}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
