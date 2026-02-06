import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { PaymentForm } from '@/components/payment-form'
import { InvoicePDF } from '@/components/invoice-pdf'
import { PrintButton } from '@/components/print-button'
import { MarkAsPaidButton } from '@/components/invoices/mark-paid-button'

export const revalidate = 0

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
            *,
            patient:patients(*),
            visit:visits(*),
            payments(*)
        `)
        .eq('id', id)
        .single()

    if (error || !invoice) {
        return <div className="text-red-500">Invoice not found</div>
    }

    // Get procedures for this visit
    const { data: visitProcedures } = await supabase
        .from('visit_procedures')
        .select(`
            *,
            procedure:procedures(*)
        `)
        .eq('visit_id', invoice.visit_id)

    const balance = Number(invoice.total_amount) - Number(invoice.amount_paid)

    return (
        <div className="space-y-4 max-w-5xl mx-auto">

            {/* Header / Actions */}
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                    <Link href="/invoices">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                        </Button>
                    </Link>
                </div>
                <div className="flex gap-2">
                    <MarkAsPaidButton invoiceId={invoice.id} status={invoice.status} />
                    <PrintButton label="Print Invoice" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 print:block">
                {/* Main Invoice Card */}
                <Card className="md:col-span-2 print:col-span-3 print:shadow-none print:border-0">
                    <CardHeader className="print:pb-6 print:border-b">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-emerald-700 hidden print:block mb-1">ZahiFlow Clinic</h1>
                                <CardTitle className="text-xl">Invoice #{invoice.invoice_number}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Date: {format(new Date(invoice.created_at), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                            <div className="no-print">
                                <InvoicePDF invoice={invoice} patient={invoice.patient} procedures={visitProcedures || []} />
                            </div>
                            {/* Print-only status */}
                            <div className="hidden print:block text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${invoice.status === 'paid' ? 'border-green-200 text-green-800' :
                                    invoice.status === 'partial' ? 'border-yellow-200 text-yellow-800' :
                                        'border-red-200 text-red-800'
                                    }`}>
                                    {invoice.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6 print:pt-6">
                        {/* Clinic Info (Print Only) */}
                        <div className="hidden print:block text-sm text-muted-foreground mb-6">
                            <p>123 Medical Center Dr., Cityville</p>
                            <p>Phone: +123 456 7890</p>
                        </div>

                        {/* Patient Info */}
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Bill To</h3>
                                <div className="text-sm space-y-1">
                                    <p className="font-medium text-lg">{invoice.patient?.full_name}</p>
                                    <p>{invoice.patient?.phone}</p>
                                    {invoice.patient?.national_id && (
                                        <p>ID: {invoice.patient.national_id}</p>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <h3 className="font-semibold mb-2 text-sm uppercase tracking-wider text-muted-foreground">Payment Details</h3>
                                <div className="text-sm space-y-1">
                                    <p><span className="text-muted-foreground">Total Due:</span> <span className="font-medium">${Number(invoice.total_amount).toFixed(2)}</span></p>
                                    <p><span className="text-muted-foreground">Amount Paid:</span> <span className="font-medium">${Number(invoice.amount_paid).toFixed(2)}</span></p>
                                    <p className={`font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        Balance: ${balance.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Procedures Table */}
                        <div>
                            <h3 className="font-semibold mb-4">Services Rendered</h3>
                            <div className="border rounded-lg overflow-hidden print:border-0">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted print:bg-slate-100">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Description</th>
                                            <th className="text-right p-3 font-medium">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visitProcedures?.map((vp: any) => (
                                            <tr key={vp.id} className="border-t">
                                                <td className="p-3">{vp.procedure?.name}</td>
                                                <td className="p-3 text-right">${Number(vp.cost).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t-2 font-semibold bg-slate-50 print:bg-transparent">
                                        <tr>
                                            <td className="p-3 text-right">Total</td>
                                            <td className="p-3 text-right">${Number(invoice.total_amount).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <div className="hidden print:block mt-12 pt-8 border-t">
                            <div className="flex justify-between items-end text-sm">
                                <div>
                                    <p className="font-medium">Thank you for your business!</p>
                                    <p className="text-muted-foreground text-xs mt-1">Please make checks payable to SehaTech Clinic</p>
                                </div>
                                <div className="text-center w-40">
                                    <div className="border-b border-black mb-2 h-8"></div>
                                    <p className="text-xs text-muted-foreground">Authorized Signature</p>
                                </div>
                            </div>
                        </div>

                        <Separator className="print:hidden" />

                        {/* Payment History (Screen Only) */}
                        <div className="print:hidden">
                            <h3 className="font-semibold mb-2">Payment History</h3>
                            {invoice.payments?.length > 0 ? (
                                <div className="space-y-2">
                                    {invoice.payments.map((payment: any) => (
                                        <div key={payment.id} className="flex justify-between text-sm border-b pb-2">
                                            <div>
                                                <p className="font-medium">{payment.payment_method.replace('_', ' ').toUpperCase()}</p>
                                                {payment.transaction_reference && (
                                                    <p className="text-xs text-muted-foreground">Ref: {payment.transaction_reference}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">${Number(payment.amount).toFixed(2)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar Actions (Hidden on Print) */}
                <div className="space-y-4 print:hidden">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Total Amount:</span>
                                <span className="font-semibold">${Number(invoice.total_amount).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Amount Paid:</span>
                                <span className="font-semibold text-green-600">${Number(invoice.amount_paid).toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between">
                                <span className="font-semibold">Balance Due:</span>
                                <span className={`font-bold text-lg ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    ${balance.toFixed(2)}
                                </span>
                            </div>
                            <div className="pt-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {invoice.status.toUpperCase()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {balance > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Record Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PaymentForm invoiceId={invoice.id} maxAmount={balance} />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
