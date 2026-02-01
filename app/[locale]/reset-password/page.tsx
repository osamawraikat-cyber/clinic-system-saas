'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Activity, Lock, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

function ResetPasswordContent() {
    const t = useTranslations('ResetPassword')
    const router = useRouter()
    const searchParams = useSearchParams()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Check for error in URL params
        const urlError = searchParams.get('error')
        if (urlError) {
            setError(urlError)
            setChecking(false)
            return
        }

        // Check if we have a valid session from the reset link
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setError(t('invalidLink'))
            }
            setChecking(false)
        }
        checkSession()
    }, [supabase, t, searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            toast.error(t('passwordMismatch'))
            return
        }

        if (password.length < 6) {
            toast.error(t('passwordTooShort'))
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) {
                throw error
            }

            setSuccess(true)
            toast.success(t('successTitle'), {
                description: t('successDesc')
            })

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            console.error('Password update error:', err)
            toast.error(t('errorTitle'), {
                description: err.message || t('errorDesc')
            })
        } finally {
            setLoading(false)
        }
    }

    if (error) {
        return (
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                        <Lock className="h-8 w-8 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">{t('invalidLinkTitle')}</CardTitle>
                        <CardDescription className="mt-2">
                            {error}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Link href="/forgot-password">
                        <Button className="w-full">
                            {t('requestNewLink')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    if (success) {
        return (
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold tracking-tight">{t('successTitle')}</CardTitle>
                        <CardDescription className="mt-2">
                            {t('redirecting')}
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Link href="/login">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('goToLogin')}
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
                    <Activity className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">{t('title')}</CardTitle>
                    <CardDescription className="mt-2">
                        {t('subtitle')}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">{t('newPassword')}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
                        {loading ? t('updating') : t('updatePassword')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}

function ResetPasswordLoading() {
    return (
        <Card className="w-full max-w-md shadow-lg">
            <CardHeader className="space-y-4 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
                <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Loading...</CardTitle>
                </div>
            </CardHeader>
        </Card>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
            <Suspense fallback={<ResetPasswordLoading />}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    )
}
