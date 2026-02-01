import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { InvoicesList } from '@/components/invoices/invoices-list'

export const revalidate = 0

export default async function InvoicesPage() {
    // Fetch Invoices and Clinic Currency
    const { data: invoices, error } = await supabase
        .from('invoices')
        .select(`
            *,
            patient:patients(full_name, phone),
            clinic:clinics(currency)
        `)
        .order('created_at', { ascending: false })

    // Determine currency from the first invoice's clinic data, or default to USD
    // Note: In a real multi-tenant app, we should fetch the clinic separately to be safe if no invoices exist
    // But usually one user belongs to one clinic.
    // Let's do a reliable fetch for the clinic currency if possible, or fallback.
    let currency = 'USD'
    if (invoices && invoices.length > 0 && invoices[0].clinic?.currency) {
        currency = invoices[0].clinic.currency
    } else {
        // Fallback: fetch user's clinic currency directly
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: userClinic } = await supabase
                .from('clinic_members')
                .select('clinic:clinics(currency)')
                .eq('user_id', user.id)
                .single()
            if (userClinic?.clinic?.currency) {
                currency = userClinic.clinic.currency
            }
        }
    }

    return (
        <div className="space-y-6 container mx-auto p-4 max-w-7xl animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#1a1c2e] dark:text-white">Invoices</h2>
                    <p className="text-muted-foreground mt-1 text-base">
                        Track payments, manage billing, and revenue.
                    </p>
                </div>
                <Link href="/invoices/new">
                    <Button className="bg-[#0F172A] hover:bg-[#1e293b] text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02]">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Invoice
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
                    <span>Error loading invoices: {error.message}</span>
                </div>
            )}

            <Card className="border-none shadow-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                        <Receipt className="h-5 w-5 text-indigo-500" />
                        Recent Invoices
                    </CardTitle>
                    <CardDescription>
                        A list of all issued invoices and their payment status.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    {!invoices || invoices.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center">
                            <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                                <Receipt className="h-10 w-10 text-indigo-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No invoices yet</h3>
                            <p className="text-muted-foreground max-w-sm mb-8 text-lg">
                                Create your first invoice to start billing patients and tracking revenue.
                            </p>
                            <Link href="/invoices/new">
                                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20">
                                    Create First Invoice
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <InvoicesList invoices={invoices} currency={currency} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
