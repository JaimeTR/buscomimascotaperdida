
"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { loginSchema, registerSchema } from "@/lib/schemas/auth"
import { sendWelcomeEmail } from "@/lib/email"
import { translateSupabaseError } from "@/lib/translate-errors"
import { assertServerEnv } from "@/lib/env"
import { isSafeInternalPath } from "@/lib/safe-path"
import { getRecoveryPath } from "@/lib/auth-redirects"

export type LoginActionState = {
    error?: string
    validationErrors?: Record<string, string[] | undefined>
    needsConfirmation?: boolean
    email?: string
}

export async function loginAction(_prevState: LoginActionState, formData: FormData) {
    const supabase = await createClient()

    const emailValue = formData.get("email")
    const passwordValue = formData.get("password")
    const nextValue = formData.get("next")
    const email = typeof emailValue === "string" ? emailValue : ""
    const password = typeof passwordValue === "string" ? passwordValue : ""
    const next = isSafeInternalPath(typeof nextValue === "string" ? nextValue : null, "/dashboard")

    const result = loginSchema.safeParse({ email, password })

    if (!result.success) {
        return {
            error: "Datos inválidos. Por favor revisa el formulario.",
            validationErrors: result.error.flatten().fieldErrors
        }
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        if (error.message.includes("Email not confirmed")) {
            return {
                error: "Tu correo electrónico no ha sido verificado.",
                needsConfirmation: true,
                email
            }
        }
        return { error: translateSupabaseError(error.message) }
    }

    redirect(next)
}

export async function resendConfirmationAction(email: unknown) {
    const result = loginSchema.shape.email.safeParse(email)
    if (!result.success) {
        return { error: "Datos inválidos." }
    }

    const supabase = await createClient()
    const origin = assertServerEnv().appUrl || "http://localhost:3000"

    const { error } = await supabase.auth.resend({
        type: 'signup',
        email: result.data,
        options: {
            emailRedirectTo: `${origin}/auth/callback`
        }
    })

    if (error) {
        return { error: translateSupabaseError(error.message) }
    }

    return { success: true }
}

export async function registerAction(data: unknown) {
    const supabase = await createClient()
    const origin = assertServerEnv().appUrl || "http://localhost:3000"

    const result = registerSchema.safeParse(data)

    if (!result.success) {
        return {
            error: "Datos inválidos.",
            validationErrors: result.error.flatten().fieldErrors
        }
    }

    const { email, password, fullName, phone, department, district } = result.data

    const { error, data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
            data: {
                full_name: fullName,
                phone: phone,
                department: department,
                district: district,
            }
        },
    })

    if (error) {
        // Handle "User already registered"
        if (error.message.includes("User already registered") || error.code === "user_already_exists") {
            return {
                error: "Este correo ya está registrado. Por favor inicia sesión.",
                code: "user_already_exists"
            }
        }
        return { error: translateSupabaseError(error.message) }
    }

    // Send welcome email if user was created successfully
    if (authData.user && authData.user.email) {
        // We don't await this to keep the response fast, or we await if we want to ensure it sent
        // For server actions, awaiting is usually safer to avoid execution context issues
        try {
            await sendWelcomeEmail(authData.user.email, fullName)
        } catch {
            console.error("welcome email delivery failed")
            // We don't fail the registration if email fails, but we log it
        }
    }

    return { success: true }
}

export async function resetPasswordAction(email: unknown, next: unknown = "/dashboard") {
    const emailResult = loginSchema.shape.email.safeParse(email)
    if (!emailResult.success) {
        return { error: "Datos inválidos." }
    }

    const supabase = await createClient()
    const origin = assertServerEnv().appUrl || "http://localhost:3000"
    const recoveryNext = getRecoveryPath(typeof next === "string" ? next : null)

    const { error } = await supabase.auth.resetPasswordForEmail(emailResult.data, {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(recoveryNext)}`,
    })

    if (error) {
        return { error: translateSupabaseError(error.message) }
    }

    return { success: true }
}

export async function logoutAction() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/login")
}
