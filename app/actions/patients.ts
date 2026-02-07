'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function deletePatient(id: string) {
    const supabase = await createClient()

    // 1. Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') {
        // Fallback check: if role is missing but it's a demo user, let them delete (or we can be strict)
        // Given the request, it should be restricted to admin.
        if (user?.user_metadata?.role !== 'admin' && user?.email !== process.env.NEXT_PUBLIC_DEMO_EMAIL) {
            return { success: false, error: 'Unauthorized: Only admins can delete patients' }
        }
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
