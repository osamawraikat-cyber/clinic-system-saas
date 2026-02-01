import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ArrowLeft, Download } from 'lucide-react'
import Link from 'next/link'
import { PaymentForm } from '@/components/payment-form'
import { InvoicePDF } from '@/components/invoice-pdf'

export const revalidate = 0

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
    const { data: invoice, error } = await supabase
        .from('invoices')
        .select(`
            *,
            patient:patients(*),
            visit:visits(*),
            payments(*)
        `)
        .eq('id', params.id)
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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Link href="/invoices">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Invoice {invoice.invoice_number}</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Date: {format(new Date(invoice.created_at), 'MMMM dd, yyyy')}
                                </p>
                            </div>
                            <InvoicePDF invoice={invoice} patient={invoice.patient} procedures={visitProcedures || []} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Patient Info */}
                        <div>
                            <h3 className="font-semibold mb-2">Patient Information</h3>
                            <div className="text-sm space-y-1">
                                <p><span className="font-medium">Name:</span> {invoice.patient?.full_name}</p>
                                <p><span className="font-medium">Phone:</span> {invoice.patient?.phone}</p>
                                {invoice.patient?.national_id && (
                                    <p><span className="font-medium">ID:</span> {invoice.patient.national_id}</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Procedures */}
                        <div>
                            <h3 className="font-semibold mb-2">Procedures & Charges</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted">
                                        <tr>
                                            <th className="text-left p-2">Procedure</th>
                                            <th className="text-right p-2">Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visitProcedures?.map((vp: any) => (
                                            <tr key={vp.id} className="border-t">
                                                <td className="p-2">{vp.procedure?.name}</td>
                                                <td className="p-2 text-right">${Number(vp.cost).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="border-t-2 font-semibold">
                                        <tr>
                                            <td className="p-2">Total</td>
                                            <td className="p-2 text-right">${Number(invoice.total_amount).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>

                        <Separator />

                        {/* Payment History */}
                        <div>
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

                {/* Payment Summary & Form */}
                <div className="space-y-4">
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
