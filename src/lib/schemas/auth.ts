
import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email({ message: "El correo electrónico no es válido." }),
    password: z.string().min(1, { message: "La contraseña es requerida." }),
})

export type LoginSchema = z.infer<typeof loginSchema>

// Registro mínimo: teléfono y ubicación se piden después, al primer reporte (CompleteProfileDialog).
export const registerSchema = z.object({
    fullName: z.string().trim().min(2, { message: "Escribe tu nombre." }),
    email: z.string().trim().email({ message: "Ingresa un correo electrónico válido." }),
    password: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
})

export type RegisterSchema = z.infer<typeof registerSchema>

export const completeProfileSchema = z.object({
    phone: z.string().regex(/^\d{9}$/, { message: "El teléfono debe tener exactamente 9 dígitos numéricos." }),
    department: z.string().min(1, { message: "Debes seleccionar un departamento." }),
    district: z.string().min(1, { message: "Debes seleccionar un distrito." }),
})

export type CompleteProfileSchema = z.infer<typeof completeProfileSchema>
