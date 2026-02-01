'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    MoreHorizontal,
    Calendar,
    User,
    ArrowUpRight,
    Search,
    Filter
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/hooks/use-currency'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

interface Invoice {
    id: string
    invoice_number: string
    created_at: string
    total_amount: number
    amount_paid: number
    status: string
    patient?: {
        full_name: string
    }
}

interface InvoicesListProps {
    invoices: Invoice[]
    currency: string
}

export function InvoicesList({ invoices: initialInvoices, currency }: InvoicesListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredInvoices = initialInvoices.filter(inv =>
        inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.patient?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid': return 'default' // Primary/Solid for success usually
            case 'unpaid': return 'destructive'
            case 'partial': return 'secondary'
            default: return 'outline'
        }
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-white dark:bg-slate-950"
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Patient</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Paid</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <motion.tbody
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="[&_tr:last-child]:border-0"
                    >
                        <AnimatePresence>
                            {filteredInvoices.map((invoice) => (
                                <motion.tr
                                    key={invoice.id}
                                    variants={item}
                                    className="border-b transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/50 data-[state=selected]:bg-muted"
                                >
                                    <TableCell className="font-medium font-mono">
                                        {invoice.invoice_number}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                <User className="h-3 w-3 text-slate-500" />
                                            </div>
                                            <span className="font-medium text-sm">
                                                {invoice.patient?.full_name || 'N/A'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(invoice.created_at).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(invoice.total_amount, currency)}
                                    </TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {formatCurrency(invoice.amount_paid, currency)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={getStatusVariant(invoice.status)} className="capitalize shadow-sm">
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/invoices/${invoice.id}`}>
                                                    <DropdownMenuItem>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                </Link>
                                                <Link href={`/invoices/${invoice.id}?action=print`}>
                                                    <DropdownMenuItem>
                                                        <ArrowUpRight className="mr-2 h-4 w-4" />
                                                        Print Invoice
                                                    </DropdownMenuItem>
                                                </Link>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </motion.tbody>
                </Table>

                {filteredInvoices.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        No invoices match your search.
                    </div>
                )}
            </div>
        </div>
    )
}
