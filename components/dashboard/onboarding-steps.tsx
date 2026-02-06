'use client'

import Link from "next/link"
import { CheckCircle2, Circle, ArrowRight, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"

interface OnboardingStepsProps {
    hasPatients: boolean
    hasAppointments: boolean
    hasInvoices: boolean
}

export function OnboardingSteps({ hasPatients, hasAppointments, hasInvoices }: OnboardingStepsProps) {
    const t = useTranslations('Dashboard.onboarding')
    const [isVisible, setIsVisible] = useState(false) // Default to false to prevent flash
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const dismissed = localStorage.getItem('dashboard-onboarding-dismissed')
        if (!dismissed) {
            setIsVisible(true)
        }
    }, [])

    const handleDismiss = () => {
        setIsVisible(false)
        localStorage.setItem('dashboard-onboarding-dismissed', 'true')
    }

    // Calculate progress
    const steps = [
        { id: 'account', label: t('steps.account'), done: true, link: null },
        { id: 'patient', label: t('steps.patient'), done: hasPatients, link: '/patients/new', action: t('actions.addPatient') },
        { id: 'appointment', label: t('steps.appointment'), done: hasAppointments, link: '/visits/new', action: t('actions.bookVisit') },
        { id: 'invoice', label: t('steps.invoice'), done: hasInvoices, link: '/invoices', action: t('actions.createInvoice') },
    ]

    const completedCount = steps.filter(s => s.done).length
    const totalSteps = steps.length
    const progress = (completedCount / totalSteps) * 100
    const allComplete = completedCount === totalSteps

    if (!isVisible) return null

    // If all complete, show a simplified "All set" banner or nothing (user can dismiss)
    if (allComplete) {
        return (
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="col-span-4 lg:col-span-2"
                    >
                        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border-emerald-100 dark:border-emerald-900/50">
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">{t('completedTitle')}</h3>
                                        <p className="text-sm text-emerald-700 dark:text-emerald-300">{t('completedDesc')}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/50">
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        )
    }

    // Find the first incomplete step to highlight it
    const activeStepIndex = steps.findIndex(s => !s.done)

    return (
        <Card className="border-blue-100 bg-blue-50/30 dark:border-blue-900/50 dark:bg-blue-900/10 col-span-4 lg:col-span-2">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg text-blue-950 dark:text-blue-50">{t('title')}</CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                            {completedCount} {t('of')} {totalSteps} {t('stepsCompleted')}
                        </CardDescription>
                    </div>
                    {/* Progress Ring or Bar could go here */}
                    <div className="h-2 w-24 bg-blue-100 dark:bg-blue-900 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    {steps.map((step, index) => {
                        const isActive = index === activeStepIndex
                        const isPast = step.done

                        return (
                            <div
                                key={step.id}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isActive ? 'bg-white/60 dark:bg-white/5 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800' : ''}`}
                            >
                                {isPast ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                                ) : isActive ? (
                                    <Circle className="h-5 w-5 text-blue-500 flex-shrink-0 animate-pulse" />
                                ) : (
                                    <Circle className="h-5 w-5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${isPast ? 'text-slate-500 line-through' : isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {step.label}
                                    </p>
                                </div>

                                {isActive && step.link && (
                                    <Link href={step.link}>
                                        <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                            {step.action} <ArrowRight className="ml-1.5 h-3 w-3" />
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
