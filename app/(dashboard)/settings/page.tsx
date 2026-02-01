'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Save, Loader2, Crown, User, Stethoscope } from 'lucide-react'

interface Clinic {
    id: string
    name: string
    phone: string | null
    address: string | null
    email: string | null
    website: string | null
}

interface ClinicMember {
    id: string
    user_id: string
    role: string
    created_at: string
    user_email?: string
}

export default function SettingsPage() {
    const [clinic, setClinic] = useState<Clinic | null>(null)
    const [members, setMembers] = useState<ClinicMember[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isOwner, setIsOwner] = useState(false)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        loadClinicData()
    }, [])

    const loadClinicData = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get user's clinic membership
            const { data: membership, error: memberError } = await supabase
                .from('clinic_members')
                .select('clinic_id, role')
                .eq('user_id', user.id)
                .single()

            if (memberError) throw memberError
            if (!membership) throw new Error('No clinic membership found')

            setIsOwner(membership.role === 'owner')

            // Get clinic details
            const { data: clinicData, error: clinicError } = await supabase
                .from('clinics')
                .select('*')
                .eq('id', membership.clinic_id)
                .single()

            if (clinicError) throw clinicError
            setClinic(clinicData)

            // Get all clinic members
            const { data: membersData, error: membersError } = await supabase
                .from('clinic_members')
                .select('id, user_id, role, created_at')
                .eq('clinic_id', membership.clinic_id)

            if (membersError) throw membersError

            // Get emails for each member from auth.users (via RPC or direct if allowed)
            // For now, we'll show user_id - in production you'd use a profile table
            setMembers(membersData || [])

        } catch (err: any) {
            console.error('Failed to load clinic data:', err)
            setError(err.message || 'Failed to load clinic data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        if (!clinic) return

        try {
            setIsSaving(true)
            setError(null)
            setSuccess(null)

            const { error: updateError } = await supabase
                .from('clinics')
                .update({
                    name: clinic.name,
                    phone: clinic.phone,
                    address: clinic.address,
                    email: clinic.email,
                    website: clinic.website,
                })
                .eq('id', clinic.id)

            if (updateError) throw updateError

            setSuccess('Clinic settings saved successfully!')
            setTimeout(() => setSuccess(null), 3000)

        } catch (err: any) {
            console.error('Failed to save:', err)
            setError(err.message || 'Failed to save changes')
        } finally {
            setIsSaving(false)
        }
    }

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'owner':
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Crown className="w-3 h-3 mr-1" />Owner</Badge>
            case 'doctor':
                return <Badge className="bg-blue-500 hover:bg-blue-600"><Stethoscope className="w-3 h-3 mr-1" />Doctor</Badge>
            default:
                return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />Staff</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your clinic information and team
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Clinic Profile
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Members
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Clinic Information
                            </CardTitle>
                            <CardDescription>
                                Basic information about your medical practice
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="clinic-name">Clinic Name</Label>
                                    <Input
                                        id="clinic-name"
                                        placeholder="Your Clinic Name"
                                        value={clinic?.name || ''}
                                        onChange={(e) => setClinic(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        disabled={!isOwner}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Contact Phone</Label>
                                    <Input
                                        id="phone"
                                        placeholder="+1 (234) 567-8900"
                                        value={clinic?.phone || ''}
                                        onChange={(e) => setClinic(prev => prev ? { ...prev, phone: e.target.value } : null)}
                                        disabled={!isOwner}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    placeholder="123 Healthcare Avenue, Medical City"
                                    value={clinic?.address || ''}
                                    onChange={(e) => setClinic(prev => prev ? { ...prev, address: e.target.value } : null)}
                                    disabled={!isOwner}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="info@yourclinic.com"
                                        value={clinic?.email || ''}
                                        onChange={(e) => setClinic(prev => prev ? { ...prev, email: e.target.value } : null)}
                                        disabled={!isOwner}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <Input
                                        id="website"
                                        placeholder="www.yourclinic.com"
                                        value={clinic?.website || ''}
                                        onChange={(e) => setClinic(prev => prev ? { ...prev, website: e.target.value } : null)}
                                        disabled={!isOwner}
                                    />
                                </div>
                            </div>

                            {isOwner && (
                                <div className="pt-4">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {!isOwner && (
                                <p className="text-sm text-muted-foreground pt-4">
                                    Only clinic owners can edit these settings.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="team">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Team Members
                            </CardTitle>
                            <CardDescription>
                                People who have access to this clinic
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {members.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        No team members found
                                    </p>
                                ) : (
                                    <div className="divide-y">
                                        {members.map((member) => (
                                            <div key={member.id} className="flex items-center justify-between py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-slate-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {member.user_email || `User ${member.user_id.slice(0, 8)}...`}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Joined {new Date(member.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getRoleBadge(member.role)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {isOwner && (
                                    <div className="pt-4 border-t mt-4">
                                        <p className="text-sm text-muted-foreground mb-3">
                                            To add team members, have them sign up and then add them via the database.
                                            Full invitation system coming in a future update.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
