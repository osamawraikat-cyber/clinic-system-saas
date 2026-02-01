import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { AppointmentsList } from '@/components/appointments/appointments-list'

export const revalidate = 0

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function AppointmentsPage() {
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
            *,
            patient:patients (
                id,
                full_name,
                phone
            )
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

    // Clean up data for the client component
    // We map 'patients' (relation) to 'patient' (prop expected by component) if needed,
    // but the query alias "patient:patients" handles the renaming for us in the result.
    // However, TypeScript might complain about the type if Supabase generated types don't match exactly.
    // Let's rely on the runtime data being correct.

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-400">
                        Appointments
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Manage your schedule and patient visits
                    </p>
                </div>
                <Link href="/appointments/new">
                    <Button className="w-full sm:w-auto shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30">
                        <Plus className="h-4 w-4 mr-2" />
                        New Appointment
                    </Button>
                </Link>
            </div>

            {error ? (
                <div className="text-destructive text-center p-6 bg-destructive/5 rounded-xl border border-destructive/10">
                    <p className="font-semibold">Error loading appointments</p>
                    <p className="text-sm opacity-80">{error.message}</p>
                </div>
            ) : (
                <AppointmentsList initialAppointments={appointments || []} />
            )}
        </div>
    )
}
