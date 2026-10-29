-- Script completo para importar 50 perros desde buscomiperroperdido.com
-- Ejecutar en Supabase SQL Editor
-- Este script verifica y actualiza el esquema antes de insertar datos

-- ============================================
-- PASO 1: Verificar y actualizar esquema
-- ============================================
DO $$
BEGIN
    -- Verificar que la tabla pets existe
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pets') THEN
        RAISE EXCEPTION 'La tabla pets no existe. Por favor ejecuta las migraciones primero.';
    END IF;

    -- Asegurar que todas las columnas necesarias existen
    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'name') THEN
        ALTER TABLE public.pets ADD COLUMN name text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'breed') THEN
        ALTER TABLE public.pets ADD COLUMN breed text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'gender') THEN
        ALTER TABLE public.pets ADD COLUMN gender text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'age') THEN
        ALTER TABLE public.pets ADD COLUMN age text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'size') THEN
        ALTER TABLE public.pets ADD COLUMN size text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'status') THEN
        ALTER TABLE public.pets ADD COLUMN status text DEFAULT 'lost';
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_date') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_date date;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_address') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_address text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'last_seen_province') THEN
        ALTER TABLE public.pets ADD COLUMN last_seen_province text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'description') THEN
        ALTER TABLE public.pets ADD COLUMN description text;
    END IF;

    IF NOT EXISTS (SELECT FROM pg_attribute WHERE attrelid = 'public.pets'::regclass AND attname = 'type') THEN
        ALTER TABLE public.pets ADD COLUMN type text DEFAULT 'dog';
    END IF;

    -- Hacer owner_id nullable si aún no lo es (para importaciones masivas)
    ALTER TABLE public.pets ALTER COLUMN owner_id DROP NOT NULL;

    RAISE NOTICE 'Esquema verificado y actualizado correctamente';
END $$;

-- ============================================
-- PASO 2: Insertar datos importados
-- ============================================
-- Nota: owner_id se deja como NULL. Puedes actualizarlo después con:
-- UPDATE pets SET owner_id = 'TU-UUID-AQUI' WHERE owner_id IS NULL;

INSERT INTO pets (
  type,
  name, 
  breed, 
  gender, 
  age, 
  size, 
  status, 
  last_seen_date, 
  last_seen_address, 
  last_seen_province, 
  description
) VALUES 
-- Página 2 - Registros más recientes (50 perros)
('dog', 'Tina', 'PINSCHER MINIATURA', 'hembra', '14', 'pequeño', 'lost', '2025-08-23', 'Sant Feliu De Guixols \ S''agaro', 'Gerona', 'Importado desde buscomiperroperdido.com - ID: 2652. URL: https://www.buscomiperroperdido.com/perro-perdido/pinscher-miniatura-sant-feliu-de-guixols-sagaro-gerona/2652'),
('dog', 'Laika', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '12', 'pequeño', 'lost', '2025-08-17', 'Dualez', 'Cantabria', 'Importado desde buscomiperroperdido.com - ID: 2650. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-dualez-cantabria/2650'),
('dog', 'Oso', 'MESTIZO - DESCONOZCO LA RAZA', 'macho', '16', 'pequeño', 'lost', '2025-08-15', 'A Coruña', 'La Coruña', 'Importado desde buscomiperroperdido.com - ID: 2648. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-a-coruna-la-coruna/2648'),
('dog', 'Mamba', 'SCHNAUZER', 'hembra', '9', 'pequeño', 'lost', '2025-08-15', 'Pontedeume', 'La Coruña', 'Importado desde buscomiperroperdido.com - ID: 2647. URL: https://www.buscomiperroperdido.com/perro-perdido/schnauzer--pontedeume-la-coruna/2647'),
('dog', 'Mesi', 'YORKSHIRE TERRIER', 'macho', '1', 'pequeño', 'lost', '2025-08-12', 'Barakaldo', 'Vizcaya', 'Importado desde buscomiperroperdido.com - ID: 2646. URL: https://www.buscomiperroperdido.com/perro-perdido/yorkshire-terrier-barakaldo-vizcaya/2646'),
('dog', 'Roma', 'BORDER COLLIE', 'hembra', '1', 'pequeño', 'lost', '2025-08-07', 'Ferreruela de Tábara', 'Zamora', 'Importado desde buscomiperroperdido.com - ID: 2645. URL: https://www.buscomiperroperdido.com/perro-perdido/border-collie-ferreruela-de-tabara-zamora/2645'),
('dog', 'Rufu', 'MESTIZO - DESCONOZCO LA RAZA', 'macho', '12', 'pequeño', 'lost', '2025-08-02', 'Riudoms', 'Tarragona', 'Importado desde buscomiperroperdido.com - ID: 2643. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-riudoms-tarragona/2643'),
('dog', 'Brandy', 'PINSCHER MINIATURA', 'macho', '12', 'pequeño', 'lost', '2025-08-03', 'Boqueixon', 'La Coruña', 'Importado desde buscomiperroperdido.com - ID: 2641. URL: https://www.buscomiperroperdido.com/perro-perdido/pinscher-miniatura-boqueixon-la-coruna/2641'),
('dog', 'Isla', 'SPANIEL BRETÓN', 'hembra', '9', 'mediano', 'lost', '2025-07-31', 'Garray', 'Soria', 'Importado desde buscomiperroperdido.com - ID: 2638. URL: https://www.buscomiperroperdido.com/perro-perdido/spaniel-breton-garray-soria/2638'),
('dog', 'Floky', 'BICHON MALTÉS', 'macho', '9', 'pequeño', 'lost', '2025-07-31', 'Madrid', 'Madrid', 'Importado desde buscomiperroperdido.com - ID: 2636. URL: https://www.buscomiperroperdido.com/perro-perdido/bichon-maltes-madrid-madrid/2636'),
('dog', 'Amis', 'MESTIZO - DESCONOZCO LA RAZA', 'macho', '3', 'grande', 'lost', '2025-07-27', 'Aragoncillo', 'Guadalajara', 'Importado desde buscomiperroperdido.com - ID: 2635. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-aragoncillo-guadalajara/2635'),
('dog', 'Napoleon', 'CHIHUAHUEÑO', 'macho', '3', 'pequeño', 'lost', '2025-07-20', 'Madrid', 'Madrid', 'Importado desde buscomiperroperdido.com - ID: 2632. URL: https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-madrid--madrid/2632'),
('dog', 'Maripepa', 'YORKSHIRE TERRIER', 'hembra', '2', 'pequeño', 'lost', '2025-06-05', 'Vejer de la Frontera', 'Cádiz', 'Importado desde buscomiperroperdido.com - ID: 2631. URL: https://www.buscomiperroperdido.com/perro-perdido/yorkshire-terrier-vejer-de-la-frontera--cadiz/2631'),
('dog', 'Dama', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '1', 'pequeño', 'lost', '2025-07-18', 'Peligros', 'Granada', 'Importado desde buscomiperroperdido.com - ID: 2630. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-peligros-granada/2630'),
('dog', 'Simba', 'TECKEL', 'macho', '5', 'grande', 'lost', '2025-07-14', 'Alcalá de Guadaíra', 'Sevilla', 'Importado desde buscomiperroperdido.com - ID: 2629. URL: https://www.buscomiperroperdido.com/perro-perdido/teckel-alcala-de-guadaira--sevilla/2629'),
('dog', 'Chicha', 'PODENCO IBICENCO', 'hembra', '4', 'pequeño', 'lost', '2025-07-13', 'Lucena', 'Córdoba', 'Importado desde buscomiperroperdido.com - ID: 2627. URL: https://www.buscomiperroperdido.com/perro-perdido/podenco-ibicenco-lucena-cordoba/2627'),
('dog', 'Bruno', 'MESTIZO - DESCONOZCO LA RAZA', 'macho', '7', 'pequeño', 'lost', '2025-12-07', 'Valle del Sol', 'Murcia', 'Importado desde buscomiperroperdido.com - ID: 2626. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-valle-del-sol-murcia/2626'),
('dog', 'Drac', 'CANICHE', 'macho', '2', 'pequeño', 'lost', '2025-07-03', 'Valldoreix', 'Barcelona', 'Importado desde buscomiperroperdido.com - ID: 2625. URL: https://www.buscomiperroperdido.com/perro-perdido/caniche-valldoreix-barcelona/2625'),
('dog', 'Naruto', 'GOLDEN RETRIEVER / COBRADOR DORADO', 'macho', '15', 'mediano', 'lost', '2025-07-09', 'San Miguel de la Barreda', 'Asturias', 'Importado desde buscomiperroperdido.com - ID: 2624. URL: https://www.buscomiperroperdido.com/perro-perdido/golden-retriever-cobrador-dorado-san-miguel-de-la-barreda-asturias/2624'),
('dog', 'LLuna', 'YORKSHIRE TERRIER', 'hembra', '8', 'mediano', 'lost', '2025-07-06', 'Martorell', 'Barcelona', 'Importado desde buscomiperroperdido.com - ID: 2623. URL: https://www.buscomiperroperdido.com/perro-perdido/yorkshire-terrier-martorell-barcelona/2623'),
('dog', 'Laika', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '8', 'grande', 'lost', '2025-07-04', 'Santa Olalla', 'Toledo', 'Importado desde buscomiperroperdido.com - ID: 2622. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-santa-olalla-toledo/2622'),
('dog', 'Pinoccio', 'FOX TERRIER DE PELO ALAMBRE', 'macho', '9', 'mediano', 'lost', '2025-07-04', 'A vila de bares', 'La Coruña', 'Importado desde buscomiperroperdido.com - ID: 2621. URL: https://www.buscomiperroperdido.com/perro-perdido/fox-terrier-de-pelo-alambre-a-vila-de-bares--la-coruna/2621'),
('dog', 'Blanca', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '9', 'mediano', 'lost', '2025-07-03', 'Dolores, Carretera de Dolores, Partida Derramador,', 'Alicante', 'Importado desde buscomiperroperdido.com - ID: 2620. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-dolores-carretera-de-dolores-partida-derramador-alicante/2620'),
('dog', 'TRISKEL', 'PEKINES', 'macho', '13', 'pequeño', 'lost', '2025-06-22', 'SANTA MARIA DE GRADO', 'Asturias', 'Importado desde buscomiperroperdido.com - ID: 2618. URL: https://www.buscomiperroperdido.com/perro-perdido/pekines-santa-maria-de-grado-asturias/2618'),
('dog', 'Bruno', 'TECKEL', 'macho', '1', 'pequeño', 'lost', '2025-06-28', 'Collado Villalba', 'Madrid', 'Importado desde buscomiperroperdido.com - ID: 2615. URL: https://www.buscomiperroperdido.com/perro-perdido/teckel-collado-villalba-madrid/2615'),
('dog', 'Sabi', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '1', 'mediano', 'lost', '2025-06-23', 'Mont roig del camp', 'Tarragona', 'Importado desde buscomiperroperdido.com - ID: 2614. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-mont-roig-del-camp-tarragona/2614'),
('dog', 'Pachu', 'MESTIZO - DESCONOZCO LA RAZA', 'macho', '4', 'mediano', 'lost', '2025-06-23', 'A Coruña', 'La Coruña', 'Importado desde buscomiperroperdido.com - ID: 2613. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-a-coruna-la-coruna/2613'),
('dog', 'Luna', 'BORDER COLLIE', 'hembra', '6', 'mediano', 'lost', '2025-06-02', 'Oviedo', 'Asturias', 'Importado desde buscomiperroperdido.com - ID: 2612. URL: https://www.buscomiperroperdido.com/perro-perdido/border-collie-oviedo--asturias/2612'),
('dog', 'Gringa', 'GOLDEN RETRIEVER / COBRADOR DORADO', 'hembra', '8', 'grande', 'lost', '2025-06-18', 'Barcelona', 'Barcelona', 'Importado desde buscomiperroperdido.com - ID: 2611. URL: https://www.buscomiperroperdido.com/perro-perdido/golden-retriever-cobrador-dorado-barcelona-barcelona/2611'),
('dog', 'Iryem', 'PASTOR BELGA MALINOIS', 'macho', '2', 'mediano', 'lost', '2025-06-13', 'Crevillente Partida del Boch', 'Alicante', 'Importado desde buscomiperroperdido.com - ID: 2608. URL: https://www.buscomiperroperdido.com/perro-perdido/pastor-belga-malinois--crevillente-partida-del-boch--alicante/2608'),
('dog', 'MARTIN', 'CHIHUAHUEÑO', 'macho', '12', 'pequeño', 'lost', '2025-06-05', 'EL PUNTAL', 'Murcia', 'Importado desde buscomiperroperdido.com - ID: 2607. URL: https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-el-puntal-murcia/2607'),
('dog', 'Rayo', 'TERRIER JACK RUSSELL', 'macho', '5', 'pequeño', 'lost', '2025-06-07', 'Arenas de San Pedro', 'Ávila', 'Importado desde buscomiperroperdido.com - ID: 2606. URL: https://www.buscomiperroperdido.com/perro-perdido/terrier-jack-russell-arenas-de-san-pedro-avila/2606'),
('dog', 'Toby', 'FOX TERRIER DE PELO ALAMBRE', 'macho', '4', 'mediano', 'lost', '2025-06-08', 'Valdesoto', 'Asturias', 'Importado desde buscomiperroperdido.com - ID: 2604. URL: https://www.buscomiperroperdido.com/perro-perdido/fox-terrier-de-pelo-alambre-valdesoto-asturias/2604'),
('dog', 'Ares', 'CHIHUAHUEÑO', 'macho', '2', 'pequeño', 'lost', '2025-05-30', 'Portillo de ejeme', 'Salamanca', 'Importado desde buscomiperroperdido.com - ID: 2602. URL: https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-portillo-de-ejeme-salamanca/2602'),
('dog', 'Taco', 'BEAGLE', 'macho', '5', 'pequeño', 'lost', '2025-05-29', 'San Adrián', 'Navarra', 'Importado desde buscomiperroperdido.com - ID: 2601. URL: https://www.buscomiperroperdido.com/perro-perdido/beagle-san-adrian-navarra/2601'),
('dog', 'Lucky', 'YORKSHIRE TERRIER', 'macho', '2', 'pequeño', 'lost', '2025-05-28', 'Vilaseca', 'Tarragona', 'Importado desde buscomiperroperdido.com - ID: 2599. URL: https://www.buscomiperroperdido.com/perro-perdido/yorkshire-terrier-vilaseca-tarragona/2599'),
('dog', 'Flora', 'CHIHUAHUEÑO', 'hembra', '6', 'pequeño', 'lost', '2025-05-10', 'Cozvijar-Padul', 'Granada', 'Importado desde buscomiperroperdido.com - ID: 2597. URL: https://www.buscomiperroperdido.com/perro-perdido/chihuahueno-cozvijar-padul-granada/2597'),
('dog', 'Tina', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '7', 'pequeño', 'lost', '2025-05-02', 'Córdoba', 'Córdoba', 'Importado desde buscomiperroperdido.com - ID: 2594. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-cordoba--cordoba/2594'),
('dog', 'Manchita', 'RATONERO VALENCIANO', 'hembra', '19', 'mediano', 'lost', '2025-05-04', 'Jerez de la frontera', 'Cádiz', 'Importado desde buscomiperroperdido.com - ID: 2593. URL: https://www.buscomiperroperdido.com/perro-perdido/ratonero-valenciano-jerez-de-la-frontera-cadiz/2593'),
('dog', 'Jim Hopper', 'PODENCO ANDALUZ', 'macho', '9', 'mediano', 'lost', '2018-08-26', 'Alfacar', 'Granada', 'Importado desde buscomiperroperdido.com - ID: 2591. URL: https://www.buscomiperroperdido.com/perro-perdido/podenco-andaluz-alfacar-granada/2591'),
('dog', 'Shark', 'SETTER INGLÉS', 'macho', '15', 'mediano', 'lost', '2025-04-07', 'Logroño', 'Navarra', 'Importado desde buscomiperroperdido.com - ID: 2584. URL: https://www.buscomiperroperdido.com/perro-perdido/setter-ingles-logrono-navarra/2584'),
('dog', 'Lucky', 'PASTOR BELGA MALINOIS', 'macho', '3', 'grande', 'lost', '2024-09-05', 'Sils', 'Gerona', 'Importado desde buscomiperroperdido.com - ID: 2580. URL: https://www.buscomiperroperdido.com/perro-perdido/pastor-belga-malinois--sils-gerona/2580'),
('dog', 'Thunder', 'HUSKY SIBERIANO', 'macho', '3', 'mediano', 'lost', '2025-02-04', 'Alaior', 'Islas Baleares', 'Importado desde buscomiperroperdido.com - ID: 2575. URL: https://www.buscomiperroperdido.com/perro-perdido/husky-siberiano-alaior-islas-baleares/2575'),
('dog', 'Flaca', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '2', 'mediano', 'lost', '2025-03-15', 'Alhama de Murcia', 'Murcia', 'Importado desde buscomiperroperdido.com - ID: 2573. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-alhama-de-murcia-murcia/2573'),
('dog', 'Ever', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '8', 'grande', 'lost', '2025-02-28', 'Montserrat', 'Valencia', 'Importado desde buscomiperroperdido.com - ID: 2568. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-montserrat-valencia/2568'),
('dog', 'Quinto', 'TECKEL', 'macho', '12', 'pequeño', 'lost', '2025-02-24', 'Urbanización Las Nieves', 'Toledo', 'Importado desde buscomiperroperdido.com - ID: 2566. URL: https://www.buscomiperroperdido.com/perro-perdido/teckel-urbanizacion-las-nieves--toledo/2566'),
('dog', 'Olivia', 'MESTIZO - DESCONOZCO LA RAZA', 'hembra', '8', 'pequeño', 'lost', '2025-02-08', 'MADRID', 'Madrid', 'Importado desde buscomiperroperdido.com - ID: 2563. URL: https://www.buscomiperroperdido.com/perro-perdido/mestizo-desconozco-la-raza-madrid-madrid/2563'),
('dog', 'Deimon', 'AMERICAN STAFFORDSHIRE TERRIER', 'macho', '3', 'mediano', 'lost', '2025-02-02', 'Santovenia', 'Valladolid', 'Importado desde buscomiperroperdido.com - ID: 2560. URL: https://www.buscomiperroperdido.com/perro-perdido/american-staffordshire-terrier-santovenia-valladolid/2560'),
('dog', 'Fada', 'PODENCO PORTUGUÉS', 'hembra', '5', 'pequeño', 'lost', '2025-01-19', 'Portas', 'Pontevedra', 'Importado desde buscomiperroperdido.com - ID: 2555. URL: https://www.buscomiperroperdido.com/perro-perdido/podenco-portugues-portas-pontevedra/2555'),
('dog', 'Casio', 'GALGO ESPAÑOL', 'hembra', '3', 'mediano', 'lost', '2024-12-06', 'Villafufre', 'Cantabria', 'Importado desde buscomiperroperdido.com - ID: 2549. URL: https://www.buscomiperroperdido.com/perro-perdido/galgo-espanol-villafufre--cantabria/2549');

-- Nota: Este script inserta 50 registros de perros perdidos
-- Para ver los registros insertados:
-- SELECT * FROM pets WHERE description LIKE '%Importado desde buscomiperroperdido%' ORDER BY created_at DESC;
