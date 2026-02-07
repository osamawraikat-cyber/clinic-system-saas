"use client"

import { useEffect, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { seedDemoData } from '@/app/actions/demo'

import { useParams } from 'next/navigation'

export default function DemoPage() {
    const { locale } = useParams()
    const router = useRouter()
    const [status, setStatus] = useState<'loading' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const loginToDemo = async () => {
            try {
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                )

                // Demo credentials
                const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@zahiflow.com'
                const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Demo123456!'

                // Sign in with demo credentials
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: demoEmail,
                    password: demoPassword,
                })

                if (error) {
                    console.error('Demo login error:', error)
                    setErrorMessage(error.message)
                    setStatus('error')
                    return
                }

                if (data.session) {
                    // Seed demo data (invoices/visits)
                    try {
                        await seedDemoData()
                    } catch (seedErr) {
                        console.error('Failed to seed demo data:', seedErr)
                        // Continue anyway
                    }

                    // Successfully logged in, redirect to dashboard
                    // Using i18n router, no need to manually prefix locale
                    router.push('/dashboard')
                } else {
                    setErrorMessage('Failed to create session')
                    setStatus('error')
                }
            } catch (err: any) {
                console.error('Demo login exception:', err)
                setErrorMessage(err.message || 'An unexpected error occurred')
                setStatus('error')
            }
        }

        loginToDemo()
    }, [router])

    if (status === 'error') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Demo Login Failed</CardTitle>
                        <CardDescription>
                            We couldn't log you into the demo account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>
                        <p className="text-sm">
                            Please try{' '}
                            <Link href="/signup" className="text-primary hover:underline">
                                signing up for a free account
                            </Link>{' '}
                            instead.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4">
                        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                    </div>
                    <CardTitle>Loading Demo...</CardTitle>
                    <CardDescription>
                        Setting up your demo environment with sample data
                    </CardDescription>
                </CardHeader>
            </Card>
        </div>
    )
}
