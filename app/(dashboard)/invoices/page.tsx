import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { FileText, Plus, Receipt } from 'lucide-react'

export const revalidate = 0

export default async function InvoicesPage() {
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
            *,
            patient:patients(full_name, phone),
            visit:visits(visit_date)
        `)
        .order('created_at', { ascending: false })

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            paid: 'secondary',
            unpaid: 'destructive',
            partial: 'default'
        }
        return variants[status] || 'default'
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage patient invoices and payments
                    </p>
                </div>
                <Link href="/invoices/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Invoice
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                    Error loading invoices: {error.message}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        All Invoices
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!invoices || invoices.length === 0 ? (
                        <div className="text-center py-12">
                            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first invoice to start billing patients.
                            </p>
                            <Link href="/invoices/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Invoice
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Patient</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Paid</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map((invoice: any) => (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-mono text-sm">{invoice.invoice_number}</TableCell>
                                            <TableCell className="font-medium">{invoice.patient?.full_name || 'N/A'}</TableCell>
                                            <TableCell>{new Date(invoice.created_at).toLocaleDateString()}</TableCell>
                                            <TableCell className="font-medium">${Number(invoice.total_amount).toFixed(2)}</TableCell>
                                            <TableCell>${Number(invoice.amount_paid).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusBadge(invoice.status)}>
                                                    {invoice.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/invoices/${invoice.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
