'use server'

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Seeds the demo clinic with sample data if it's empty.
 * This ensures demo users have a realistic experience with invoices and visits.
 */
export async function seedDemoData() {
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server component - cookies are read-only
                    }
                },
            },
        }
    )

    // 1. Get current clinic (should be the demo clinic)
    const { data: clinicIds, error: rpcError } = await supabase.rpc('get_my_clinic_ids')

    if (rpcError) {
        console.error('RPC Error (get_my_clinic_ids):', rpcError)
        return { error: rpcError.message }
    }

    const clinicId = clinicIds?.[0]
    console.log('Seeding demo data for clinic:', clinicId)

    if (!clinicId) {
        console.error('No clinic ID found for seeding')
        return { error: 'No clinic found' }
    }

    // 2. Check if we already have visits/invoices
    const { count: visitCount } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)

    if (visitCount && visitCount > 0) {
        return { success: true, message: 'Data already exists' }
    }

    // 3. Get some patient IDs. If no patients, seed them first!
    let { data: patients, error: patientError } = await supabase
        .from('patients')
        .select('id, full_name')
        .eq('clinic_id', clinicId)
        .limit(5)

    if (!patients || patients.length === 0) {
        console.log('No patients found, seeding initial patients...')
        const samplePatients = [
            { clinic_id: clinicId, full_name: 'Sarah Ahmed', phone: '0791234567', national_id: '9901012345' },
            { clinic_id: clinicId, full_name: 'Omar Khalil', phone: '0781234567', national_id: '9801012345' },
            { clinic_id: clinicId, full_name: 'Laila Hassan', phone: '0771234567', national_id: '9701012345' }
        ]
        const { data: newPatients, error: seedPatientError } = await supabase
            .from('patients')
            .insert(samplePatients)
            .select('id, full_name')

        if (seedPatientError) {
            console.error('Failed to seed patients:', seedPatientError)
            return { error: 'Failed to seed patients: ' + seedPatientError.message }
        }
        patients = newPatients
    }

    if (!patients || patients.length === 0) {
        return { error: 'No patients available for seeding visits/invoices' }
    }

    // 4. Seed visits
    const sampleVisits = patients.map((p, i) => ({
        clinic_id: clinicId,
        patient_id: p.id,
        visit_date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        reason: i % 2 === 0 ? 'Monthly Checkup' : 'Routine Consultation',
        notes: 'Patient shows good progress.',
        diagnosis: 'General Wellness',
        treatment_plan: 'Continue current supplements.',
        status: 'completed'
    }))

    const { error: visitError } = await supabase.from('visits').insert(sampleVisits)
    if (visitError) return { error: visitError.message }

    // 5. Seed invoices
    const sampleInvoices = patients.map((p, i) => ({
        clinic_id: clinicId,
        patient_id: p.id,
        invoice_number: `INV-DEMO-${1000 + i}`,
        issue_date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        total_amount: 150 + (i * 50),
        status: i % 2 === 0 ? 'paid' : 'pending',
        line_items: [
            { description: 'Consultation Fee', quantity: 1, unit_price: 100, total: 100 },
            { description: 'Procedure Charge', quantity: 1, unit_price: 50 + (i * 50), total: 50 + (i * 50) }
        ]
    }))

    const { error: invoiceError } = await supabase.from('invoices').insert(sampleInvoices)
    if (invoiceError) return { error: invoiceError.message }

    return { success: true, message: 'Demo data seeded successfully' }
}
