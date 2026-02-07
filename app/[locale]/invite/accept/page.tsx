'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { getInvitation, acceptInvitation } from "@/app/actions/invitations"
import { toast } from 'sonner'

export const dynamic = 'force-dynamic'

interface InvitationDetails {
    id: string
    clinic_id: string
    clinic_name: string
    email: string
    role: string
    expires_at: string
    status: string
}

function AcceptInviteContent() {
    const { locale } = useParams()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [accepting, setAccepting] = useState(false)

    useEffect(() => {
        if (!token) {
            setError('Missing invitation token')
            setLoading(false)
            return
        }

        const fetchInvitation = async () => {
            try {
                const { data, error } = await getInvitation(token)
                if (error) {
                    setError(error)
                } else if (data) {
                    setInvitation(data as unknown as InvitationDetails)
                } else {
                    setError('Invitation not found')
                }
            } catch (err) {
                console.error(err)
                setError('Failed to load invitation')
            } finally {
                setLoading(false)
            }
        }

        fetchInvitation()
    }, [token])

    const handleAccept = async () => {
        if (!token) return
        setAccepting(true)
        try {
            await acceptInvitation(token)
            toast.success('Invitation accepted!')
            router.push(`/${locale}/dashboard`)
        } catch (err) {
            toast.error('Failed to accept invitation')
            console.error(err)
        } finally {
            setAccepting(false)
        }
    }

    if (loading) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading Invitation...
                    </CardTitle>
                    <CardDescription>Please wait while we check your invite.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    if (!token || error || !invitation) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-destructive flex items-center gap-2">
                        <XCircle className="h-5 w-5" />
                        {error || 'Invalid Invitation'}
                    </CardTitle>
                    <CardDescription>
                        This invitation link is invalid or has expired.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/">Go Home</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    Accept Invitation
                </CardTitle>
                <CardDescription>
                    You have been invited to join <strong>{invitation.clinic_name}</strong> as a <strong>{invitation.role}</strong>.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg text-sm">
                    <p><span className="font-semibold">Email:</span> {invitation.email}</p>
                    <p><span className="font-semibold">Expires:</span> {new Date(invitation.expires_at).toLocaleDateString()}</p>
                </div>

                <Button
                    onClick={handleAccept}
                    className="w-full"
                    disabled={accepting}
                >
                    {accepting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining...
                        </>
                    ) : (
                        <>
                            Join Team <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    )
}

export default function AcceptInvitePage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <AcceptInviteContent />
            </Suspense>
        </div>
    )
}
