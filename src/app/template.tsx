// Se vuelve a montar en cada navegación: da una entrada suave a la página nueva.
export default function Template({ children }: { children: React.ReactNode }) {
    return <div className="page-enter">{children}</div>
}
