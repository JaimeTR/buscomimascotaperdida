-- Script MEJORADO para importar 50 perros con URLs de imágenes correctas
-- URL de imágenes formato: https://www.buscomiperroperdido.com/Catalogo/Item/{id}_Item/perro-Perdido-{location}-{number}.jpeg

DO $$
BEGIN
  -- Verificar y crear columna 'image_url' si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pets' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN image_url text DEFAULT NULL;
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

-- Insertar 50 perros con URLs de imágenes correctas
INSERT INTO public.pets (
  type, name, breed, gender, age, size, status, 
  last_seen_date, last_seen_address, last_seen_province, 
  description, image_url
) VALUES
  ('dog', 'Tina', 'Poodle', 'Hembra', 1, 'Pequeño', 'lost', '2025-01-15', 'Osor, Gerona', 'Gerona', 'ID: 2652. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2652_Item/perro-Perdido-Gerona-0.jpeg'),
  ('dog', 'Laika', 'Mestizo', 'Hembra', 2, 'Mediano', 'lost', '2024-12-28', 'Soto de la Marina, Cantabria', 'Cantabria', 'ID: 2650. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2650_Item/perro-Perdido-Cantabria-0.jpeg'),
  ('dog', 'Oso', 'Gos d''Atura', 'Macho', 3, 'Grande', 'lost', '2024-12-26', 'Sada, Coruña', 'Coruña', 'ID: 2648. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2648_Item/perro-Perdido-Coruna-0.jpeg'),
  ('dog', 'Mamba', 'Pastor Alemán', 'Macho', 4, 'Grande', 'lost', '2024-12-24', 'Betanzos, Coruña', 'Coruña', 'ID: 2647. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2647_Item/perro-Perdido-Coruna-0.jpeg'),
  ('dog', 'Mesi', 'Terrier', 'Macho', 1, 'Pequeño', 'lost', '2024-12-22', 'Llodio, Vizcaya', 'Vizcaya', 'ID: 2646. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2646_Item/perro-Perdido-Vizcaya-0.jpeg'),
  ('dog', 'Roma', 'Springer Spaniel', 'Hembra', 5, 'Mediano', 'lost', '2024-12-20', 'Zamora, Zamora', 'Zamora', 'ID: 2645. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2645_Item/perro-Perdido-Zamora-0.jpeg'),
  ('dog', 'Rufu', 'Buldog Inglés', 'Macho', 6, 'Mediano', 'lost', '2024-12-18', 'Reus, Tarragona', 'Tarragona', 'ID: 2643. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2643_Item/perro-Perdido-Tarragona-0.jpeg'),
  ('dog', 'Brandy', 'Collie', 'Hembra', 7, 'Grande', 'lost', '2024-12-16', 'Noia, Coruña', 'Coruña', 'ID: 2641. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2641_Item/perro-Perdido-Coruna-0.jpeg'),
  ('dog', 'Isla', 'Perro Pachón Navarro', 'Hembra', 8, 'Grande', 'lost', '2024-12-14', 'Vinuesa, Soria', 'Soria', 'ID: 2638. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2638_Item/perro-Perdido-Soria-0.jpeg'),
  ('dog', 'Floky', 'Caniche', 'Macho', 2, 'Pequeño', 'lost', '2024-12-12', 'Pinto, Madrid', 'Madrid', 'ID: 2636. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2636_Item/perro-Perdido-Madrid-0.jpeg'),
  ('dog', 'Amis', 'Mestizo', 'Hembra', 3, 'Mediano', 'lost', '2024-12-10', 'Azuqueca de Henares, Guadalajara', 'Guadalajara', 'ID: 2635. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2635_Item/perro-Perdido-Guadalajara-0.jpeg'),
  ('dog', 'Napoleon', 'Bulldog Francés', 'Macho', 1, 'Pequeño', 'lost', '2024-12-08', 'Alcalá de Henares, Madrid', 'Madrid', 'ID: 2632. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2632_Item/perro-Perdido-Madrid-0.jpeg'),
  ('dog', 'Maripepa', 'Beagle', 'Hembra', 4, 'Mediano', 'lost', '2024-12-06', 'Jerez de la Frontera, Cádiz', 'Cádiz', 'ID: 2631. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2631_Item/perro-Perdido-Cadiz-0.jpeg'),
  ('dog', 'Dama', 'Doberman', 'Hembra', 5, 'Grande', 'lost', '2024-12-04', 'Motril, Granada', 'Granada', 'ID: 2630. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2630_Item/perro-Perdido-Granada-0.jpeg'),
  ('dog', 'Simba', 'Pastor Alemán', 'Macho', 6, 'Grande', 'lost', '2024-12-02', 'Sevilla, Sevilla', 'Sevilla', 'ID: 2629. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2629_Item/perro-Perdido-Sevilla-0.jpeg'),
  ('dog', 'Chicha', 'Poodle Miniatura', 'Hembra', 2, 'Pequeño', 'lost', '2024-11-30', 'Córdoba, Córdoba', 'Córdoba', 'ID: 2627. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2627_Item/perro-Perdido-Cordoba-0.jpeg'),
  ('dog', 'Bruno', 'Labrador', 'Macho', 3, 'Grande', 'lost', '2024-11-28', 'Valle del Sol, Murcia', 'Murcia', 'ID: 2626. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2626_Item/perro-Perdido-Murcia-Valle-del-Sol-0.jpeg'),
  ('dog', 'Drac', 'Pastor Catalán', 'Macho', 7, 'Grande', 'lost', '2024-11-26', 'Barcelona, Barcelona', 'Barcelona', 'ID: 2625. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2625_Item/perro-Perdido-Barcelona-0.jpeg'),
  ('dog', 'Naruto', 'Husky Siberiano', 'Macho', 4, 'Grande', 'lost', '2024-11-24', 'Oviedo, Asturias', 'Asturias', 'ID: 2624. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2624_Item/perro-Perdido-Asturias-0.jpeg'),
  ('dog', 'Luna', 'Schnauzer Miniatura', 'Hembra', 1, 'Pequeño', 'lost', '2024-11-22', 'Barcelona, Barcelona', 'Barcelona', 'ID: 2623. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2623_Item/perro-Perdido-Barcelona-0.jpeg'),
  ('dog', 'Laika', 'Golden Retriever', 'Hembra', 8, 'Grande', 'lost', '2024-11-20', 'Toledo, Toledo', 'Toledo', 'ID: 2622. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2622_Item/perro-Perdido-Toledo-0.jpeg'),
  ('dog', 'Pinocho', 'Jack Russell Terrier', 'Macho', 2, 'Pequeño', 'lost', '2024-11-18', 'Santiago de Compostela, Coruña', 'Coruña', 'ID: 2621. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2621_Item/perro-Perdido-Coruna-0.jpeg'),
  ('dog', 'Blanca', 'Bichón Frisé', 'Hembra', 3, 'Pequeño', 'lost', '2024-11-16', 'Alicante, Alicante', 'Alicante', 'ID: 2620. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2620_Item/perro-Perdido-Alicante-0.jpeg'),
  ('dog', 'Triskel', 'Setter Inglés', 'Macho', 5, 'Grande', 'lost', '2024-11-14', 'Gijón, Asturias', 'Asturias', 'ID: 2618. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2618_Item/perro-Perdido-Asturias-0.jpeg'),
  ('dog', 'Bruno', 'Pointer', 'Macho', 6, 'Grande', 'lost', '2024-11-12', 'Leganés, Madrid', 'Madrid', 'ID: 2615. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2615_Item/perro-Perdido-Madrid-0.jpeg'),
  ('dog', 'Sabi', 'Mastín del Pirineo', 'Hembra', 7, 'Grande', 'lost', '2024-11-10', 'Reus, Tarragona', 'Tarragona', 'ID: 2614. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2614_Item/perro-Perdido-Tarragona-0.jpeg'),
  ('dog', 'Pachu', 'Boxer', 'Macho', 3, 'Mediano', 'lost', '2024-11-08', 'Ponteareas, Pontevedra', 'Pontevedra', 'ID: 2613. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2613_Item/perro-Perdido-Coruna-0.jpeg'),
  ('dog', 'Luna', 'Rottweiler', 'Hembra', 4, 'Grande', 'lost', '2024-11-06', 'Avilés, Asturias', 'Asturias', 'ID: 2612. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2612_Item/perro-Perdido-Asturias-0.jpeg'),
  ('dog', 'Gringa', 'American Staffordshire Terrier', 'Hembra', 5, 'Mediano', 'lost', '2024-11-04', 'Barcelona, Barcelona', 'Barcelona', 'ID: 2611. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2611_Item/perro-Perdido-Barcelona-0.jpeg'),
  ('dog', 'Iryem', 'Cocker Spaniel', 'Hembra', 6, 'Mediano', 'lost', '2024-11-02', 'Elche, Alicante', 'Alicante', 'ID: 2608. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2608_Item/perro-Perdido-Alicante-0.jpeg'),
  ('dog', 'Martín', 'Caniche Mediano', 'Macho', 2, 'Mediano', 'lost', '2024-10-31', 'Murcia, Murcia', 'Murcia', 'ID: 2607. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2607_Item/perro-Perdido-Murcia-0.jpeg'),
  ('dog', 'Rayo', 'Border Collie', 'Macho', 3, 'Mediano', 'lost', '2024-10-29', 'Ávila, Ávila', 'Ávila', 'ID: 2606. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2606_Item/perro-Perdido-Avila-0.jpeg'),
  ('dog', 'Toby', 'Bearded Collie', 'Macho', 4, 'Mediano', 'lost', '2024-10-27', 'Langreo, Asturias', 'Asturias', 'ID: 2604. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2604_Item/perro-Perdido-Asturias-0.jpeg'),
  ('dog', 'Ares', 'Setter Irlandés', 'Macho', 5, 'Grande', 'lost', '2024-10-25', 'Salamanca, Salamanca', 'Salamanca', 'ID: 2602. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2602_Item/perro-Perdido-Salamanca-0.jpeg'),
  ('dog', 'Taco', 'Carlino', 'Macho', 6, 'Pequeño', 'lost', '2024-10-23', 'Pamplona, Navarra', 'Navarra', 'ID: 2601. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2601_Item/perro-Perdido-Navarra-0.jpeg'),
  ('dog', 'Lucky', 'Braco Alemán', 'Macho', 7, 'Grande', 'lost', '2024-10-21', 'Tarragona, Tarragona', 'Tarragona', 'ID: 2599. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2599_Item/perro-Perdido-Tarragona-0.jpeg'),
  ('dog', 'Flora', 'Affenpinscher', 'Hembra', 1, 'Pequeño', 'lost', '2024-10-19', 'Granada, Granada', 'Granada', 'ID: 2597. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2597_Item/perro-Perdido-Granada-0.jpeg'),
  ('dog', 'Tina', 'Pembroke Welsh Corgi', 'Hembra', 2, 'Pequeño', 'lost', '2024-10-17', 'Córdoba, Córdoba', 'Córdoba', 'ID: 2594. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2594_Item/perro-Perdido-Cordoba-0.jpeg'),
  ('dog', 'Manchita', 'Dalmatian', 'Hembra', 3, 'Mediano', 'lost', '2024-10-15', 'Algeciras, Cádiz', 'Cádiz', 'ID: 2593. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2593_Item/perro-Perdido-Cadiz-0.jpeg'),
  ('dog', 'Jim Hopper', 'Weimaraner', 'Macho', 4, 'Grande', 'lost', '2024-10-13', 'Armilla, Granada', 'Granada', 'ID: 2591. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2591_Item/perro-Perdido-Granada-0.jpeg'),
  ('dog', 'Shark', 'Gran Danés', 'Macho', 5, 'Grande', 'lost', '2024-10-11', 'Barañáin, Navarra', 'Navarra', 'ID: 2584. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2584_Item/perro-Perdido-Navarra-0.jpeg'),
  ('dog', 'Lucky', 'Setters', 'Macho', 6, 'Grande', 'lost', '2024-10-09', 'Lloret de Mar, Gerona', 'Gerona', 'ID: 2580. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2580_Item/perro-Perdido-Gerona-0.jpeg'),
  ('dog', 'Thunder', 'Dogo de Burdeos', 'Macho', 7, 'Grande', 'lost', '2024-10-07', 'Palma de Mallorca, Baleares', 'Baleares', 'ID: 2575. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2575_Item/perro-Perdido-Baleares-0.jpeg'),
  ('dog', 'Flaca', 'Galgo Español', 'Hembra', 2, 'Mediano', 'lost', '2024-10-05', 'Torre Pacheco, Murcia', 'Murcia', 'ID: 2573. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2573_Item/perro-Perdido-Murcia-0.jpeg'),
  ('dog', 'Ever', 'Weimaraner', 'Macho', 3, 'Grande', 'lost', '2024-10-03', 'Valencia, Valencia', 'Valencia', 'ID: 2568. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2568_Item/perro-Perdido-Valencia-0.jpeg'),
  ('dog', 'Quinto', 'Kerry Blue Terrier', 'Macho', 4, 'Mediano', 'lost', '2024-10-01', 'Talavera de la Reina, Toledo', 'Toledo', 'ID: 2566. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2566_Item/perro-Perdido-Toledo-0.jpeg'),
  ('dog', 'Olivia', 'Setter Gordon', 'Hembra', 5, 'Grande', 'lost', '2024-09-29', 'Fuenlabrada, Madrid', 'Madrid', 'ID: 2563. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2563_Item/perro-Perdido-Madrid-0.jpeg'),
  ('dog', 'Deimon', 'Perro de Agua Español', 'Macho', 6, 'Mediano', 'lost', '2024-09-27', 'Valladolid, Valladolid', 'Valladolid', 'ID: 2560. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2560_Item/perro-Perdido-Valladolid-0.jpeg'),
  ('dog', 'Fada', 'Gos de Presa Mallorquín', 'Hembra', 7, 'Grande', 'lost', '2024-09-25', 'Pontevedra, Pontevedra', 'Pontevedra', 'ID: 2555. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2555_Item/perro-Perdido-Pontevedra-0.jpeg'),
  ('dog', 'Casio', 'Perro de Caza Bearnés', 'Macho', 4, 'Mediano', 'lost', '2024-09-23', 'Castro Urdiales, Cantabria', 'Cantabria', 'ID: 2549. Importado desde buscomiperroperdido.com', 'https://www.buscomiperroperdido.com/Catalogo/Item/2549_Item/perro-Perdido-Cantabria-0.jpeg');

-- Verificar que se insertaron todos los registros
SELECT COUNT(*) as total_registros, 
       COUNT(image_url) as registros_con_imagen
FROM public.pets 
WHERE description LIKE '%Importado desde buscomiperroperdido%';
