'use client'

import { motion } from "framer-motion"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Calendar, Users, TrendingUp, Clock, Shield, Heart } from "lucide-react"
import { useTranslations } from "next-intl"

export function Hero() {
    const t = useTranslations('Hero')

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Gradients - Medical Blue Theme */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-100/60 via-cyan-50/40 to-transparent dark:from-sky-900/20 dark:via-cyan-900/10" />
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gradient-to-tr from-blue-400/15 to-emerald-400/15 rounded-full blur-3xl -z-10" />

            <div className="container px-4 md:px-6">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-start space-y-8">

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                            </span>
                            {t('scrollingBadge')}
                        </motion.div>

                        {/* Headline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="space-y-4 max-w-4xl"
                        >
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                                {t('headlinePrefix')} <br className="hidden sm:inline" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 dark:from-sky-400 dark:via-cyan-400 dark:to-teal-400">
                                    {t('headlineSuffix')}
                                </span>
                            </h1>
                            <p className="mx-auto lg:mx-0 max-w-[700px] text-slate-600 md:text-xl dark:text-slate-400">
                                {t('subhead')}
                            </p>
                        </motion.div>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
                        >
                            <Link href="/signup">
                                <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-700 hover:to-cyan-700 shadow-lg shadow-sky-500/25 transition-all hover:shadow-sky-500/40 hover:scale-[1.02]">
                                    {t('ctaStart')} <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">
                                    {t('ctaDemo')}
                                </Button>
                            </Link>
                        </motion.div>

                        {/* Trust Signals */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="pt-4 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500 dark:text-slate-400"
                        >
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>{t('trustHipaa')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span>{t('trustNoCard')}</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Dashboard Mockup - CSS-based Premium Illustration */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="relative hidden lg:block"
                    >
                        {/* Main Dashboard Window */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 dark:shadow-black/40 border border-slate-200/50 dark:border-slate-700/50 bg-white dark:bg-slate-900">
                            {/* Browser Chrome */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="bg-white dark:bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 dark:text-slate-500 flex items-center gap-2">
                                        <Shield className="w-3 h-3" />
                                        <span>app.zahiflow.com/dashboard</span>
                                    </div>
                                </div>
                            </div>

                            {/* Dashboard Content */}
                            <div className="p-4 space-y-4">
                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-3">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-900/30 dark:to-cyan-900/30 rounded-xl p-3 border border-sky-100 dark:border-sky-800/50"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-sky-500/10 rounded-lg">
                                                <Users className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800 dark:text-white">2,847</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Patients</div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/50"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800 dark:text-white">156</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Today</div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.7 }}
                                        className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl p-3 border border-violet-100 dark:border-violet-800/50"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1.5 bg-violet-500/10 rounded-lg">
                                                <TrendingUp className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                                            </div>
                                        </div>
                                        <div className="text-2xl font-bold text-slate-800 dark:text-white">+24%</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Growth</div>
                                    </motion.div>
                                </div>

                                {/* Chart Placeholder */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.8 }}
                                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Weekly Overview</span>
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+12.5%</span>
                                    </div>
                                    {/* Mini Chart Bars */}
                                    <div className="flex items-end gap-2 h-16">
                                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ delay: 0.9 + i * 0.05, duration: 0.5 }}
                                                className="flex-1 bg-gradient-to-t from-sky-500 to-cyan-400 rounded-t-sm"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                                    </div>
                                </motion.div>

                                {/* Appointments List */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1 }}
                                    className="space-y-2"
                                >
                                    {[
                                        { name: 'Sarah Ahmed', type: 'Consultation', time: '09:30 AM', color: 'sky' },
                                        { name: 'Omar Khalil', type: 'Follow-up', time: '10:15 AM', color: 'emerald' },
                                    ].map((apt, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 1.1 + i * 0.1 }}
                                            className="flex items-center gap-3 p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/50"
                                        >
                                            <div className={`w-8 h-8 rounded-full bg-${apt.color}-100 dark:bg-${apt.color}-900/30 flex items-center justify-center`}>
                                                <Heart className={`w-4 h-4 text-${apt.color}-500`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{apt.name}</div>
                                                <div className="text-xs text-slate-400">{apt.type}</div>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                {apt.time}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        </div>

                        {/* Floating Elements */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3 }}
                            className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-xl p-3 shadow-xl shadow-slate-900/10 dark:shadow-black/30 border border-slate-100 dark:border-slate-700/50"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200">HIPAA Compliant</div>
                                    <div className="text-[10px] text-slate-400">Secure & Encrypted</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.4 }}
                            className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-xl p-3 shadow-xl shadow-slate-900/10 dark:shadow-black/30 border border-slate-100 dark:border-slate-700/50"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-sky-500" />
                                </div>
                                <div>
                                    <div className="text-xs font-medium text-slate-700 dark:text-slate-200">Revenue +18%</div>
                                    <div className="text-[10px] text-slate-400">This month</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Decorative Blurs */}
                        <div className="absolute -top-20 -right-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl -z-10" />
                        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
