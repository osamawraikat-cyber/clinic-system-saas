"use client"

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'

export default function DemoBanner() {
    const [isDemo, setIsDemo] = useState(false)
    const [dismissed, setDismissed] = useState(false)

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

    if (!isDemo || dismissed) return null

    return (
        <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-900">
            <Sparkles className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between">
                <div className="flex-1">
                    <strong className="font-semibold">Demo Mode</strong> - You're exploring with sample data.{' '}
                    <Link href="/signup" className="underline hover:text-amber-700">
                        Sign up
                    </Link>{' '}
                    to create your own clinic and save your data.
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-amber-100"
                    onClick={() => setDismissed(true)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </AlertDescription>
        </Alert>
    )
}
