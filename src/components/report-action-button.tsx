"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useConfirm } from "@/components/ui/confirm-modern"

interface ReportActionButtonProps extends ButtonProps {
    nextUrl: string
    label: string
    icon?: React.ReactNode
}

export function ReportActionButton({ nextUrl, label, icon, ...props }: ReportActionButtonProps) {
    const router = useRouter()
    const supabase = createClient()
    const { confirm } = useConfirm()
    const [isChecking, setIsChecking] = useState(false)

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsChecking(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                // Not logged in
                const ok = await confirm({
                    title: "Inicio de sesión requerido",
                    message: "Para realizar un reporte necesitas una cuenta. ¿Deseas iniciar sesión o registrarte ahora?",
                    confirmLabel: "Ir al Login",
                    cancelLabel: "Ahora no"
                })

                if (ok) {
                    router.push(`/login?next=${encodeURIComponent(nextUrl)}`)
                }
            } else {
                // Logged in
                router.push(nextUrl)
            }
        } catch (error) {
            console.error("Error checking session:", error)
            // Fallback to login just in case
            router.push(`/login?next=${encodeURIComponent(nextUrl)}`)
        } finally {
            setIsChecking(false)
        }
    }

    return (
        <Button
            onClick={handleClick}
            disabled={isChecking || props.disabled}
            {...props}
        >
            {isChecking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                icon
            )}
            {label}
        </Button>
    )
}
