'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Save, Loader2, Crown, User, Stethoscope } from 'lucide-react'

import { InviteGuide } from '@/components/team/invite-guide'
import { InviteMemberDialog } from '@/components/team/invite-member-dialog'
import { InvitationsList } from '@/components/team/invitations-list'
import { currencies } from '@/hooks/use-currency'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Clinic {
    id: string
    name: string
    phone: string | null
    address: string | null
    email: string | null
    website: string | null
    currency: string
}

interface ClinicMember {
    id: string
    user_id: string
    role: string
    created_at: string
    user_email?: string
}

interface Invitation {
    id: string
    email: string
    role: string
    status: string
    created_at: string
    expires_at: string
}

export default function SettingsPage() {
    const [clinic, setClinic] = useState<Clinic | null>(null)
    const [members, setMembers] = useState<ClinicMember[]>([])
    const [invitations, setInvitations] = useState<Invitation[]>([])
    const [memberLimit, setMemberLimit] = useState<number>(1) // Default to starter limit
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isOwner, setIsOwner] = useState(false)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const t = useTranslations('Settings')

    useEffect(() => {
        loadClinicData()
    }, [])

    // ... (keep existing helper functions)

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

            // Get pending invitations
            const { data: invitationsData, error: invitationsError } = await supabase
                .from('clinic_invitations')
                .select('*')
                .eq('clinic_id', membership.clinic_id)
                .in('status', ['pending'])
                .order('created_at', { ascending: false })

            if (invitationsError) {
                console.error('Error fetching invitations:', invitationsError)
            } else {
                setInvitations(invitationsData || [])
            }

            // Get member limit
            const { data: limitData } = await supabase.rpc('get_member_limit', { p_clinic_id: membership.clinic_id })
            if (limitData !== null) {
                setMemberLimit(limitData)
            }

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
                    currency: clinic.currency,
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
                return <Badge className="bg-amber-500 hover:bg-amber-600"><Crown className="w-3 h-3 mr-1" />{t('team.roles.owner')}</Badge>
            case 'doctor':
                return <Badge className="bg-blue-500 hover:bg-blue-600"><Stethoscope className="w-3 h-3 mr-1" />{t('team.roles.doctor')}</Badge>
            default:
                return <Badge variant="secondary"><User className="w-3 h-3 mr-1" />{t('team.roles.staff')}</Badge>
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
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                <p className="text-muted-foreground mt-1">
                    {t('subtitle')}
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                    <AlertDescription>{t('profile.success')}</AlertDescription>
                </Alert>
            )}

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {t('tabs.profile')}
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {t('tabs.team')}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                {t('profile.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('profile.description')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="clinic-name">{t('profile.name')}</Label>
                                    <Input
                                        id="clinic-name"
                                        placeholder="Your Clinic Name"
                                        value={clinic?.name || ''}
                                        onChange={(e) => setClinic(prev => prev ? { ...prev, name: e.target.value } : null)}
                                        disabled={!isOwner}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">{t('profile.phone')}</Label>
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
                                <Label htmlFor="address">{t('profile.address')}</Label>
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
                                    <Label htmlFor="email">{t('profile.email')}</Label>
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
                                    <Label htmlFor="website">{t('profile.website')}</Label>
                                    <Input
                                        id="website"
                                        placeholder="www.yourclinic.com"
                                        value={clinic?.website || ''}
                                        onChange={(e) => setClinic(prev => prev ? { ...prev, website: e.target.value } : null)}
                                        disabled={!isOwner}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="currency">{t('profile.currency')}</Label>
                                <Select
                                    value={clinic?.currency || 'USD'}
                                    onValueChange={(val) => setClinic(prev => prev ? { ...prev, currency: val } : null)}
                                    disabled={!isOwner}
                                >
                                    <SelectTrigger className="w-full md:w-[240px]">
                                        <SelectValue placeholder={t('profile.currencyPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {currencies.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.code} - {c.name} ({c.symbol})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    {t('profile.currencyDesc')}
                                </p>
                            </div>

                            {isOwner && (
                                <div className="pt-4">
                                    <Button onClick={handleSave} disabled={isSaving}>
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t('profile.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                {t('profile.save')}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {!isOwner && (
                                <p className="text-sm text-muted-foreground pt-4">
                                    {t('profile.ownerOnly')}
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
                                {t('team.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('team.description')}
                            </CardDescription>

                            {/* Member Limit Progress */}
                            <div className="pt-2">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">{t('team.usage')}</span>
                                    <span className="font-medium text-emerald-600">
                                        {members.length + invitations.length} / {memberLimit === -1 ? '∞' : memberLimit} {t('team.members')}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{
                                            width: memberLimit === -1
                                                ? '5%'
                                                : `${Math.min(((members.length + invitations.length) / memberLimit) * 100, 100)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {members.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">
                                        {t('team.noMembers')}
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
                                    <div className="pt-4 border-t mt-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium">{t('team.pendingTitle')}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {t('team.pendingDesc')}
                                                </p>
                                            </div>
                                            {clinic && <InviteMemberDialog clinicId={clinic.id} />}
                                        </div>
                                        <InvitationsList invitations={invitations} />

                                        <div className="pt-4">
                                            <InviteGuide />
                                        </div>
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
