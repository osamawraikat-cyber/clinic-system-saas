'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { markInvoiceAsPaid } from '@/app/actions/invoices'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function MarkAsPaidButton({ invoiceId, status }: { invoiceId: string, status: string }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (status === 'paid') return null

    const handleMarkAsPaid = async () => {
        setLoading(true)
        try {
            const result = await markInvoiceAsPaid(invoiceId)
            if (result.success) {
                toast.success('Invoice marked as paid')
                router.refresh()
            } else {
                toast.error(result.error || 'Failed to update invoice')
            }
        } catch (e) {
            toast.error('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleMarkAsPaid}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as Paid
        </Button>
    )
}
