'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AuthCallbackPage() {
    const router = useRouter()

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                router.push('/dashboard')
                router.refresh()
            }
        })
    }, [router])

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    )
}
