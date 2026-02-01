import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, DollarSign, Calendar } from 'lucide-react'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { OnboardingSteps } from '@/components/dashboard/onboarding-steps'

export const revalidate = 0

export default async function Page() {
    // Fetch patient count
    const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })

    // Fetch pending invoices
    const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('total_amount, amount_paid')
        .neq('status', 'paid')

    const pendingAmount = pendingInvoices?.reduce((sum, inv) =>
        sum + (Number(inv.total_amount) - Number(inv.amount_paid)), 0
    ) || 0

    // Fetch total revenue (all paid invoices)
    const { data: allInvoices } = await supabase
        .from('invoices')
        .select('amount_paid')

    const totalRevenue = allInvoices?.reduce((sum, inv) =>
        sum + Number(inv.amount_paid), 0
    ) || 0

    // Get today's appointments count
    const today = new Date().toISOString().split('T')[0]
    const { count: appointmentsToday } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('appointment_date', today)

    // Fetch 6-month revenue data
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const { data: historicalInvoices } = await supabase
        .from('invoices')
        .select('created_at, amount_paid')
        .eq('status', 'paid')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true })

    // Group by month/day for the chart
    const revenueMap = new Map<string, number>()
    historicalInvoices?.forEach(inv => {
        const date = new Date(inv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        revenueMap.set(date, (revenueMap.get(date) || 0) + Number(inv.amount_paid))
    })

    const chartData = Array.from(revenueMap.entries()).map(([date, amount]) => ({
        date,
        amount
    }))

    return (
        <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>

            {/* Onboarding for New Clinics (0 Patients) */}
            {(!patientCount || patientCount === 0) && <OnboardingSteps />}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-chart-1/20 border-chart-1/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-chart-1-foreground text-foreground/80">Total Patients</CardTitle>
                        <div className="p-2 bg-chart-1/20 rounded-full">
                            <Users className="h-4 w-4 text-chart-1-foreground text-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{patientCount || 0}</div>
                        <p className="text-xs font-medium text-muted-foreground mt-1">+10% from last month</p>
                    </CardContent>
                </Card>

                <Card className="bg-chart-2/20 border-chart-2/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground/80">Today's Appointments</CardTitle>
                        <div className="p-2 bg-chart-2/20 rounded-full">
                            <Calendar className="h-4 w-4 text-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">{appointmentsToday || 0}</div>
                        <p className="text-xs font-medium text-muted-foreground mt-1">+5% from yesterday</p>
                    </CardContent>
                </Card>

                <Card className="bg-chart-3/20 border-chart-3/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground/80">Pending Invoices</CardTitle>
                        <div className="p-2 bg-chart-3/20 rounded-full">
                            <FileText className="h-4 w-4 text-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">${pendingAmount.toFixed(2)}</div>
                        <p className="text-xs font-medium text-muted-foreground mt-1">Outstanding balance</p>
                    </CardContent>
                </Card>

                <Card className="bg-chart-4/20 border-chart-4/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground/80">Total Revenue</CardTitle>
                        <div className="p-2 bg-chart-4/20 rounded-full">
                            <DollarSign className="h-4 w-4 text-foreground" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">${totalRevenue.toFixed(2)}</div>
                        <p className="text-xs font-medium text-muted-foreground mt-1">All-time collected</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <RevenueChart data={chartData} />
            </div>
        </div>
    )
}
