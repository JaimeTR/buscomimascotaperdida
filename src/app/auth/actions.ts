
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
    const next = isSafeInternalPath(typeof nextValue === "string" ? nextValue : null, "/panel")

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

export async function registerAction(data: unknown, nextValue?: unknown) {
    const supabase = await createClient()
    const origin = assertServerEnv().appUrl || "http://localhost:3000"
    const next = isSafeInternalPath(typeof nextValue === "string" ? nextValue : null, "/panel")

    const result = registerSchema.safeParse(data)

    if (!result.success) {
        return {
            error: "Datos inválidos.",
            validationErrors: result.error.flatten().fieldErrors
        }
    }

    const { email, password, fullName } = result.data

    const { error, data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
            data: { full_name: fullName },
        },
    })

    const alreadyExists = error?.code === "user_already_exists" || error?.message.includes("User already registered")
        // Con confirmación de correo activa, Supabase no da error: devuelve un usuario sin identidades.
        || (!error && authData.user?.identities?.length === 0)
    if (alreadyExists) {
        return { error: "Este correo ya está registrado. Inicia sesión.", code: "user_already_exists" }
    }
    if (error) {
        return { error: translateSupabaseError(error.message) }
    }

    if (authData.user?.email) {
        try {
            await sendWelcomeEmail(authData.user.email, fullName)
        } catch {
            console.error("welcome email delivery failed") // el registro no falla por esto
        }
    }

    // Sin sesión = falta confirmar el correo; con sesión ya está dentro.
    return { success: true, needsConfirmation: !authData.session, email }
}

export async function resetPasswordAction(email: unknown, next: unknown = "/panel") {
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
    redirect("/ingresar")
}
