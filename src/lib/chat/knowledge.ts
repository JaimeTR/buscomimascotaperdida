// Base de conocimiento de Huellita: hechos del propio sitio. Es la ÚNICA fuente de respuestas "de ayuda":
// el modelo recibe estos fragmentos y no debe inventar nada fuera de ellos ni de los resultados de la base.
export type Doc = { id: string; title: string; url: string; keywords: string; text: string }

export const KNOWLEDGE: Doc[] = [
    {
        id: 'reportar', title: 'Reportar una mascota', url: '/reportar',
        keywords: 'reportar publicar perdi perdida perdido desaparecio registrar crear reporte aviso',
        text: 'Para reportar una mascota perdida o encontrada entra a Reportar, crea una cuenta gratis y completa 3 pasos: datos de la mascota, dónde y cuándo se vio por última vez, y fotos. Entre más claras las fotos y la zona, más rápido la reconocen.',
    },
    {
        id: 'primeras-horas', title: 'Qué hacer si perdiste a tu mascota', url: '/reportar',
        keywords: 'perdi perdida que hacer primeras horas buscar consejos ayuda desaparecio escapo',
        text: 'Publica el reporte cuanto antes con una foto clara y la zona exacta. Recorre la cuadra y pregunta a vecinos, porteros y veterinarias. Revisa la perrera municipal de tu distrito y de los vecinos (suelen conservar animales 5-10 días). Lleva algo con tu olor al lugar donde se perdió y avisa si tiene microchip. Genera un cartel para imprimir y compartir.',
    },
    {
        id: 'encontre', title: 'Encontré una mascota', url: '/reportar',
        keywords: 'encontre encontrada encontrado hallado halle callejero rescate dueno dueño',
        text: 'Si encontraste una mascota, publícala como "Encontrada" con foto y el lugar donde la viste. Llévala a una veterinaria para revisar si tiene microchip. Los dueños que busquen en la zona la verán y recibirán aviso si coincide con su reporte.',
    },
    {
        id: 'cartel', title: 'Generar cartel', url: '/cartel',
        keywords: 'cartel poster imprimir volante afiche pdf compartir descargar',
        text: 'Desde Cartel puedes generar un cartel listo para imprimir o compartir, con la foto y los datos del reporte. También puedes abrirlo desde la ficha de cada mascota.',
    },
    {
        id: 'buscar', title: 'Buscar y ver el mapa', url: '/mascotas',
        keywords: 'buscar busco mapa filtros distrito raza color mascotas encontrar lista ver',
        text: 'En Mascotas puedes buscar por nombre, distrito, raza, color y tamaño, y cambiar entre vista de lista y de mapa. Cada ficha muestra las fotos, la zona y cómo contactar al dueño si él lo permitió.',
    },
    {
        id: 'alertas', title: 'Alertas cerca de ti', url: '/panel/ajustes',
        keywords: 'alertas notificaciones avisos cerca zona radio push correo email avisar',
        text: 'Puedes recibir avisos cuando se reporte una mascota cerca de ti, por correo y con notificaciones en tu dispositivo. Se configuran en Ajustes > Notificaciones de tu cuenta. También avisamos a quien tenga un reporte parecido al tuyo (perdido y encontrado).',
    },
    {
        id: 'contacto-privacidad', title: 'Contacto y privacidad', url: '/privacidad',
        keywords: 'contacto telefono whatsapp correo privacidad datos privado publico contactar dueno',
        text: 'El teléfono, WhatsApp y correo del dueño solo se muestran si él los marcó como públicos. Puedes escribirle por WhatsApp desde la ficha cuando esté disponible. No pedimos datos sensibles y nunca compartas contraseñas por chat.',
    },
    {
        id: 'reunido', title: 'Marcar como reunido', url: '/panel/reportes',
        keywords: 'reunido reencuentro encontre mi mascota cerrar reporte resuelto finalizar',
        text: 'Cuando tu mascota vuelva a casa, entra a Mi panel > Reportes y pulsa "Marcar reunido". Así dejamos de avisar a otros y tu historia puede aparecer en la portada.',
    },
    {
        id: 'costo', title: 'Es gratis', url: '/',
        keywords: 'gratis costo precio cuanto cuesta pagar cobran',
        text: 'Publicar y buscar mascotas en Busco mi mascota es gratis. Los negocios pueden anunciarse o ser aliados desde Promocionar.',
    },
    {
        id: 'aliados', title: 'Aliados, anuncios y voluntarios', url: '/aliados',
        keywords: 'aliados anuncios publicidad negocio veterinaria refugio voluntario promocionar anunciar',
        text: 'Veterinarias, refugios y negocios pueden anunciarse o sumarse como aliados desde Promocionar. La lista de aliados está en la sección Aliados.',
    },
    {
        id: 'perreras', title: 'Perreras y refugios', url: '/aliados',
        keywords: 'perrera municipal refugio veterinaria microchip escanear albergue',
        text: 'Pregunta en la perrera municipal de tu distrito y de los distritos vecinos, en veterinarias cercanas (pueden escanear el microchip) y en refugios. Lleva una foto de tu mascota.',
    },
    {
        id: 'contacto', title: 'Contactar al equipo', url: '/contacto',
        keywords: 'contactar equipo soporte ayuda problema escribir consulta reclamo',
        text: 'Si tienes un problema con tu cuenta o un reporte, escríbenos desde la página Contacto.',
    },
]

const STOP = new Set('para como esta este esto pero porque quiero tengo tiene hay una uno unos unas que con los las del por mas muy mis sus mio mia'.split(' '))

export const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const tokens = (s: string) => norm(s).split(/[^a-z0-9ñ]+/).filter((w) => w.length > 2 && !STOP.has(w))

/** Los k fragmentos más relevantes para la pregunta (puntaje léxico). Vacío si nada coincide. */
export function retrieveKnowledge(query: string, k = 3): Doc[] {
    const q = new Set(tokens(query))
    if (!q.size) return []
    return KNOWLEDGE.map((d) => {
        const kw = new Set(tokens(d.keywords))
        const body = new Set(tokens(d.text))
        let score = 0
        for (const t of q) score += (kw.has(t) ? 3 : 0) + (body.has(t) ? 1 : 0)
        return { d, score }
    })
        .filter((x) => x.score >= 3)
        .sort((a, b) => b.score - a.score)
        .slice(0, k)
        .map((x) => x.d)
}
