'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Activity, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()

    // Create a Supabase client for the browser with cookie handling
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Debugging env vars
    console.log("Login Env Check:", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        keyLength: supabaseAnonKey?.length
    })

    const supabase = createBrowserClient(
        supabaseUrl!,
        supabaseAnonKey!
    )

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            toast.success('Welcome back!', {
                description: 'Successfully signed in to SehaTech'
            })

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            console.error('Login error:', err)
            toast.error('Login failed', {
                description: err.message || 'Invalid email or password'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-4 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <Activity className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-bold tracking-tight">SehaTech</CardTitle>
                        <CardDescription className="mt-2">
                            Sign in to access the management system
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="doctor@sehatech.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Link href="/forgot-password" className="text-sm text-sky-600 hover:text-sky-500 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>


                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link href="/signup" className="font-semibold text-emerald-600 hover:text-emerald-500">
                            Sign up
                        </Link>
                    </div>

                    <div className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                        <p className="font-medium">Demo Credentials:</p>
                        <p className="mt-1">Create a user in Supabase Auth to test login</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
