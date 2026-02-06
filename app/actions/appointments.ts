'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateAppointmentStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no_show') {
    const supabase = await createClient()

    const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)

    if (error) {
        return { success: false, error: error.message }
    }

    revalidatePath('/appointments')
    revalidatePath('/') // Dashboard
    return { success: true }
}
