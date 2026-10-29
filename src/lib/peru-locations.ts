export const PERU_LOCATIONS: Record<string, Record<string, string[]>> = {
    "Lima": {
        "Lima": [
            "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Chaclacayo", "Chorrillos",
            "Cieneguilla", "Comas", "El Agustino", "Independencia", "Jesús María",
            "La Molina", "La Victoria", "Lima", "Lince", "Los Olivos", "Lurigancho",
            "Lurín", "Magdalena del Mar", "Miraflores", "Pachacámac", "Pucusana",
            "Pueblo Libre", "Puente Piedra", "Punta Hermosa", "Punta Negra", "Rímac",
            "San Bartolo", "San Borja", "San Isidro", "San Juan de Lurigancho",
            "San Juan de Miraflores", "San Luis", "San Martín de Porres", "San Miguel",
            "Santa Anita", "Santa María del Mar", "Santa Rosa", "Santiago de Surco",
            "Surquillo", "Villa El Salvador", "Villa María del Triunfo"
        ]
    },
    "Arequipa": {
        "Arequipa": ["Arequipa", "Yanahuara", "Cayma", "Selva Alegre", "Miraflores", "Jose Luis Bustamante"]
    },
    "Cusco": {
        "Cusco": ["Cusco", "San Jerónimo", "San Sebastián", "Wanchaq"]
    },
    "La Libertad": {
        "Trujillo": ["Trujillo", "Victor Larco", "Huanchaco", "Moche"]
    },
    "Piura": {
        "Piura": ["Piura", "Castilla", "Catacaos"]
    },
    "Lambayeque": {
        "Chiclayo": ["Chiclayo", "Jose Leonardo Ortiz", "La Victoria"]
    }
}

export const PERU_DEPARTMENTS = Object.keys(PERU_LOCATIONS)

export function getDistrictsForDepartment(department: string): string[] {
    return Object.values(PERU_LOCATIONS[department] || {}).flat()
}
