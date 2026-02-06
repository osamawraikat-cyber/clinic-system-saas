import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PatientDetailView } from '@/components/patients/patient-detail-view'

export const revalidate = 0

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch all related data in parallel
    const [
        { data: patient, error: patientError },
        { data: visits },
        { data: appointments },
        { data: invoices }
    ] = await Promise.all([
        supabase.from('patients').select('*').eq('id', id).single(),
        supabase.from('visits').select('*').eq('patient_id', id).order('visit_date', { ascending: false }),
        supabase.from('appointments').select('*').eq('patient_id', id).order('appointment_date', { ascending: false }),
        supabase.from('invoices').select('*').eq('patient_id', id).order('created_at', { ascending: false })
    ])

    if (patientError || !patient) {
        return <div className="text-red-500">Patient not found</div>
    }

    return (
        <div className="space-y-4">
            <Link href="/patients">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
                </Button>
            </Link>

            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">{patient.full_name}</h2>
            </div>

            <PatientDetailView
                patient={patient}
                visits={visits || []}
                appointments={appointments || []}
                invoices={invoices || []}
            />
        </div>
    )
}
