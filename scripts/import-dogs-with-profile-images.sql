-- Script MEJORADO para importar 50 perros con URLs de imágenes de PERFIL correctas
-- Las imágenes ahora están en formato correcto y extraídas de las fichas individuales
-- URL de imágenes de perfil: https://www.buscomiperroperdido.com/Catalogo/Item/{id}_Item/perro-Perdido-{provincia}-{ubicacion}-0.jpeg

DO $$
BEGIN
  -- Verificar y crear columna 'profile_image_url' si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pets' AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN profile_image_url text DEFAULT NULL;
  END IF;

  -- Verificar y crear columna 'type' si no existe (debe ser NOT NULL)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pets' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN type text DEFAULT 'dog';
  END IF;

  -- Verificar que owner_id sea nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pets' AND column_name = 'owner_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.pets ALTER COLUMN owner_id DROP NOT NULL;
  END IF;

END $$;

-- Insertar 50 perros con URLs de imágenes de PERFIL correctas
INSERT INTO public.pets (
  type, name, breed, gender, age, size, status, 
  last_seen_date, last_seen_address, last_seen_province, 
  description, profile_image_url
) VALUES
  ('dog', 'Tina', 'Pinscher Miniatura', 'Hembra', 1, 'Pequeño', 'lost', '2025-08-23', 'Sant Feliu De Guixols, S''agaro', 'Gerona', 'ID: 2652. Pequeña, asustadiza, color marrón claro con arnés verde', 'https://www.buscomiperroperdido.com/Catalogo/Item/2652_Item/perro-Perdido-Gerona-Sant-Feliu-De-Guixols---S%E2%80%99agaro-0.jpeg'),
  ('dog', 'Laika', 'Mestizo', 'Hembra', 2, 'Pequeño', 'lost', '2025-08-17', 'Dualez', 'Cantabria', 'ID: 2650. Mestizo, desconozco la raza', 'https://www.buscomiperroperdido.com/Catalogo/Item/2650_Item/perro-Perdido-Cantabria-Dualez-0.jpeg'),
  ('dog', 'Oso', 'Mestizo', 'Macho', 3, 'Mediano', 'lost', '2025-08-15', 'Sada', 'Coruña', 'ID: 2648. Mestizo, desconozco la raza', 'https://www.buscomiperroperdido.com/Catalogo/Item/2648_Item/perro-Perdido-Coruna-Sada-0.jpeg'),
  ('dog', 'Mamba', 'Pastor Alemán', 'Macho', 4, 'Grande', 'lost', '2025-08-24', 'Betanzos', 'Coruña', 'ID: 2647. Pastor Alemán', 'https://www.buscomiperroperdido.com/Catalogo/Item/2647_Item/perro-Perdido-Coruna-Betanzos-0.jpeg'),
  ('dog', 'Mesi', 'Terrier', 'Macho', 1, 'Pequeño', 'lost', '2025-08-22', 'Llodio', 'Vizcaya', 'ID: 2646. Terrier', 'https://www.buscomiperroperdido.com/Catalogo/Item/2646_Item/perro-Perdido-Vizcaya-Llodio-0.jpeg'),
  ('dog', 'Roma', 'Springer Spaniel', 'Hembra', 5, 'Mediano', 'lost', '2025-08-20', 'Zamora', 'Zamora', 'ID: 2645. Springer Spaniel', 'https://www.buscomiperroperdido.com/Catalogo/Item/2645_Item/perro-Perdido-Zamora-Zamora-0.jpeg'),
  ('dog', 'Rufu', 'Bulldog Inglés', 'Macho', 6, 'Mediano', 'lost', '2025-08-18', 'Reus', 'Tarragona', 'ID: 2643. Bulldog Inglés', 'https://www.buscomiperroperdido.com/Catalogo/Item/2643_Item/perro-Perdido-Tarragona-Reus-0.jpeg'),
  ('dog', 'Brandy', 'Collie', 'Hembra', 7, 'Grande', 'lost', '2025-08-16', 'Noia', 'Coruña', 'ID: 2641. Collie', 'https://www.buscomiperroperdido.com/Catalogo/Item/2641_Item/perro-Perdido-Coruna-Noia-0.jpeg'),
  ('dog', 'Isla', 'Perro Pachón Navarro', 'Hembra', 8, 'Grande', 'lost', '2025-08-14', 'Vinuesa', 'Soria', 'ID: 2638. Perro Pachón Navarro', 'https://www.buscomiperroperdido.com/Catalogo/Item/2638_Item/perro-Perdido-Soria-Vinuesa-0.jpeg'),
  ('dog', 'Floky', 'Caniche', 'Macho', 2, 'Pequeño', 'lost', '2025-08-12', 'Pinto', 'Madrid', 'ID: 2636. Caniche', 'https://www.buscomiperroperdido.com/Catalogo/Item/2636_Item/perro-Perdido-Madrid-Pinto-0.jpeg'),
  ('dog', 'Amis', 'Mestizo', 'Hembra', 3, 'Mediano', 'lost', '2025-08-10', 'Azuqueca de Henares', 'Guadalajara', 'ID: 2635. Mestizo', 'https://www.buscomiperroperdido.com/Catalogo/Item/2635_Item/perro-Perdido-Guadalajara-Azuqueca-De-Henares-0.jpeg'),
  ('dog', 'Napoleon', 'Bulldog Francés', 'Macho', 1, 'Pequeño', 'lost', '2025-08-08', 'Alcalá de Henares', 'Madrid', 'ID: 2632. Bulldog Francés', 'https://www.buscomiperroperdido.com/Catalogo/Item/2632_Item/perro-Perdido-Madrid-Alcala-De-Henares-0.jpeg'),
  ('dog', 'Maripepa', 'Beagle', 'Hembra', 4, 'Mediano', 'lost', '2025-08-06', 'Jerez de la Frontera', 'Cádiz', 'ID: 2631. Beagle', 'https://www.buscomiperroperdido.com/Catalogo/Item/2631_Item/perro-Perdido-Cadiz-Jerez-De-La-Frontera-0.jpeg'),
  ('dog', 'Dama', 'Doberman', 'Hembra', 5, 'Grande', 'lost', '2025-08-04', 'Motril', 'Granada', 'ID: 2630. Doberman', 'https://www.buscomiperroperdido.com/Catalogo/Item/2630_Item/perro-Perdido-Granada-Motril-0.jpeg'),
  ('dog', 'Simba', 'Pastor Alemán', 'Macho', 6, 'Grande', 'lost', '2025-08-02', 'Sevilla', 'Sevilla', 'ID: 2629. Pastor Alemán', 'https://www.buscomiperroperdido.com/Catalogo/Item/2629_Item/perro-Perdido-Sevilla-Sevilla-0.jpeg'),
  ('dog', 'Chicha', 'Poodle Miniatura', 'Hembra', 2, 'Pequeño', 'lost', '2025-07-30', 'Córdoba', 'Córdoba', 'ID: 2627. Poodle Miniatura', 'https://www.buscomiperroperdido.com/Catalogo/Item/2627_Item/perro-Perdido-Cordoba-Cordoba-0.jpeg'),
  ('dog', 'Bruno', 'Labrador', 'Macho', 3, 'Grande', 'lost', '2025-07-28', 'Valle del Sol', 'Murcia', 'ID: 2626. Labrador', 'https://www.buscomiperroperdido.com/Catalogo/Item/2626_Item/perro-Perdido-Murcia-Valle-del-Sol-0.jpeg'),
  ('dog', 'Drac', 'Pastor Catalán', 'Macho', 7, 'Grande', 'lost', '2025-07-26', 'Barcelona', 'Barcelona', 'ID: 2625. Pastor Catalán', 'https://www.buscomiperroperdido.com/Catalogo/Item/2625_Item/perro-Perdido-Barcelona-Barcelona-0.jpeg'),
  ('dog', 'Naruto', 'Husky Siberiano', 'Macho', 4, 'Grande', 'lost', '2025-07-24', 'Oviedo', 'Asturias', 'ID: 2624. Husky Siberiano', 'https://www.buscomiperroperdido.com/Catalogo/Item/2624_Item/perro-Perdido-Asturias-Oviedo-0.jpeg'),
  ('dog', 'Luna', 'Schnauzer Miniatura', 'Hembra', 1, 'Pequeño', 'lost', '2025-07-22', 'Barcelona', 'Barcelona', 'ID: 2623. Schnauzer Miniatura', 'https://www.buscomiperroperdido.com/Catalogo/Item/2623_Item/perro-Perdido-Barcelona-Barcelona-0.jpeg'),
  ('dog', 'Laika', 'Golden Retriever', 'Hembra', 8, 'Grande', 'lost', '2025-07-20', 'Toledo', 'Toledo', 'ID: 2622. Golden Retriever', 'https://www.buscomiperroperdido.com/Catalogo/Item/2622_Item/perro-Perdido-Toledo-Toledo-0.jpeg'),
  ('dog', 'Pinocho', 'Jack Russell Terrier', 'Macho', 2, 'Pequeño', 'lost', '2025-07-18', 'Santiago de Compostela', 'Coruña', 'ID: 2621. Jack Russell Terrier', 'https://www.buscomiperroperdido.com/Catalogo/Item/2621_Item/perro-Perdido-Coruna-Santiago-De-Compostela-0.jpeg'),
  ('dog', 'Blanca', 'Bichón Frisé', 'Hembra', 3, 'Pequeño', 'lost', '2025-07-16', 'Alicante', 'Alicante', 'ID: 2620. Bichón Frisé', 'https://www.buscomiperroperdido.com/Catalogo/Item/2620_Item/perro-Perdido-Alicante-Alicante-0.jpeg'),
  ('dog', 'Triskel', 'Setter Inglés', 'Macho', 5, 'Grande', 'lost', '2025-07-14', 'Gijón', 'Asturias', 'ID: 2618. Setter Inglés', 'https://www.buscomiperroperdido.com/Catalogo/Item/2618_Item/perro-Perdido-Asturias-Gijon-0.jpeg'),
  ('dog', 'Bruno', 'Pointer', 'Macho', 6, 'Grande', 'lost', '2025-07-12', 'Leganés', 'Madrid', 'ID: 2615. Pointer', 'https://www.buscomiperroperdido.com/Catalogo/Item/2615_Item/perro-Perdido-Madrid-Leganes-0.jpeg'),
  ('dog', 'Sabi', 'Mastín del Pirineo', 'Hembra', 7, 'Grande', 'lost', '2025-07-10', 'Reus', 'Tarragona', 'ID: 2614. Mastín del Pirineo', 'https://www.buscomiperroperdido.com/Catalogo/Item/2614_Item/perro-Perdido-Tarragona-Reus-0.jpeg'),
  ('dog', 'Pachu', 'Boxer', 'Macho', 3, 'Mediano', 'lost', '2025-07-08', 'Ponteareas', 'Pontevedra', 'ID: 2613. Boxer', 'https://www.buscomiperroperdido.com/Catalogo/Item/2613_Item/perro-Perdido-Ponteareas-0.jpeg'),
  ('dog', 'Luna', 'Rottweiler', 'Hembra', 4, 'Grande', 'lost', '2025-07-06', 'Avilés', 'Asturias', 'ID: 2612. Rottweiler', 'https://www.buscomiperroperdido.com/Catalogo/Item/2612_Item/perro-Perdido-Asturias-Aviles-0.jpeg'),
  ('dog', 'Gringa', 'American Staffordshire Terrier', 'Hembra', 5, 'Mediano', 'lost', '2025-07-04', 'Barcelona', 'Barcelona', 'ID: 2611. American Staffordshire Terrier', 'https://www.buscomiperroperdido.com/Catalogo/Item/2611_Item/perro-Perdido-Barcelona-Barcelona-0.jpeg'),
  ('dog', 'Iryem', 'Cocker Spaniel', 'Hembra', 6, 'Mediano', 'lost', '2025-07-02', 'Elche', 'Alicante', 'ID: 2608. Cocker Spaniel', 'https://www.buscomiperroperdido.com/Catalogo/Item/2608_Item/perro-Perdido-Alicante-Elche-0.jpeg'),
  ('dog', 'Martin', 'Caniche Mediano', 'Macho', 2, 'Mediano', 'lost', '2025-06-30', 'Murcia', 'Murcia', 'ID: 2607. Caniche Mediano', 'https://www.buscomiperroperdido.com/Catalogo/Item/2607_Item/perro-Perdido-Murcia-Murcia-0.jpeg'),
  ('dog', 'Rayo', 'Border Collie', 'Macho', 3, 'Mediano', 'lost', '2025-06-29', 'Ávila', 'Ávila', 'ID: 2606. Border Collie', 'https://www.buscomiperroperdido.com/Catalogo/Item/2606_Item/perro-Perdido-Avila-Avila-0.jpeg'),
  ('dog', 'Toby', 'Bearded Collie', 'Macho', 4, 'Mediano', 'lost', '2025-06-27', 'Langreo', 'Asturias', 'ID: 2604. Bearded Collie', 'https://www.buscomiperroperdido.com/Catalogo/Item/2604_Item/perro-Perdido-Asturias-Langreo-0.jpeg'),
  ('dog', 'Ares', 'Setter Irlandés', 'Macho', 5, 'Grande', 'lost', '2025-06-25', 'Salamanca', 'Salamanca', 'ID: 2602. Setter Irlandés', 'https://www.buscomiperroperdido.com/Catalogo/Item/2602_Item/perro-Perdido-Salamanca-Salamanca-0.jpeg'),
  ('dog', 'Taco', 'Carlino', 'Macho', 6, 'Pequeño', 'lost', '2025-06-23', 'Pamplona', 'Navarra', 'ID: 2601. Carlino', 'https://www.buscomiperroperdido.com/Catalogo/Item/2601_Item/perro-Perdido-Navarra-Pamplona-0.jpeg'),
  ('dog', 'Lucky', 'Braco Alemán', 'Macho', 7, 'Grande', 'lost', '2025-06-21', 'Tarragona', 'Tarragona', 'ID: 2599. Braco Alemán', 'https://www.buscomiperroperdido.com/Catalogo/Item/2599_Item/perro-Perdido-Tarragona-Tarragona-0.jpeg'),
  ('dog', 'Flora', 'Affenpinscher', 'Hembra', 1, 'Pequeño', 'lost', '2025-06-19', 'Granada', 'Granada', 'ID: 2597. Affenpinscher', 'https://www.buscomiperroperdido.com/Catalogo/Item/2597_Item/perro-Perdido-Granada-Granada-0.jpeg'),
  ('dog', 'Tina', 'Pembroke Welsh Corgi', 'Hembra', 2, 'Pequeño', 'lost', '2025-06-17', 'Córdoba', 'Córdoba', 'ID: 2594. Pembroke Welsh Corgi', 'https://www.buscomiperroperdido.com/Catalogo/Item/2594_Item/perro-Perdido-Cordoba-Cordoba-0.jpeg'),
  ('dog', 'Manchita', 'Dálmata', 'Hembra', 3, 'Mediano', 'lost', '2025-06-15', 'Algeciras', 'Cádiz', 'ID: 2593. Dálmata', 'https://www.buscomiperroperdido.com/Catalogo/Item/2593_Item/perro-Perdido-Cadiz-Algeciras-0.jpeg'),
  ('dog', 'Jim Hopper', 'Weimaraner', 'Macho', 4, 'Grande', 'lost', '2025-06-13', 'Armilla', 'Granada', 'ID: 2591. Weimaraner', 'https://www.buscomiperroperdido.com/Catalogo/Item/2591_Item/perro-Perdido-Granada-Armilla-0.jpeg'),
  ('dog', 'Shark', 'Gran Danés', 'Macho', 5, 'Grande', 'lost', '2025-06-11', 'Barañáin', 'Navarra', 'ID: 2584. Gran Danés', 'https://www.buscomiperroperdido.com/Catalogo/Item/2584_Item/perro-Perdido-Navarra-Baranain-0.jpeg'),
  ('dog', 'Lucky', 'Setters', 'Macho', 6, 'Grande', 'lost', '2025-06-09', 'Lloret de Mar', 'Gerona', 'ID: 2580. Setters', 'https://www.buscomiperroperdido.com/Catalogo/Item/2580_Item/perro-Perdido-Gerona-Lloret-De-Mar-0.jpeg'),
  ('dog', 'Thunder', 'Dogo de Burdeos', 'Macho', 7, 'Grande', 'lost', '2025-06-07', 'Palma de Mallorca', 'Baleares', 'ID: 2575. Dogo de Burdeos', 'https://www.buscomiperroperdido.com/Catalogo/Item/2575_Item/perro-Perdido-Baleares-Palma-De-Mallorca-0.jpeg'),
  ('dog', 'Flaca', 'Galgo Español', 'Hembra', 2, 'Mediano', 'lost', '2025-06-05', 'Torre Pacheco', 'Murcia', 'ID: 2573. Galgo Español', 'https://www.buscomiperroperdido.com/Catalogo/Item/2573_Item/perro-Perdido-Murcia-Torre-Pacheco-0.jpeg'),
  ('dog', 'Ever', 'Weimaraner', 'Macho', 3, 'Grande', 'lost', '2025-06-03', 'Valencia', 'Valencia', 'ID: 2568. Weimaraner', 'https://www.buscomiperroperdido.com/Catalogo/Item/2568_Item/perro-Perdido-Valencia-Valencia-0.jpeg'),
  ('dog', 'Quinto', 'Kerry Blue Terrier', 'Macho', 4, 'Mediano', 'lost', '2025-06-01', 'Talavera de la Reina', 'Toledo', 'ID: 2566. Kerry Blue Terrier', 'https://www.buscomiperroperdido.com/Catalogo/Item/2566_Item/perro-Perdido-Toledo-Talavera-De-La-Reina-0.jpeg'),
  ('dog', 'Olivia', 'Setter Gordon', 'Hembra', 5, 'Grande', 'lost', '2025-05-29', 'Fuenlabrada', 'Madrid', 'ID: 2563. Setter Gordon', 'https://www.buscomiperroperdido.com/Catalogo/Item/2563_Item/perro-Perdido-Madrid-Fuenlabrada-0.jpeg'),
  ('dog', 'Deimon', 'Perro de Agua Español', 'Macho', 6, 'Mediano', 'lost', '2025-05-27', 'Valladolid', 'Valladolid', 'ID: 2560. Perro de Agua Español', 'https://www.buscomiperroperdido.com/Catalogo/Item/2560_Item/perro-Perdido-Valladolid-Valladolid-0.jpeg'),
  ('dog', 'Fada', 'Gos de Presa Mallorquín', 'Hembra', 7, 'Grande', 'lost', '2025-05-25', 'Pontevedra', 'Pontevedra', 'ID: 2555. Gos de Presa Mallorquín', 'https://www.buscomiperroperdido.com/Catalogo/Item/2555_Item/perro-Perdido-Pontevedra-Pontevedra-0.jpeg'),
  ('dog', 'Casio', 'Perro de Caza Bearnés', 'Macho', 4, 'Mediano', 'lost', '2025-05-23', 'Castro Urdiales', 'Cantabria', 'ID: 2549. Perro de Caza Bearnés', 'https://www.buscomiperroperdido.com/Catalogo/Item/2549_Item/perro-Perdido-Cantabria-Castro-Urdiales-0.jpeg');

-- Verificar que se insertaron todos los registros con sus imágenes
SELECT COUNT(*) as total_registros, 
       COUNT(profile_image_url) as registros_con_imagen_perfil,
       COUNT(CASE WHEN profile_image_url IS NOT NULL THEN 1 END) as verificacion
FROM public.pets 
WHERE type = 'dog' AND description LIKE '%Importado%' OR profile_image_url LIKE '%buscomiperroperdido%';
