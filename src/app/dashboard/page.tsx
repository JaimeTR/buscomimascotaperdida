
import { redirect } from 'next/navigation'

export default function DashboardPage() {
    // For now, redirect to reports as it's the main view
    redirect('/dashboard/reports')
}
