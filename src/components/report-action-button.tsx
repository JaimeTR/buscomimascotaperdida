"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button, ButtonProps } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface ReportActionButtonProps extends ButtonProps {
    nextUrl: string
    label: string
    icon?: React.ReactNode
}

export function ReportActionButton({ nextUrl, label, icon, ...props }: ReportActionButtonProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isChecking, setIsChecking] = useState(false)

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault()
        setIsChecking(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            // Sin sesión: directo al login con aviso (sin popup); al entrar vuelve a donde ibas.
            router.push(session ? nextUrl : `/login?next=${encodeURIComponent(nextUrl)}&reason=report`)
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
