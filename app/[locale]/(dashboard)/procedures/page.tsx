import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, Stethoscope } from 'lucide-react'
import { ProceduresList } from '@/components/procedures/procedures-list'

export const revalidate = 0

export default async function ProceduresPage() {
    const supabase = await createClient()
    const { data: procedures, error } = await supabase
        .from('procedures')
        .select('*')
        .order('name')

    // Fetch Currency (Reusing logic for now, ideally this is a shared server util)
    let currency = 'USD'
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: userClinic } = await supabase
            .from('clinic_members')
            .select('clinic:clinics(currency)')
            .eq('user_id', user.id)
            .maybeSingle()

        if (userClinic?.clinic) {
            const c = userClinic.clinic as any
            currency = Array.isArray(c) ? c[0]?.currency : c?.currency
            currency = currency || 'USD'
        }
    }

    return (
        <div className="space-y-6 container mx-auto p-4 max-w-7xl animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[#1a1c2e] dark:text-white">Procedures Catalog</h2>
                    <p className="text-muted-foreground mt-1 text-base">
                        Manage your medical services and standard pricing.
                    </p>
                </div>
                <Link href="/procedures/new">
                    <Button className="bg-[#0F172A] hover:bg-[#1e293b] text-white shadow-lg shadow-slate-900/20 transition-all hover:scale-[1.02]">
                        <Plus className="h-5 w-5 mr-2" />
                        Add Procedure
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2">
                    <span>Error loading procedures: {error.message}</span>
                </div>
            )}

            {!procedures || procedures.length === 0 ? (
                <Card className="border-dashed border-2 shadow-none bg-slate-50/50 dark:bg-slate-900/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <Stethoscope className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No procedures yet</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Add your first medical procedure to start building your service catalog.
                        </p>
                        <Link href="/procedures/new">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Procedure
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <ProceduresList procedures={procedures} currency={currency} />
            )}
        </div>
    )
}
