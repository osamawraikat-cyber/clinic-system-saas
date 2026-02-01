'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DollarSign } from 'lucide-react'

interface PaymentFormProps {
    invoiceId: string
    maxAmount: number
}

export function PaymentForm({ invoiceId, maxAmount }: PaymentFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [amount, setAmount] = useState(maxAmount.toString())
    const [paymentMethod, setPaymentMethod] = useState<string>('cash')
    const [transactionRef, setTransactionRef] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const paymentAmount = parseFloat(amount)

            // Validation
            if (isNaN(paymentAmount) || paymentAmount <= 0) {
                toast.error('Invalid amount', {
                    description: 'Please enter a valid payment amount'
                })
                setLoading(false)
                return
            }

            if (paymentAmount > maxAmount) {
                toast.error('Amount exceeds balance', {
                    description: `Payment cannot exceed $${maxAmount.toFixed(2)}`
                })
                setLoading(false)
                return
            }

            // Insert payment record
            const { error: paymentError } = await supabase
                .from('payments')
                .insert({
                    invoice_id: invoiceId,
                    amount: paymentAmount,
                    payment_method: paymentMethod,
                    transaction_reference: transactionRef || null,
                })

            if (paymentError) {
                console.error('Payment error:', paymentError)
                throw new Error(paymentError.message || 'Failed to record payment')
            }

            // Fetch current invoice to calculate new totals
            const { data: invoice } = await supabase
                .from('invoices')
                .select('total_amount, amount_paid, invoice_number')
                .eq('id', invoiceId)
                .single()

            if (!invoice) throw new Error('Invoice not found')

            const newAmountPaid = Number(invoice.amount_paid) + paymentAmount
            const totalAmount = Number(invoice.total_amount)
            const newBalance = totalAmount - newAmountPaid

            let newStatus = 'unpaid'
            if (newAmountPaid >= totalAmount) {
                newStatus = 'paid'
            } else if (newAmountPaid > 0) {
                newStatus = 'partial'
            }

            // Update invoice
            const { error: updateError } = await supabase
                .from('invoices')
                .update({
                    amount_paid: newAmountPaid,
                    status: newStatus
                })
                .eq('id', invoiceId)

            if (updateError) {
                console.error('Update error:', updateError)
                throw new Error(updateError.message || 'Failed to update invoice')
            }

            // Success!
            toast.success('Payment recorded successfully!', {
                description: newBalance <= 0
                    ? `Invoice ${invoice.invoice_number} is now fully paid`
                    : `Remaining balance: $${newBalance.toFixed(2)}`
            })

            // Reset form
            setAmount(newBalance > 0 ? newBalance.toString() : '')
            setTransactionRef('')

            router.refresh()
        } catch (error: any) {
            console.error('Payment error:', error)
            toast.error('Failed to record payment', {
                description: error.message || 'An unexpected error occurred'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={maxAmount}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="pl-9"
                        required
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    Maximum: ${maxAmount.toFixed(2)}
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="method">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">💵 Cash</SelectItem>
                        <SelectItem value="mobile_money">📱 Mobile Money</SelectItem>
                        <SelectItem value="card">💳 Card</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {paymentMethod !== 'cash' && (
                <div className="space-y-2">
                    <Label htmlFor="ref">Transaction Reference</Label>
                    <Input
                        id="ref"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder={paymentMethod === 'mobile_money' ? 'e.g., M-PESA code' : 'Transaction ID'}
                    />
                </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing Payment...' : 'Record Payment'}
            </Button>
        </form>
    )
}
