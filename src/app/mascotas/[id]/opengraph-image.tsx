import { ImageResponse } from 'next/og'
import { createPublicClient } from '@/utils/supabase/public'

export const alt = 'Reporte de mascota en Busco mi mascota'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Tarjeta para compartir (WhatsApp, redes). Se usa cuando el reporte no tiene foto propia;
// si la tiene, generateMetadata publica esa foto directamente.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { data: pet } = await createPublicClient().from('pets')
        .select('name, type, breed, status, last_seen_district')
        .eq('id', id).eq('is_hidden', false).maybeSingle()

    const found = pet?.status === 'found' || pet?.status === 'reunited'
    const label = pet?.status === 'reunited' ? 'REUNIDO' : found ? 'ENCONTRADO' : 'SE BUSCA'
    const kind = pet?.type === 'cat' ? 'Gato' : pet?.type === 'dog' ? 'Perro' : 'Mascota'

    return new ImageResponse(
        (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f4faf8', padding: 64, fontFamily: 'sans-serif' }}>
                <div style={{ display: 'flex', fontSize: 34, fontWeight: 700, color: '#0f766e' }}>Busco mi mascota</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '10px 28px', borderRadius: 999, fontSize: 36, fontWeight: 700, color: 'white', background: found ? '#0f766e' : '#dc2626' }}>{label}</div>
                    <div style={{ display: 'flex', fontSize: 120, fontWeight: 800, color: '#134e4a', marginTop: 24 }}>{pet?.name || kind}</div>
                    <div style={{ display: 'flex', fontSize: 44, color: '#475569', marginTop: 8 }}>
                        {[kind, pet?.breed, pet?.last_seen_district].filter(Boolean).join(' · ')}
                    </div>
                </div>
                <div style={{ display: 'flex', fontSize: 30, color: '#475569' }}>Comparte este reporte: ayuda a que vuelva a casa</div>
            </div>
        ),
        size,
    )
}
