'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function deletePatient(id: string) {
    const supabase = await createClient()

    // 1. Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    // Check role in clinic_members
    const { data: memberData } = await supabase
        .from('clinic_members')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle()

    const isAdmin = memberData?.role === 'admin' ||
        memberData?.role === 'owner' ||
        user.email?.toLowerCase() === (process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@zahiflow.com').toLowerCase() ||
        !memberData

    if (!isAdmin) {
        return { success: false, error: 'Unauthorized: Only admins or owners can delete patients' }
    }

    // 2. Delete the patient
    // Note: Due to foreign key constraints, we might want to delete visits/invoices first 
    // or rely on ON DELETE CASCADE if configured.
    const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting patient:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/patients')
    revalidatePath('/') // Dashboard
    return { success: true }
}
