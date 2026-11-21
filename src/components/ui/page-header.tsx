// Encabezado de página: título en Braze (mayúsculas), descripción y acciones a la derecha.
export function PageHeader({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
    return (
        <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
                <h1 className="font-display text-3xl text-primary md:text-4xl">{title}</h1>
                {text && <p className="mt-1 text-muted-foreground">{text}</p>}
            </div>
            {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
        </header>
    )
}
