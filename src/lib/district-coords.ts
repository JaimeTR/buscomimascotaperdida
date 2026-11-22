// Centros aproximados de distritos de Lima y Callao. Se usan para ubicar en el mapa los casos
// que no tienen coordenadas exactas (p. ej. los importados), siempre marcados como "zona aproximada".
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim()

const RAW: Record<string, [number, number]> = {
    "Ancón": [-11.7746, -77.1757], "Ate": [-12.0258, -76.9186], "Barranco": [-12.1491, -77.0207], "Breña": [-12.0576, -77.0508],
    "Carabayllo": [-11.8531, -77.0364], "Chaclacayo": [-11.9764, -76.7673], "Chorrillos": [-12.1738, -77.0151], "Cieneguilla": [-12.1065, -76.7767],
    "Comas": [-11.9392, -77.0592], "El Agustino": [-12.0446, -77.0107], "Independencia": [-11.9922, -77.0518], "Jesús María": [-12.0707, -77.0503],
    "La Molina": [-12.0787, -76.9390], "La Victoria": [-12.0652, -77.0159], "Cercado de Lima": [-12.0464, -77.0428], "Lima": [-12.0464, -77.0428],
    "Lince": [-12.0846, -77.0345], "Los Olivos": [-11.9906, -77.0720], "Lurigancho-Chosica": [-11.9437, -76.6990], "Lurigancho": [-11.9437, -76.6990],
    "Lurín": [-12.2740, -76.8710], "Magdalena del Mar": [-12.0900, -77.0720], "Miraflores": [-12.1211, -77.0297], "Pachacámac": [-12.2290, -76.8590],
    "Pucusana": [-12.4730, -76.7980], "Pueblo Libre": [-12.0730, -77.0630], "Puente Piedra": [-11.8667, -77.0743], "Punta Hermosa": [-12.3340, -76.8230],
    "Punta Negra": [-12.3650, -76.7930], "Rímac": [-12.0286, -77.0430], "San Bartolo": [-12.3880, -76.7770], "San Borja": [-12.1019, -76.9995],
    "San Isidro": [-12.0977, -77.0365], "San Juan de Lurigancho": [-11.9790, -77.0000], "San Juan de Miraflores": [-12.1553, -76.9740],
    "San Luis": [-12.0770, -76.9970], "San Martín de Porres": [-12.0000, -77.0850], "San Miguel": [-12.0780, -77.0900], "Santa Anita": [-12.0452, -76.9712],
    "Santa María del Mar": [-12.3990, -76.7730], "Santa Rosa": [-11.8000, -77.1650], "Santiago de Surco": [-12.1450, -76.9930], "Surquillo": [-12.1110, -77.0120],
    "Villa El Salvador": [-12.2130, -76.9330], "Villa María del Triunfo": [-12.1660, -76.9410],
    // Callao
    "Callao": [-12.0566, -77.1181], "Bellavista": [-12.0620, -77.1130], "La Perla": [-12.0710, -77.1170], "La Punta": [-12.0720, -77.1640],
    "Carmen de la Legua-Reynoso": [-12.0440, -77.0950], "Ventanilla": [-11.8750, -77.1250], "Mi Perú": [-11.8420, -77.1300],
}
const TABLE = new Map(Object.entries(RAW).map(([k, v]) => [norm(k), v]))
TABLE.set("lima cercado", RAW["Lima"])

export function districtCenter(district?: string | null): [number, number] | null {
    if (!district) return null
    return TABLE.get(norm(district)) ?? null
}
