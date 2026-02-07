"use client"

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Sparkles, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { seedDemoData } from "@/app/actions/demo"
import { toast } from "sonner"

export default function DemoBanner() {
    const [isDemo, setIsDemo] = useState(false)
    const [dismissed, setDismissed] = useState(false)
    const [isSeeding, setIsSeeding] = useState(false)

    useEffect(() => {
        const checkDemoUser = async () => {
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const { data: { user } } = await supabase.auth.getUser()

            // Check if user email matches demo email
            const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@zahiflow.com'
            if (user?.email === demoEmail) {
                setIsDemo(true)
            }
        }

        checkDemoUser()
    }, [])

    const handleRefreshData = async () => {
        setIsSeeding(true)
        try {
            const result = await seedDemoData()
            if (result.success) {
                toast.success('Sample data refreshed!')
                window.location.reload()
            } else {
                toast.error(result.err || result.error || 'Failed to refresh data')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setIsSeeding(false)
        }
    }

    if (!isDemo || dismissed) return null

    return (
        <Alert className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-4">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                    <strong className="font-semibold">Demo Mode</strong> - We have added sample patients, visits, and invoices for you.{' '}
                    <Link href="/signup" className="underline hover:text-emerald-700 font-medium">
                        Sign up
                    </Link>{' '}
                    to create your own clinic.
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100 h-8 flex-1 sm:flex-none"
                        onClick={handleRefreshData}
                        disabled={isSeeding}
                    >
                        {isSeeding ? (
                            <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="h-3 w-3 mr-2" />
                        )}
                        Refresh Data
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-emerald-100 hidden sm:flex"
                        onClick={() => setDismissed(true)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </AlertDescription>
        </Alert>
    )
}
