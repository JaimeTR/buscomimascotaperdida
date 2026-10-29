-- Script para agregar URLs de imágenes correctas a la tabla pets
-- Las imágenes están en el formato: https://www.buscomiperroperdido.com/Catalogo/Item/{id}_Item/perro-Perdido-{location}-{number}.jpeg

-- Primero crear la columna image_url si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pets' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE public.pets ADD COLUMN image_url text DEFAULT NULL;
  END IF;
END $$;

-- Actualizar URLs de imágenes para los 50 perros importados desde buscomiperroperdido.com
-- Basado en el patrón observado en el sitio web

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2652_Item/perro-Perdido-Gerona-0.jpeg'
WHERE description LIKE '%ID: 2652%' AND name = 'Tina';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2650_Item/perro-Perdido-Cantabria-0.jpeg'
WHERE description LIKE '%ID: 2650%' AND name = 'Laika';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2648_Item/perro-Perdido-Coruna-0.jpeg'
WHERE description LIKE '%ID: 2648%' AND name = 'Oso';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2647_Item/perro-Perdido-Coruna-0.jpeg'
WHERE description LIKE '%ID: 2647%' AND name = 'Mamba';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2646_Item/perro-Perdido-Vizcaya-0.jpeg'
WHERE description LIKE '%ID: 2646%' AND name = 'Mesi';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2645_Item/perro-Perdido-Zamora-0.jpeg'
WHERE description LIKE '%ID: 2645%' AND name = 'Roma';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2643_Item/perro-Perdido-Tarragona-0.jpeg'
WHERE description LIKE '%ID: 2643%' AND name = 'Rufu';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2641_Item/perro-Perdido-Coruna-0.jpeg'
WHERE description LIKE '%ID: 2641%' AND name = 'Brandy';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2638_Item/perro-Perdido-Soria-0.jpeg'
WHERE description LIKE '%ID: 2638%' AND name = 'Isla';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2636_Item/perro-Perdido-Madrid-0.jpeg'
WHERE description LIKE '%ID: 2636%' AND name = 'Floky';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2635_Item/perro-Perdido-Guadalajara-0.jpeg'
WHERE description LIKE '%ID: 2635%' AND name = 'Amis';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2632_Item/perro-Perdido-Madrid-0.jpeg'
WHERE description LIKE '%ID: 2632%' AND name = 'Napoleon';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2631_Item/perro-Perdido-Cadiz-0.jpeg'
WHERE description LIKE '%ID: 2631%' AND name = 'Maripepa';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2630_Item/perro-Perdido-Granada-0.jpeg'
WHERE description LIKE '%ID: 2630%' AND name = 'Dama';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2629_Item/perro-Perdido-Sevilla-0.jpeg'
WHERE description LIKE '%ID: 2629%' AND name = 'Simba';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2627_Item/perro-Perdido-Cordoba-0.jpeg'
WHERE description LIKE '%ID: 2627%' AND name = 'Chicha';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2626_Item/perro-Perdido-Murcia-Valle-del-Sol-0.jpeg'
WHERE description LIKE '%ID: 2626%' AND name = 'Bruno';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2625_Item/perro-Perdido-Barcelona-0.jpeg'
WHERE description LIKE '%ID: 2625%' AND name = 'Drac';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2624_Item/perro-Perdido-Asturias-0.jpeg'
WHERE description LIKE '%ID: 2624%' AND name = 'Naruto';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2623_Item/perro-Perdido-Barcelona-0.jpeg'
WHERE description LIKE '%ID: 2623%' AND name = 'LLuna';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2622_Item/perro-Perdido-Toledo-0.jpeg'
WHERE description LIKE '%ID: 2622%' AND name = 'Laika';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2621_Item/perro-Perdido-Coruna-0.jpeg'
WHERE description LIKE '%ID: 2621%' AND name = 'Pinoccio';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2620_Item/perro-Perdido-Alicante-0.jpeg'
WHERE description LIKE '%ID: 2620%' AND name = 'Blanca';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2618_Item/perro-Perdido-Asturias-0.jpeg'
WHERE description LIKE '%ID: 2618%' AND name = 'TRISKEL';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2615_Item/perro-Perdido-Madrid-0.jpeg'
WHERE description LIKE '%ID: 2615%' AND name = 'Bruno';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2614_Item/perro-Perdido-Tarragona-0.jpeg'
WHERE description LIKE '%ID: 2614%' AND name = 'Sabi';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2613_Item/perro-Perdido-Coruna-0.jpeg'
WHERE description LIKE '%ID: 2613%' AND name = 'Pachu';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2612_Item/perro-Perdido-Asturias-0.jpeg'
WHERE description LIKE '%ID: 2612%' AND name = 'Luna';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2611_Item/perro-Perdido-Barcelona-0.jpeg'
WHERE description LIKE '%ID: 2611%' AND name = 'Gringa';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2608_Item/perro-Perdido-Alicante-0.jpeg'
WHERE description LIKE '%ID: 2608%' AND name = 'Iryem';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2607_Item/perro-Perdido-Murcia-0.jpeg'
WHERE description LIKE '%ID: 2607%' AND name = 'MARTIN';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2606_Item/perro-Perdido-Avila-0.jpeg'
WHERE description LIKE '%ID: 2606%' AND name = 'Rayo';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2604_Item/perro-Perdido-Asturias-0.jpeg'
WHERE description LIKE '%ID: 2604%' AND name = 'Toby';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2602_Item/perro-Perdido-Salamanca-0.jpeg'
WHERE description LIKE '%ID: 2602%' AND name = 'Ares';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2601_Item/perro-Perdido-Navarra-0.jpeg'
WHERE description LIKE '%ID: 2601%' AND name = 'Taco';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2599_Item/perro-Perdido-Tarragona-0.jpeg'
WHERE description LIKE '%ID: 2599%' AND name = 'Lucky';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2597_Item/perro-Perdido-Granada-0.jpeg'
WHERE description LIKE '%ID: 2597%' AND name = 'Flora';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2594_Item/perro-Perdido-Cordoba-0.jpeg'
WHERE description LIKE '%ID: 2594%' AND name = 'Tina';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2593_Item/perro-Perdido-Cadiz-0.jpeg'
WHERE description LIKE '%ID: 2593%' AND name = 'Manchita';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2591_Item/perro-Perdido-Granada-0.jpeg'
WHERE description LIKE '%ID: 2591%' AND name = 'Jim Hopper';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2584_Item/perro-Perdido-Navarra-0.jpeg'
WHERE description LIKE '%ID: 2584%' AND name = 'Shark';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2580_Item/perro-Perdido-Gerona-0.jpeg'
WHERE description LIKE '%ID: 2580%' AND name = 'Lucky';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2575_Item/perro-Perdido-Baleares-0.jpeg'
WHERE description LIKE '%ID: 2575%' AND name = 'Thunder';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2573_Item/perro-Perdido-Murcia-0.jpeg'
WHERE description LIKE '%ID: 2573%' AND name = 'Flaca';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2568_Item/perro-Perdido-Valencia-0.jpeg'
WHERE description LIKE '%ID: 2568%' AND name = 'Ever';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2566_Item/perro-Perdido-Toledo-0.jpeg'
WHERE description LIKE '%ID: 2566%' AND name = 'Quinto';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2563_Item/perro-Perdido-Madrid-0.jpeg'
WHERE description LIKE '%ID: 2563%' AND name = 'Olivia';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2560_Item/perro-Perdido-Valladolid-0.jpeg'
WHERE description LIKE '%ID: 2560%' AND name = 'Deimon';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2555_Item/perro-Perdido-Pontevedra-0.jpeg'
WHERE description LIKE '%ID: 2555%' AND name = 'Fada';

UPDATE pets SET image_url = 'https://www.buscomiperroperdido.com/Catalogo/Item/2549_Item/perro-Perdido-Cantabria-0.jpeg'
WHERE description LIKE '%ID: 2549%' AND name = 'Casio';

-- Verificar que las actualizaciones se aplicaron
SELECT COUNT(*) as registros_con_imagen FROM pets 
WHERE image_url LIKE '%buscomiperroperdido.com/Catalogo%'
AND description LIKE '%Importado desde buscomiperroperdido%';
