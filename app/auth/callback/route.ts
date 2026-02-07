import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') ?? '/en/dashboard'
    const error = requestUrl.searchParams.get('error')
    const error_description = requestUrl.searchParams.get('error_description')

    // Handle errors from Supabase
    if (error) {
        // Redirect to forgot-password with error message
        return NextResponse.redirect(
            new URL(`/en/forgot-password?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
        )
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Server component - cookies are read-only
                    }
                },
            },
        }
    )

    // Handle PKCE code exchange (for OAuth and magic links)
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(new URL(next, requestUrl.origin))
        }
    }

    // Handle token hash verification (for password reset and email confirmation)
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
        })

        if (!error) {
            // For password recovery, redirect to reset-password page
            if (type === 'recovery') {
                return NextResponse.redirect(new URL('/en/reset-password', requestUrl.origin))
            }
            // For email confirmation, redirect to dashboard
            return NextResponse.redirect(new URL(next, requestUrl.origin))
        } else {
            // Token verification failed - redirect with error
            return NextResponse.redirect(
                new URL(`/en/forgot-password?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
            )
        }
    }

    // If no code or token_hash, redirect to home
    return NextResponse.redirect(new URL('/', requestUrl.origin))
}
