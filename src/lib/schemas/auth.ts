
import { z } from "zod"

export const loginSchema = z.object({
    email: z.string().email({ message: "El correo electrónico no es válido." }),
    password: z.string().min(1, { message: "La contraseña es requerida." }),
})

export type LoginSchema = z.infer<typeof loginSchema>

export const registerSchema = z.object({
    fullName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    phone: z.string().regex(/^\d{9}$/, { message: "El teléfono debe tener exactamente 9 dígitos numéricos." }),
    department: z.string().min(1, { message: "Debes seleccionar un departamento." }),
    district: z.string().min(1, { message: "Debes seleccionar un distrito." }),
    email: z.string().email({ message: "Ingresa un correo electrónico válido." }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false
    }
    return true
}, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
})

export type RegisterSchema = z.infer<typeof registerSchema>

export const completeProfileSchema = z.object({
    phone: z.string().regex(/^\d{9}$/, { message: "El teléfono debe tener exactamente 9 dígitos numéricos." }),
    department: z.string().min(1, { message: "Debes seleccionar un departamento." }),
    district: z.string().min(1, { message: "Debes seleccionar un distrito." }),
})

export type CompleteProfileSchema = z.infer<typeof completeProfileSchema>
