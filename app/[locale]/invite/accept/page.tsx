import { acceptInvitation, getInvitation } from "@/app/actions/invitations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

export const dynamic = 'force-dynamic'

interface AcceptInvitePageProps {
    searchParams: Promise<{ token?: string }>
}

interface InvitationDetails {
    id: string
    clinic_id: string
    clinic_name: string
    email: string
    role: string
    expires_at: string
    status: string
}

export default async function AcceptInvitePage({ searchParams }: AcceptInvitePageProps) {
    const params = await searchParams
    const token = params.token

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Invalid Invitation
                        </CardTitle>
                        <CardDescription>
                            This invitation link is missing a token.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Check if user is logged in
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/en/login?next=/invite/accept?token=${token}`)
    }

    // Validate the invitation
    const { data, error } = await getInvitation(token)

    // Cast data safely knowing the shape from RPC
    const invitation = data as unknown as InvitationDetails

    if (error || !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <XCircle className="h-5 w-5" />
                            Invitation not found
                        </CardTitle>
                        <CardDescription>
                            This invitation is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/">Go Home</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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

                    <form action={async () => {
                        'use server'
                        await acceptInvitation(token)
                        redirect('/en/dashboard')
                    }}>
                        <Button type="submit" className="w-full">
                            Join Team <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <div className="text-center text-xs text-muted-foreground">
                        Logged in as {user.email}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
