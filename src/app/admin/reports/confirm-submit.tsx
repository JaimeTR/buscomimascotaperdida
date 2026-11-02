"use client"

// Botón destructivo con confirmación nativa (accesible y sin dependencias).
export function ConfirmSubmit({ message, children }: { message: string; children: React.ReactNode }) {
    return (
        <button
            type="submit"
            className="text-xs font-semibold text-destructive hover:underline"
            onClick={(e) => { if (!window.confirm(message)) e.preventDefault() }}
        >
            {children}
        </button>
    )
}
