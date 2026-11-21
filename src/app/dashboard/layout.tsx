import { createClient } from "@/utils/supabase/server"
import { DashboardShell } from "@/components/dashboard/shell"

// El acceso sin sesión ya se corta en el proxy; aquí solo se leen los datos del marco.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = user
        ? await supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle()
        : { data: null }
    const { data: isAdmin } = await supabase.rpc("is_admin")

    return (
        <DashboardShell name={profile?.full_name ?? user?.email ?? ""} avatarUrl={profile?.avatar_url} isAdmin={isAdmin === true}>
            {children}
        </DashboardShell>
    )
}
