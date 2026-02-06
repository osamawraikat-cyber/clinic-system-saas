'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Users,
    FileText,
    DollarSign,
    Calendar,
    Plus,
    ArrowRight,
    Activity,
    Stethoscope,
    TrendingUp
} from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { OnboardingSteps } from '@/components/dashboard/onboarding-steps'

// Animation Variants
const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 }
    }
}

export default function DashboardPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const router = useRouter()
    const t = useTranslations('Dashboard')
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('Doctor')
    const [stats, setStats] = useState({
        patientCount: 0,
        appointmentsToday: 0,
        pendingAmount: 0,
        totalRevenue: 0
    })
    const [recentVisits, setRecentVisits] = useState<any[]>([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 0. User Profile
                const { data: { user } } = await supabase.auth.getUser()
                if (user?.user_metadata?.full_name) {
                    setUserName(user.user_metadata.full_name)
                }

                // 1. Patients
                const { count: patientCount } = await supabase
                    .from('patients')
                    .select('*', { count: 'exact', head: true })

                // 2. Pending Invoices
                const { data: pendingInvoices } = await supabase
                    .from('invoices')
                    .select('total_amount, amount_paid')
                    .neq('status', 'paid')

                const pendingAmount = pendingInvoices?.reduce((sum, inv) =>
                    sum + (Number(inv.total_amount) - Number(inv.amount_paid)), 0
                ) || 0

                // 3. Total Revenue
                const { data: allInvoices } = await supabase
                    .from('invoices')
                    .select('amount_paid')

                const totalRevenue = allInvoices?.reduce((sum, inv) =>
                    sum + Number(inv.amount_paid), 0
                ) || 0

                // 4. Appointments Today
                const today = new Date().toISOString().split('T')[0]
                const { count: appointmentsToday } = await supabase
                    .from('appointments')
                    .select('*', { count: 'exact', head: true })
                    .eq('appointment_date', today)

                // 5. Recent Visits (for Activity Feed)
                const { data: visits } = await supabase
                    .from('visits')
                    .select(`
                        id, 
                        visit_date, 
                        patients (full_name)
                    `)
                    .order('visit_date', { ascending: false })
                    .limit(5)

                setStats({
                    patientCount: patientCount || 0,
                    appointmentsToday: appointmentsToday || 0,
                    pendingAmount,
                    totalRevenue
                })
                setRecentVisits(visits || [])
            } catch (error) {
                console.error("Error fetching stats", error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    return (
        <div className="space-y-8 p-2 md:p-4">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                        {t('greeting')}, {userName}
                    </h1>
                    <p className="text-muted-foreground mt-1">{t('greetingSubtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => router.push('/visits/new')} className="bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20">
                        <Plus className="mr-2 h-4 w-4" /> {t('recordVisit')}
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/patients/new')}>
                        <Users className="mr-2 h-4 w-4" /> {t('addPatient')}
                    </Button>
                </div>
            </motion.div>

            {/* Onboarding / Getting Started - Only show if stats are loaded */}
            {!loading && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="w-full"
                >
                    <OnboardingSteps
                        hasPatients={stats.patientCount > 0}
                        hasAppointments={stats.appointmentsToday > 0 || recentVisits.length > 0} // Loosely check if they have ever created an appointment/visit
                        hasInvoices={stats.totalRevenue > 0 || stats.pendingAmount > 0}
                    />
                </motion.div>
            )}

            {/* Stats Grid */}
            <motion.div
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Total Patients */}
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalPatients')}</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.patientCount}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                Total registered patients
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Today's Appointments */}
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('appointmentsToday')}</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.appointmentsToday}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('scheduledToday')}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pending Invoices */}
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('pendingInvoices')}</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">${stats.pendingAmount.toFixed(0)}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {t('unpaidBalance')}
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Revenue */}
                <motion.div variants={itemVariants}>
                    <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalRevenue')}</CardTitle>
                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalRevenue.toFixed(0)}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                {/* <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" /> +8% */}
                                Lifetime Revenue
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Action Area */}
                <motion.div
                    className="lg:col-span-2 space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="h-full shadow-md border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle>{t('quickActions')}</CardTitle>
                            <CardDescription>{t('quickActionsDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all group"
                                onClick={() => router.push('/visits/new')}
                            >
                                <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 group-hover:scale-110 transition-transform">
                                    <Stethoscope className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('recordNewVisit')}</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all group"
                                onClick={() => router.push('/patients/new')}
                            >
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('registerPatient')}</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center gap-2 hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all group"
                                onClick={() => router.push('/appointments')}
                            >
                                <div className="p-3 rounded-full bg-violet-100 dark:bg-violet-900/30 group-hover:scale-110 transition-transform">
                                    <Calendar className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('appointments')}</span>
                            </Button>

                            <Button
                                variant="outline"
                                className="h-24 flex flex-col items-center justify-center gap-2 hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all group"
                                onClick={() => router.push('/invoices')}
                            >
                                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{t('manageBilling')}</span>
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity Feed */}
                <motion.div
                    className="lg:col-span-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <Card className="h-full shadow-md border-slate-200 dark:border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-emerald-500" />
                                {t('recentActivity')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentVisits.length > 0 ? (
                                    recentVisits.map((visit) => (
                                        <div key={visit.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                                                    <Stethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{visit.patients?.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(visit.visit_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Link href={`/visits/${visit.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        {t('noActivity')}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
