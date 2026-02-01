'use client'

import { useState } from 'react'
import { useRouter, Link } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Activity, Mail, ArrowLeft, CheckCircle2, KeyRound, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'

type FlowStep = 'email' | 'code' | 'newPassword' | 'success'

export default function ForgotPasswordPage() {
    const t = useTranslations('ForgotPassword')
    const router = useRouter()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [email, setEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<FlowStep>('email')

    // Step 1: Send OTP code to email
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Request password reset - Supabase will send a 6-digit OTP code
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                // No redirect URL needed for OTP flow
            })

            if (error) {
                throw error
            }

            setStep('code')
            toast.success(t('codeSentTitle'), {
                description: t('codeSentDesc')
            })
        } catch (err: any) {
            console.error('Password reset error:', err)
            toast.error(t('errorTitle'), {
                description: err.message || t('errorDesc')
            })
        } finally {
            setLoading(false)
        }
    }

    // Step 2: Verify OTP code
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otpCode.length !== 6) {
            toast.error(t('invalidCode'))
            return
        }
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: otpCode,
                type: 'recovery',
            })

            if (error) {
                throw error
            }

            setStep('newPassword')
            toast.success(t('codeVerified'))
        } catch (err: any) {
            console.error('OTP verification error:', err)
            toast.error(t('invalidCode'), {
                description: err.message || t('codeExpired')
            })
        } finally {
            setLoading(false)
        }
    }

    // Step 3: Set new password
    const handleSetPassword = async (e: React.FormEvent) => {
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

            setStep('success')
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

    // Success state
    if (step === 'success') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
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
                                {t('backToLogin')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Step 3: Set new password
    if (step === 'newPassword') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
                            <Lock className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">{t('newPasswordTitle')}</CardTitle>
                            <CardDescription className="mt-2">
                                {t('newPasswordSubtitle')}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSetPassword} className="space-y-4">
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
            </div>
        )
    }

    // Step 2: Enter OTP code
    if (step === 'code') {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/30">
                            <KeyRound className="h-8 w-8 text-sky-600 dark:text-sky-400" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold tracking-tight">{t('enterCodeTitle')}</CardTitle>
                            <CardDescription className="mt-2">
                                {t('enterCodeSubtitle')} <span className="font-medium text-foreground">{email}</span>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerifyCode} className="space-y-6">
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(value) => setOtpCode(value)}
                                >
                                    <InputOTPGroup>
                                        <InputOTPSlot index={0} />
                                        <InputOTPSlot index={1} />
                                        <InputOTPSlot index={2} />
                                        <InputOTPSlot index={3} />
                                        <InputOTPSlot index={4} />
                                        <InputOTPSlot index={5} />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading || otpCode.length !== 6}>
                                {loading ? t('verifying') : t('verifyCode')}
                            </Button>
                        </form>

                        <div className="mt-6 space-y-3">
                            <button
                                onClick={() => { setStep('email'); setOtpCode(''); }}
                                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
                            >
                                {t('useAnotherEmail')}
                            </button>
                            <button
                                onClick={handleSendCode}
                                disabled={loading}
                                className="w-full text-center text-sm text-sky-600 hover:text-sky-500 hover:underline"
                            >
                                {t('resendCode')}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Step 1: Enter email
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-white dark:from-slate-900 dark:to-slate-800 p-4">
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
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('emailLabel')}</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t('emailPlaceholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={loading}>
                            {loading ? t('sending') : t('sendCode')}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {t('backToLogin')}
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
