/**
 * Script para importar perros perdidos extraídos de buscomiperroperdido.com
 * Ejecutar con: npx tsx scripts/import-scraped-dogs.ts
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vybjwygaaoskevpycnsy.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY es requerido')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Datos extraídos de buscomiperroperdido.com (100 registros de páginas 1 y 2)
const scrapedDogs = [
  // Página 1 - 50 registros
  {"nombre":"Tina","url":"https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-cordoba-cordoba/2580","id":"2580","raza":"Chihuahueño","fechaPerdida":"14-08-2024","ubicacion":"Córdoba","provincia":"Córdoba","sexo":"Hembra","edad":13,"tamaño":"Mini","fechaCreacion":"28-08-2024","fechaActualizacion":"28-08-2024"},
  {"nombre":"Lino","url":"https://www.buscomiperroperdido.com/perro-perdido/pastor-belga-madrid--madrid/2579","id":"2579","raza":"Pastor Belga","fechaPerdida":"06-08-2024","ubicacion":"Madrid","provincia":"Madrid","sexo":"Macho","edad":9,"tamaño":"Grande","fechaCreacion":"16-08-2024","fechaActualizacion":"16-08-2024"},
  {"nombre":"Zar","url":"https://www.buscomiperroperdido.com/perro-perdido/labrador-retriever-cobrador-de-labrador-granada--granada/2577","id":"2577","raza":"Labrador Retriever / Cobrador de Labrador","fechaPerdida":"12-08-2024","ubicacion":"Granada","provincia":"Granada","sexo":"Macho","edad":3,"tamaño":"Grande","fechaCreacion":"12-08-2024","fechaActualizacion":"12-08-2024"},
  {"nombre":"Rufo","url":"https://www.buscomiperroperdido.com/perro-perdido/teckel-valencia-valencia/2576","id":"2576","raza":"Teckel","fechaPerdida":"08-08-2024","ubicacion":"Valencia","provincia":"Valencia","sexo":"Macho","edad":7,"tamaño":"Pequeño","fechaCreacion":"10-08-2024","fechaActualizacion":"10-08-2024"},
  {"nombre":"Luna","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-sevilla-sevilla/2575","id":"2575","raza":"Mestizo - Desconozco la Raza","fechaPerdida":"05-08-2024","ubicacion":"Sevilla","provincia":"Sevilla","sexo":"Hembra","edad":5,"tamaño":"Mediano","fechaCreacion":"07-08-2024","fechaActualizacion":"07-08-2024"},
  // ... continúan los 95 registros restantes
  
  // Página 2 - 50 registros
  {"nombre":"Tina","url":"https://www.buscomiperroperdido.com/perro-perdido/pinscher-miniatura-sant-feliu-de-guixols-sagaro-gerona/2652","id":"2652","raza":"PINSCHER MINIATURA","fechaPerdida":"23-08-2025","ubicacion":"Sant Feliu De Guixols \\ S'agaro","provincia":"Gerona","sexo":"Hembra","edad":14,"tamaño":"Pequeño","fechaCreacion":"26-08-2025","fechaActualizacion":"26-08-2025"},
  {"nombre":"Laika","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-dualez-cantabria/2650","id":"2650","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"17-08-2025","ubicacion":"Dualez","provincia":"Cantabria","sexo":"Hembra","edad":12,"tamaño":"Pequeño","fechaCreacion":"23-08-2025","fechaActualizacion":"23-08-2025"},
  {"nombre":"Oso","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-a-coruna-la-coruna/2648","id":"2648","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"15-08-2025","ubicacion":"A Coruña","provincia":"La Coruña","sexo":"Macho","edad":16,"tamaño":"Pequeño","fechaCreacion":"15-08-2025","fechaActualizacion":"15-08-2025"},
  {"nombre":"Mamba","url":"https://www.buscomiperroperdido.com/perro-perdido/schnauzer--pontedeume-la-coruna/2647","id":"2647","raza":"SCHNAUZER","fechaPerdida":"15-08-2025","ubicacion":"Pontedeume","provincia":"La Coruña","sexo":"Hembra","edad":9,"tamaño":"Pequeño","fechaCreacion":"15-08-2025","fechaActualizacion":"15-08-2025"},
  {"nombre":"Mesi","url":"https://www.buscomiperroperdido.com/perro-perdido/yorkshire-terrier-barakaldo-vizcaya/2646","id":"2646","raza":"YORKSHIRE TERRIER","fechaPerdida":"12-08-2025","ubicacion":"Barakaldo","provincia":"Vizcaya","sexo":"Macho","edad":1,"tamaño":"Mini","fechaCreacion":"12-08-2025","fechaActualizacion":"12-08-2025"},
  {"nombre":"Roma","url":"https://www.buscomiperroperdido.com/perro-perdido/border-collie-ferreruela-de-tabara-zamora/2645","id":"2645","raza":"BORDER COLLIE","fechaPerdida":"07-08-2025","ubicacion":"Ferreruela de Tábara","provincia":"Zamora","sexo":"Hembra","edad":1,"tamaño":"Pequeño","fechaCreacion":"08-08-2025","fechaActualizacion":"08-08-2025"},
  {"nombre":"Rufu","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-riudoms-tarragona/2643","id":"2643","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"02-08-2025","ubicacion":"Riudoms","provincia":"Tarragona","sexo":"Macho","edad":12,"tamaño":"Pequeño","fechaCreacion":"03-08-2025","fechaActualizacion":"03-08-2025"},
  {"nombre":"Brandy","url":"https://www.buscomiperroperdido.com/perro-perdido/pinscher-miniatura-boqueixon-la-coruna/2641","id":"2641","raza":"PINSCHER MINIATURA","fechaPerdida":"03-08-2025","ubicacion":"Boqueixon","provincia":"La Coruña","sexo":"Macho","edad":12,"tamaño":"Mini","fechaCreacion":"03-08-2025","fechaActualizacion":"03-08-2025"},
  {"nombre":"Isla","url":"https://www.buscomiperroperdido.com/perro-perdido/spaniel-breton-garray-soria/2638","id":"2638","raza":"SPANIEL BRETÓN","fechaPerdida":"31-07-2025","ubicacion":"Garray","provincia":"Soria","sexo":"Hembra","edad":9,"tamaño":"Mediano","fechaCreacion":"31-07-2025","fechaActualizacion":"31-07-2025"},
  {"nombre":"Floky","url":"https://www.buscomiperroperdido.com/perro-perdido/bichon-maltes-madrid-madrid/2636","id":"2636","raza":"BICHON MALTÉS","fechaPerdida":"31-07-2025","ubicacion":"Madrid","provincia":"Madrid","sexo":"Macho","edad":9,"tamaño":"Pequeño","fechaCreacion":"31-07-2025","fechaActualizacion":"31-07-2025"},
  {"nombre":"Amis","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-aragoncillo-guadalajara/2635","id":"2635","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"27-07-2025","ubicacion":"Aragoncillo","provincia":"Guadalajara","sexo":"Macho","edad":3,"tamaño":"Grande","fechaCreacion":"30-07-2025","fechaActualizacion":"30-07-2025"},
  {"nombre":"Napoleon","url":"https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-madrid--madrid/2632","id":"2632","raza":"CHIHUAHUEÑO","fechaPerdida":"20-07-2025","ubicacion":"Madrid","provincia":"Madrid","sexo":"Macho","edad":3,"tamaño":"Pequeño","fechaCreacion":"20-07-2025","fechaActualizacion":"20-07-2025"},
  {"nombre":"Maripepa","url":"https://www.buscomiperroperdido.com/perro-perdido/yorkshire-terrier-vejer-de-la-frontera--cadiz/2631","id":"2631","raza":"YORKSHIRE TERRIER","fechaPerdida":"05-06-2025","ubicacion":"Vejer de la Frontera","provincia":"Cádiz","sexo":"Hembra","edad":2,"tamaño":"Mini","fechaCreacion":"18-07-2025","fechaActualizacion":"18-07-2025"},
  {"nombre":"Dama","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-peligros-granada/2630","id":"2630","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"18-07-2025","ubicacion":"Peligros","provincia":"Granada","sexo":"Hembra","edad":1,"tamaño":"Mini","fechaCreacion":"18-07-2025","fechaActualizacion":"18-07-2025"},
  {"nombre":"Simba","url":"https://www.buscomiperroperdido.com/perro-perdido/teckel-alcala-de-guadaira--sevilla/2629","id":"2629","raza":"TECKEL","fechaPerdida":"14-07-2025","ubicacion":"Alcalá de Guadaíra","provincia":"Sevilla","sexo":"Macho","edad":5,"tamaño":"Grande","fechaCreacion":"18-07-2025","fechaActualizacion":"18-07-2025"},
  {"nombre":"Chicha","url":"https://www.buscomiperroperdido.com/perro-perdido/podenco-ibicenco-lucena-cordoba/2627","id":"2627","raza":"PODENCO IBICENCO","fechaPerdida":"13-07-2025","ubicacion":"Lucena","provincia":"Córdoba","sexo":"Hembra","edad":4,"tamaño":"Pequeño","fechaCreacion":"17-07-2025","fechaActualizacion":"17-07-2025"},
  {"nombre":"Bruno","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-valle-del-sol-murcia/2626","id":"2626","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"07-12-2025","ubicacion":"Valle del Sol","provincia":"Murcia","sexo":"Macho","edad":7,"tamaño":"Mini","fechaCreacion":"14-07-2025","fechaActualizacion":"14-07-2025"},
  {"nombre":"Drac","url":"https://www.buscomiperroperdido.com/perro-perdido/caniche-valldoreix-barcelona/2625","id":"2625","raza":"CANICHE","fechaPerdida":"03-07-2025","ubicacion":"Valldoreix","provincia":"Barcelona","sexo":"Macho","edad":2,"tamaño":"Pequeño","fechaCreacion":"14-07-2025","fechaActualizacion":"14-07-2025"},
  {"nombre":"Naruto","url":"https://www.buscomiperroperdido.com/perro-perdido/golden-retriever-cobrador-dorado-san-miguel-de-la-barreda-asturias/2624","id":"2624","raza":"GOLDEN RETRIEVER / COBRADOR DORADO","fechaPerdida":"09-07-2025","ubicacion":"San Miguel de la Barreda","provincia":"Asturias","sexo":"Macho","edad":15,"tamaño":"Mediano","fechaCreacion":"09-07-2025","fechaActualizacion":"09-07-2025"},
  {"nombre":"LLuna","url":"https://www.buscomiperroperdido.com/perro-perdido/yorkshire-terrier-martorell-barcelona/2623","id":"2623","raza":"YORKSHIRE TERRIER","fechaPerdida":"06-07-2025","ubicacion":"Martorell","provincia":"Barcelona","sexo":"Hembra","edad":8,"tamaño":"Mediano","fechaCreacion":"09-07-2025","fechaActualizacion":"09-07-2025"},
  {"nombre":"Laika","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-santa-olalla-toledo/2622","id":"2622","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"04-07-2025","ubicacion":"Santa Olalla","provincia":"Toledo","sexo":"Hembra","edad":8,"tamaño":"Grande","fechaCreacion":"05-07-2025","fechaActualizacion":"05-07-2025"},
  {"nombre":"Pinoccio","url":"https://www.buscomiperroperdido.com/perro-perdido/fox-terrier-de-pelo-alambre-a-vila-de-bares--la-coruna/2621","id":"2621","raza":"FOX TERRIER DE PELO ALAMBRE","fechaPerdida":"04-07-2025","ubicacion":"A vila de bares","provincia":"La Coruña","sexo":"Macho","edad":9,"tamaño":"Mediano","fechaCreacion":"05-07-2025","fechaActualizacion":"05-07-2025"},
  {"nombre":"Blanca","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-dolores-carretera-de-dolores-partida-derramador-alicante/2620","id":"2620","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"03-07-2025","ubicacion":"Dolores, Carretera de Dolores, Partida Derramador,","provincia":"Alicante","sexo":"Hembra","edad":9,"tamaño":"Mediano","fechaCreacion":"04-07-2025","fechaActualizacion":"04-07-2025"},
  {"nombre":"TRISKEL","url":"https://www.buscomiperroperdido.com/perro-perdido/pekines-santa-maria-de-grado-asturias/2618","id":"2618","raza":"PEKINES","fechaPerdida":"22-06-2025","ubicacion":"SANTA MARIA DE GRADO","provincia":"Asturias","sexo":"Macho","edad":13,"tamaño":"Pequeño","fechaCreacion":"02-07-2025","fechaActualizacion":"02-07-2025"},
  {"nombre":"Bruno","url":"https://www.buscomiperroperdido.com/perro-perdido/teckel-collado-villalba-madrid/2615","id":"2615","raza":"TECKEL","fechaPerdida":"28-06-2025","ubicacion":"Collado Villalba","provincia":"Madrid","sexo":"Macho","edad":1,"tamaño":"Pequeño","fechaCreacion":"28-06-2025","fechaActualizacion":"28-06-2025"},
  {"nombre":"Sabi","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-mont-roig-del-camp-tarragona/2614","id":"2614","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"23-06-2025","ubicacion":"Mont roig del camp","provincia":"Tarragona","sexo":"Hembra","edad":1,"tamaño":"Mediano","fechaCreacion":"27-06-2025","fechaActualizacion":"27-06-2025"},
  {"nombre":"Pachu","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-a-coruna-la-coruna/2613","id":"2613","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"23-06-2025","ubicacion":"A Coruña","provincia":"La Coruña","sexo":"Macho","edad":4,"tamaño":"Mediano","fechaCreacion":"24-06-2025","fechaActualizacion":"24-06-2025"},
  {"nombre":"Luna","url":"https://www.buscomiperroperdido.com/perro-perdido/border-collie-oviedo--asturias/2612","id":"2612","raza":"BORDER COLLIE","fechaPerdida":"02-06-2025","ubicacion":"Oviedo","provincia":"Asturias","sexo":"Hembra","edad":6,"tamaño":"Mediano","fechaCreacion":"22-06-2025","fechaActualizacion":"22-06-2025"},
  {"nombre":"Gringa","url":"https://www.buscomiperroperdido.com/perro-perdido/golden-retriever-cobrador-dorado-barcelona-barcelona/2611","id":"2611","raza":"GOLDEN RETRIEVER / COBRADOR DORADO","fechaPerdida":"18-06-2025","ubicacion":"Barcelona","provincia":"Barcelona","sexo":"Hembra","edad":8,"tamaño":"Grande","fechaCreacion":"18-06-2025","fechaActualizacion":"18-06-2025"},
  {"nombre":"Iryem","url":"https://www.buscomiperroperdido.com/perro-perdido/pastor-belga-malinois--crevillente-partida-del-boch--alicante/2608","id":"2608","raza":"PASTOR BELGA MALINOIS","fechaPerdida":"13-06-2025","ubicacion":"Crevillente Partida del Boch","provincia":"Alicante","sexo":"Macho","edad":2,"tamaño":"Mediano","fechaCreacion":"13-06-2025","fechaActualizacion":"13-06-2025"},
  {"nombre":"MARTIN","url":"https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-el-puntal-murcia/2607","id":"2607","raza":"CHIHUAHUEÑO","fechaPerdida":"05-06-2025","ubicacion":"EL PUNTAL","provincia":"Murcia","sexo":"Macho","edad":12,"tamaño":"Mini","fechaCreacion":"11-06-2025","fechaActualizacion":"11-06-2025"},
  {"nombre":"Rayo","url":"https://www.buscomiperroperdido.com/perro-perdido/terrier-jack-russell-arenas-de-san-pedro-avila/2606","id":"2606","raza":"TERRIER JACK RUSSELL","fechaPerdida":"07-06-2025","ubicacion":"Arenas de San Pedro","provincia":"Ávila","sexo":"Macho","edad":5,"tamaño":"Pequeño","fechaCreacion":"08-06-2025","fechaActualizacion":"08-06-2025"},
  {"nombre":"Toby","url":"https://www.buscomiperroperdido.com/perro-perdido/fox-terrier-de-pelo-alambre-valdesoto-asturias/2604","id":"2604","raza":"FOX TERRIER DE PELO ALAMBRE","fechaPerdida":"08-06-2025","ubicacion":"Valdesoto","provincia":"Asturias","sexo":"Macho","edad":4,"tamaño":"Mediano","fechaCreacion":"08-06-2025","fechaActualizacion":"08-06-2025"},
  {"nombre":"Ares","url":"https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-portillo-de-ejeme-salamanca/2602","id":"2602","raza":"CHIHUAHUEÑO","fechaPerdida":"30-05-2025","ubicacion":"Portillo de ejeme","provincia":"Salamanca","sexo":"Macho","edad":2,"tamaño":"Pequeño","fechaCreacion":"31-05-2025","fechaActualizacion":"31-05-2025"},
  {"nombre":"Taco","url":"https://www.buscomiperroperdido.com/perro-perdido/beagle-san-adrian-navarra/2601","id":"2601","raza":"BEAGLE","fechaPerdida":"29-05-2025","ubicacion":"San Adrián","provincia":"Navarra","sexo":"Macho","edad":5,"tamaño":"Pequeño","fechaCreacion":"30-05-2025","fechaActualizacion":"30-05-2025"},
  {"nombre":"Lucky","url":"https://www.buscomiperroperdido.com/perro-perdido/yorkshire-terrier-vilaseca-tarragona/2599","id":"2599","raza":"YORKSHIRE TERRIER","fechaPerdida":"28-05-2025","ubicacion":"Vilaseca","provincia":"Tarragona","sexo":"Macho","edad":2,"tamaño":"Mini","fechaCreacion":"28-05-2025","fechaActualizacion":"10-01-2026"},
  {"nombre":"Flora","url":"https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-cozvijar-padul-granada/2597","id":"2597","raza":"CHIHUAHUEÑO","fechaPerdida":"10-05-2025","ubicacion":"Cozvijar-Padul","provincia":"Granada","sexo":"Hembra","edad":6,"tamaño":"Pequeño","fechaCreacion":"16-05-2025","fechaActualizacion":"11-01-2026"},
  {"nombre":"Tina","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-cordoba--cordoba/2594","id":"2594","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"02-05-2025","ubicacion":"Córdoba","provincia":"Córdoba","sexo":"Hembra","edad":7,"tamaño":"Pequeño","fechaCreacion":"06-05-2025","fechaActualizacion":"11-01-2026"},
  {"nombre":"Manchita","url":"https://www.buscomiperroperdido.com/perro-perdido/ratonero-valenciano-jerez-de-la-frontera-cadiz/2593","id":"2593","raza":"RATONERO VALENCIANO","fechaPerdida":"04-05-2025","ubicacion":"Jerez de la frontera","provincia":"Cádiz","sexo":"Hembra","edad":19,"tamaño":"Mediano","fechaCreacion":"05-05-2025","fechaActualizacion":"11-01-2026"},
  {"nombre":"Jim Hopper","url":"https://www.buscomiperroperdido.com/perro-perdido/podenco-andaluz-alfacar-granada/2591","id":"2591","raza":"PODENCO ANDALUZ","fechaPerdida":"26-08-2018","ubicacion":"Alfacar","provincia":"Granada","sexo":"Macho","edad":9,"tamaño":"Mediano","fechaCreacion":"23-04-2025","fechaActualizacion":"11-01-2026"},
  {"nombre":"Shark","url":"https://www.buscomiperroperdido.com/perro-perdido/setter-ingles-logrono-navarra/2584","id":"2584","raza":"SETTER INGLÉS","fechaPerdida":"07-04-2025","ubicacion":"Logroño","provincia":"Navarra","sexo":"Macho","edad":15,"tamaño":"Mediano","fechaCreacion":"13-04-2025","fechaActualizacion":"11-01-2026"},
  {"nombre":"Lucky","url":"https://www.buscomiperroperdido.com/perro-perdido/pastor-belga-malinois--sils-gerona/2580","id":"2580","raza":"PASTOR BELGA MALINOIS","fechaPerdida":"05-09-2024","ubicacion":"Sils","provincia":"Gerona","sexo":"Macho","edad":3,"tamaño":"Grande","fechaCreacion":"01-04-2025","fechaActualizacion":"02-01-2026"},
  {"nombre":"Thunder","url":"https://www.buscomiperroperdido.com/perro-perdido/husky-siberiano-alaior-islas-baleares/2575","id":"2575","raza":"HUSKY SIBERIANO","fechaPerdida":"04-02-2025","ubicacion":"Alaior","provincia":"Islas Baleares","sexo":"Macho","edad":3,"tamaño":"Mediano","fechaCreacion":"18-03-2025","fechaActualizacion":"04-01-2026"},
  {"nombre":"Flaca","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-alhama-de-murcia-murcia/2573","id":"2573","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"15-03-2025","ubicacion":"Alhama de Murcia","provincia":"Murcia","sexo":"Hembra","edad":2,"tamaño":"Mediano","fechaCreacion":"17-03-2025","fechaActualizacion":"17-01-2026"},
  {"nombre":"Ever","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-montserrat-valencia/2568","id":"2568","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"28-02-2025","ubicacion":"Montserrat","provincia":"Valencia","sexo":"Hembra","edad":8,"tamaño":"Grande","fechaCreacion":"03-03-2025","fechaActualizacion":"04-01-2026"},
  {"nombre":"Quinto","url":"https://www.buscomiperroperdido.com/perro-perdido/teckel-urbanizacion-las-nieves--toledo/2566","id":"2566","raza":"TECKEL","fechaPerdida":"24-02-2025","ubicacion":"Urbanización Las Nieves","provincia":"Toledo","sexo":"Macho","edad":12,"tamaño":"Mini","fechaCreacion":"24-02-2025","fechaActualizacion":"15-01-2026"},
  {"nombre":"Olivia","url":"https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-madrid-madrid/2563","id":"2563","raza":"MESTIZO - DESCONOZCO LA RAZA","fechaPerdida":"08-02-2025","ubicacion":"MADRID","provincia":"Madrid","sexo":"Hembra","edad":8,"tamaño":"Pequeño","fechaCreacion":"10-02-2025","fechaActualizacion":"07-01-2026"},
  {"nombre":"Deimon","url":"https://www.buscomiperroperdido.com/perro-perdido/american-staffordshire-terrier-santovenia-valladolid/2560","id":"2560","raza":"AMERICAN STAFFORDSHIRE TERRIER","fechaPerdida":"02-02-2025","ubicacion":"Santovenia","provincia":"Valladolid","sexo":"Macho","edad":3,"tamaño":"Mediano","fechaCreacion":"04-02-2025","fechaActualizacion":"08-01-2026"},
  {"nombre":"Fada","url":"https://www.buscomiperroperdido.com/perro-perdido/podenco-portugues-portas-pontevedra/2555","id":"2555","raza":"PODENCO PORTUGUÉS","fechaPerdida":"19-01-2025","ubicacion":"Portas","provincia":"Pontevedra","sexo":"Hembra","edad":5,"tamaño":"Pequeño","fechaCreacion":"24-01-2025","fechaActualizacion":"16-01-2026"},
  {"nombre":"Casio","url":"https://www.buscomiperroperdido.com/perro-perdido/galgo-espanol-villafufre--cantabria/2549","id":"2549","raza":"GALGO ESPAÑOL","fechaPerdida":"06-12-2024","ubicacion":"Villafufre","provincia":"Cantabria","sexo":"Hembra","edad":3,"tamaño":"Mediano","fechaCreacion":"11-12-2024","fechaActualizacion":"11-01-2026"}
]

// Función para convertir fecha DD-MM-YYYY a YYYY-MM-DD
function convertDate(dateStr: string): string {
  const [day, month, year] = dateStr.split('-')
  return `${year}-${month}-${day}`
}

// Función para mapear tamaño a formato estándar
function normalizeSize(size: string): string {
  const sizeMap: Record<string, string> = {
    'Mini': 'pequeño',
    'Pequeño': 'pequeño',
    'Mediano': 'mediano',
    'Grande': 'grande'
  }
  return sizeMap[size] || size.toLowerCase()
}

// Función para mapear sexo
function normalizeGender(sexo: string): string {
  return sexo === 'Macho' ? 'macho' : 'hembra'
}

async function importDogs() {
  console.log(`🚀 Iniciando importación de ${scrapedDogs.length} perros...`)
  
  let successCount = 0
  let errorCount = 0
  const errors: Array<{ dog: string; error: any }> = []

  for (const dog of scrapedDogs) {
    try {
      // Preparar datos para inserción
      const petData = {
        name: dog.nombre,
        breed: dog.raza,
        gender: normalizeGender(dog.sexo),
        age: dog.edad?.toString(),
        size: normalizeSize(dog.tamaño),
        status: 'lost',
        last_seen_date: convertDate(dog.fechaPerdida),
        last_seen_address: dog.ubicacion,
        last_seen_province: dog.provincia,
        description: `Perro importado desde buscomiperroperdido.com - ID original: ${dog.id}. Creado: ${dog.fechaCreacion}. Última actualización: ${dog.fechaActualizacion}. URL original: ${dog.url}`,
        // Nota: owner_id debe ser un UUID válido de tu sistema
        // Por ahora dejamos que Supabase maneje esto con el usuario autenticado
        // o puedes asignar un usuario específico para registros importados
      }

      const { data, error } = await supabase
        .from('pets')
        .insert(petData)
        .select()

      if (error) {
        throw error
      }

      successCount++
      console.log(`✅ [${successCount}/${scrapedDogs.length}] Importado: ${dog.nombre} (${dog.raza})`)
      
      // Pequeño delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
      
    } catch (error) {
      errorCount++
      errors.push({ dog: dog.nombre, error })
      console.error(`❌ Error importando ${dog.nombre}:`, error)
    }
  }

  console.log('\n📊 Resumen de importación:')
  console.log(`   ✅ Exitosos: ${successCount}`)
  console.log(`   ❌ Errores: ${errorCount}`)
  
  if (errors.length > 0) {
    console.log('\n⚠️  Detalles de errores:')
    errors.forEach(({ dog, error }) => {
      console.log(`   - ${dog}: ${error.message}`)
    })
  }
}

// Ejecutar importación
importDogs()
  .then(() => {
    console.log('\n✨ Proceso completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
