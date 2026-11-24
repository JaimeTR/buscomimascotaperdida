// Encabezado de página: título en Outfit, descripción y acciones a la derecha.
export function PageHeader({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
    return (
        <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:text-left">
            <div>
                <h1 className="font-display text-3xl text-primary md:text-4xl">{title}</h1>
                {text && <p className="mt-1 text-muted-foreground">{text}</p>}
            </div>
            {children && <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>}
        </header>
    )
}
