'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function markInvoiceAsPaid(invoiceId: string) {
    const supabase = await createClient()

    // 1. Get current invoice total
    const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('total_amount, clinic_id')
        .eq('id', invoiceId)
        .single()

    if (fetchError || !invoice) {
        return { success: false, error: 'Invoice not found' }
    }

    // 2. Update status and amount_paid
    const { error: updateError } = await supabase
        .from('invoices')
        .update({
            status: 'paid',
            amount_paid: invoice.total_amount
        })
        .eq('id', invoiceId)

    if (updateError) {
        return { success: false, error: updateError.message }
    }

    // 3. Record a full payment record for tracking
    // We check if payments already cover it? The user just said "mark as paid action".
    // Ideally we should insert a payment record too, but let's stick to the request: "mark it as paid".
    // The previous update sets amount_paid, which effectively clears the balance on the UI.

    revalidatePath(`/invoices/${invoiceId}`)
    revalidatePath('/invoices')

    return { success: true }
}
