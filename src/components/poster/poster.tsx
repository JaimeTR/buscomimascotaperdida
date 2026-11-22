 
import { forwardRef, type CSSProperties } from 'react'
import { FORMATS, TEMPLATES, type PosterState } from '@/lib/poster'

type Props = { state: PosterState; photo: string; qr: string }

const SITE = 'buscomimascotaperdida.com'

/**
 * Cartel dibujado a tamaño real del formato (px de CSS). Todas las medidas salen de `u`
 * (1 = ancho de 800 px) para que el mismo diseño sirva en A4, A3, historia o cuadrado.
 */
export const Poster = forwardRef<HTMLDivElement, Props>(function Poster({ state: s, photo, qr }, ref) {
    const f = FORMATS[s.format]
    const t = TEMPLATES[s.template]
    const u = f.w / 800
    const px = (n: number) => n * u
    const land = f.w > f.h * 1.2 // media hoja: foto a la izquierda
    const sq = f.w === f.h // cuadrado: poco alto, se compacta para que la foto respire
    const full = s.template === 'foto' && !land
    const ink = full ? '#ffffff' : '#0b2b2a'
    const tabs = s.tabs && f.paper && !land && (s.phone || s.whatsapp)
    const hasContact = !!(s.phone || s.whatsapp || s.social)
    const showQr = s.qr && !!qr

    const headline = (
        <div style={{ background: full ? 'transparent' : t.head, color: full ? '#fff' : t.headText, padding: `${px(land ? 10 : sq ? 10 : 18)}px ${px(24)}px`, textAlign: 'center', flexShrink: 0 }}>
            <div className="font-display" style={{ fontSize: px((land ? 44 : sq ? 54 : 78) * Math.min(1, 14 / Math.max(s.headline.length, 1))), fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1, whiteSpace: 'nowrap', ...(full ? { background: t.head, display: 'inline-block', padding: `${px(10)}px ${px(26)}px`, borderRadius: px(14) } : null) }}>
                {s.headline}
            </div>
        </div>
    )

    const name = s.name && (
        <div className="font-display" style={{ fontSize: px(land ? 50 : sq ? 72 : 104), fontWeight: 700, lineHeight: 1, textAlign: 'center', color: full ? '#fff' : t.head === '#FFD600' ? '#0f766e' : t.head, padding: `${px(land ? 4 : 10)}px ${px(24)}px 0`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: full ? '0 2px 12px rgba(0,0,0,.5)' : undefined }}>
            {s.name}
        </div>
    )

    const place = (s.place || s.reference) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: px(12), color: '#fff' }}>
            <svg width={px(34)} height={px(34)} viewBox="0 0 24 24" fill={t.accent === '#0f766e' ? '#FFD600' : t.accent} style={{ flexShrink: 0 }}><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>
            <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: px(land ? 22 : 30), fontWeight: 700, lineHeight: 1.1 }}>{s.place}</div>
                {s.reference && <div style={{ fontSize: px(land ? 16 : 22), opacity: 0.92, marginTop: px(2) }}>{s.reference}</div>}
            </div>
        </div>
    )

    const photoBox = (
        <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', background: '#e2ded4', ...(full || land ? null : { margin: `${px(12)}px ${px(36)}px`, borderRadius: px(28), border: `${px(5)}px solid ${t.head}` }) }}>
            {photo ? <img src={photo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%' }} /> : <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: px(28), color: '#3d5655' }}>Agrega una foto</div>}
            {!full && !land && place && <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `${px(48)}px ${px(26)}px ${px(20)}px`, background: 'linear-gradient(to top, rgba(0,0,0,.82), transparent)' }}>{place}</div>}
        </div>
    )

    const details = !sq && (s.details || s.note) && (
        <div style={{ textAlign: 'center', padding: `${px(4)}px ${px(36)}px`, color: ink }}>
            {s.details && <div style={{ fontSize: px(land ? 22 : 30), fontWeight: 600 }}>{s.details}</div>}
            {s.note && <div style={{ fontSize: px(land ? 17 : 24), marginTop: px(4), opacity: 0.85 }}>{s.note}</div>}
        </div>
    )

    const reward = s.reward && (
        <div style={{ margin: `${px(8)}px ${px(36)}px 0`, border: `${px(4)}px dashed #111`, background: '#FFD600', color: '#111', borderRadius: px(18), padding: `${px(10)}px ${px(16)}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: px(16), flexShrink: 0 }}>
            <span style={{ fontSize: px(26), fontWeight: 700, letterSpacing: '0.12em' }}>RECOMPENSA</span>
            <span style={{ fontSize: px(40), fontWeight: 800, background: '#fff', padding: `0 ${px(14)}px`, borderRadius: px(10) }}>{s.reward}</span>
        </div>
    )

    const chip = (text: string, bg: string, fg: string) => <div style={{ flex: 1, minWidth: 0, background: bg, color: fg, borderRadius: px(14), padding: `${px(8)}px ${px(14)}px`, fontSize: px(26), fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>{text}</div>

    const contact = (hasContact || showQr) && (
        <div style={{ margin: `${px(land ? 6 : 10)}px ${px(land ? 24 : 36)}px 0`, display: 'flex', gap: px(land ? 10 : 18), alignItems: 'stretch', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0, background: '#fff', color: '#0b2b2a', border: `${px(5)}px solid #0b2b2a`, borderRadius: px(24), padding: `${px(land ? 6 : 12)}px ${px(land ? 12 : 18)}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: px(land ? 4 : 8) }}>
                {hasContact ? (
                    <>
                        {s.phone && <><div style={{ fontSize: px(20), fontWeight: 700, letterSpacing: '0.16em', color: '#3d5655' }}>SI LO VES, LLAMA AL</div><div style={{ fontSize: px(land ? 38 : 70), fontWeight: 800, lineHeight: 1, letterSpacing: '0.03em', whiteSpace: 'nowrap' }}>{s.phone}</div></>}
                        {(s.whatsapp || s.social) && <div style={{ display: 'flex', flexDirection: land ? 'column' : 'row', gap: px(10) }}>{s.whatsapp && chip((land ? "" : "WhatsApp ") + s.whatsapp, '#dcfce7', '#14532d')}{s.social && chip(s.social, '#ede9fe', '#4c1d95')}</div>}
                    </>
                ) : (
                    <><div style={{ fontSize: px(land ? 20 : sq ? 22 : 26), fontWeight: 800, lineHeight: 1.15 }}>Escanea el código para ver el reporte y avisar</div></>
                )}
            </div>
            {showQr && (
                <div style={{ width: px(land ? 100 : sq ? 130 : 180), flexShrink: 0, background: '#fff', border: `${px(5)}px solid #0b2b2a`, borderRadius: px(24), padding: px(10), textAlign: 'center' }}>
                    <img src={qr} alt="QR del reporte" style={{ width: '100%', display: 'block' }} />
                    <div style={{ fontSize: px(15), fontWeight: 700, color: '#0b2b2a', marginTop: px(2) }}>ESCANEA</div>
                </div>
            )}
        </div>
    )

    const footer = (
        <div style={{ marginTop: px(12), background: '#0f766e', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: px(2), padding: `${px(land ? 8 : sq ? 8 : 14)}px ${px(20)}px`, flexShrink: 0, textAlign: 'center' }}>
            <div style={{ fontSize: px(land ? 14 : sq ? 17 : 21), fontWeight: 600, letterSpacing: '0.14em', opacity: 0.92 }}>¿LO VISTE? REPÓRTALO EN</div>
            <div style={{ fontSize: px(land ? 26 : sq ? 34 : 42), fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1.1, whiteSpace: 'nowrap' }}>{SITE}</div>
        </div>
    )

    const tabStrip = tabs && (
        <div style={{ display: 'flex', height: px(170), borderTop: '2px dashed #555', flexShrink: 0, background: '#fff' }}>
            {Array.from({ length: 8 }, (_, i) => (
                <div key={i} style={{ flex: 1, borderLeft: i ? '2px dashed #555' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: px(20), fontWeight: 700, color: '#0b2b2a', whiteSpace: 'nowrap' }}>{[s.name, s.phone || s.whatsapp].filter(Boolean).join(' · ')}</div>
                </div>
            ))}
        </div>
    )

    const base: CSSProperties = { width: f.w, height: f.h, position: 'relative', overflow: 'hidden', display: 'flex', background: full ? '#0b2b2a' : '#faf8f3', color: ink, fontFamily: 'var(--font-poppins), system-ui, sans-serif' }

    if (land) {
        return (
            <div ref={ref} style={base}>
                <div style={{ width: '38%', display: 'flex' }}>{photoBox}</div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {headline}{name}{details}
                    {place && <div style={{ margin: `${px(4)}px ${px(24)}px 0`, background: '#0b2b2a', borderRadius: px(14), padding: px(8) }}>{place}</div>}
                    {reward}{contact}{footer}
                </div>
            </div>
        )
    }

    return (
        <div ref={ref} style={{ ...base, flexDirection: 'column' }}>
            {full && (
                <>
                    {photo && <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.65) 0%, rgba(0,0,0,0) 32%, rgba(0,0,0,0) 45%, rgba(0,0,0,.88) 100%)' }} />
                </>
            )}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                {headline}{name}
                {full ? <div style={{ flex: 1 }} /> : photoBox}
                {full && place && <div style={{ padding: `0 ${px(36)}px ${px(10)}px` }}>{place}</div>}
                {details}{reward}{contact}{footer}{tabStrip}
            </div>
        </div>
    )
})
