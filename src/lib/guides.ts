// Artículos de /guias. Consejos generales y prudentes; nada de cifras ni promesas inventadas.
export type Guide = { slug: string; title: string; description: string; sections: { h: string; p: string[] }[] }

export const GUIDES: Guide[] = [
    {
        slug: "microchip-que-es-y-como-leerlo",
        title: "Microchip para mascotas: qué es y qué hacer si encuentras una con chip",
        description: "Qué es un microchip, qué datos guarda y cómo leerlo en una veterinaria si encuentras una mascota.",
        sections: [
            { h: "Qué es", p: ["Es una cápsula del tamaño de un grano de arroz que se coloca bajo la piel. Guarda un número único; no tiene GPS ni rastrea a la mascota.", "El número sirve para consultar en un registro quién es su responsable, siempre que el dueño lo haya inscrito y mantenga sus datos al día."] },
            { h: "Si encontraste una mascota", p: ["Llévala a una veterinaria o clínica con lector. La lectura suele ser rápida y no daña al animal.", "Pide que consulten el número en el registro correspondiente y que contacten al dueño. Pregunta por la política de la veterinaria antes de entregar datos personales a terceros."] },
            { h: "Si tu mascota tiene chip y se perdió", p: ["Avisa al registro donde la inscribiste para que la marquen como perdida y confirma que tu teléfono esté actualizado.", "Menciona en tu reporte que tiene microchip: ayuda a quien la encuentre a saber qué hacer."] },
        ],
    },
    {
        slug: "como-buscar-un-gato-perdido",
        title: "Cómo buscar un gato perdido: pasos que sí ayudan",
        description: "Los gatos se esconden cerca de casa. Dónde buscar, a qué hora y cómo atraerlo de vuelta.",
        sections: [
            { h: "Empieza cerca", p: ["Muchos gatos se esconden a pocos metros de casa, asustados. Revisa debajo de autos, jardines, techos, tanques y garajes.", "Pide permiso a vecinos para mirar en patios y azoteas."] },
            { h: "Busca de noche y al amanecer", p: ["Hay menos ruido y los gatos se mueven más. Lleva linterna, su comida preferida y háblale en voz baja.", "Deja agua y comida en la puerta; un olor conocido (su cama o arena usada) puede ayudar a que regrese."] },
            { h: "Publica y avisa", p: ["Reporta el caso con fotos claras y la zona exacta. Pega carteles en veterinarias y tiendas cercanas.", "No des por perdido al gato: algunos reaparecen días o semanas después."] },
        ],
    },
    {
        slug: "mascotas-y-ruido-fuerte",
        title: "Fuegos artificiales y ruidos fuertes: cómo evitar que tu mascota escape",
        description: "El ruido fuerte es una causa común de fugas. Cómo prevenirlo y qué hacer si ya se escapó.",
        sections: [
            { h: "Prevención", p: ["Mantén a tu mascota dentro de casa, en una habitación tranquila, con ventanas y puertas cerradas.", "Evita sacarla a pasear en horas de ruido y asegúrate de que su collar o arnés no se pueda soltar."] },
            { h: "Identificación", p: ["Ponle una chapita con tu teléfono y, si puedes, microchip inscrito. Una foto reciente tuya con ella ayuda a identificarla.", "Guarda fotos de frente, de perfil y de sus señas particulares."] },
            { h: "Si se escapó", p: ["Revisa primero la zona cercana: suelen esconderse por miedo.", "Publica el caso cuanto antes y comparte el enlace con vecinos."] },
        ],
    },
]

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug)
