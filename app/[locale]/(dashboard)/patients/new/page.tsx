'use client'
// Force-refresh: 1
import { revalidatePatientsPath } from '@/actions/revalidate'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { User, Phone, Calendar, Heart, FileText, Save, Info } from 'lucide-react'
import { UpgradeDialog } from '@/components/upgrade-dialog'

import { useTranslations } from 'next-intl'

// Zod Schema
const patientSchema = z.object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(8, 'Phone number must be valid (at least 8 digits)'),
    national_id: z.string().optional(),
    date_of_birth: z.string().optional(),
    gender: z.enum(['Male', 'Female', 'Other']).default('Male'),
    address: z.string().optional(),
    blood_group: z.string().optional(),
    medical_history: z.string().optional(),
    allergies: z.string().optional()
})

type PatientFormValues = z.infer<typeof patientSchema>

export default function AddPatientPage() {
    const t = useTranslations('Toasts')
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [clinicId, setClinicId] = useState<string | null>(null)
    const [showUpgrade, setShowUpgrade] = useState(false)

    // Form Hook
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PatientFormValues>({
        resolver: zodResolver(patientSchema),
        defaultValues: {
            full_name: '',
            phone: '',
            gender: 'Male',
            national_id: '',
            address: '',
            medical_history: '',
            allergies: '',
            blood_group: ''
        }
    })

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    useEffect(() => {
        const getClinicId = async () => {
            try {
                const { data: { session }, error: authError } = await supabase.auth.getSession()
                const user = session?.user

                if (authError || !user) {
                    router.push('/login')
                    return
                }

                const { data: memberData } = await supabase
                    .from('clinic_members')
                    .select('clinic_id')
                    .eq('user_id', user.id)
                    .maybeSingle()

                if (memberData) {
                    setClinicId(memberData.clinic_id)
                }
            } catch (err) {
                console.error(err)
            }
        }
        getClinicId()
    }, [])

    // Check Limit Function
    const checkLimit = async () => {
        const { count } = await supabase
            .from('patients')
            .select('*', { count: 'exact', head: true })
            .eq('clinic_id', clinicId)

        const FREE_LIMIT = 20
        if (count && count >= FREE_LIMIT) {
            return false
        }
        return true
    }

    const onSubmit = async (data: PatientFormValues) => {
        const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@zahiflow.com'
        const { data: { user } } = await supabase.auth.getUser()

        if (user?.email === demoEmail) {
            toast.info('Demo Mode', {
                description: 'You are using a demo account. To save your own patients, please sign up for a free account!'
            })
            return
        }

        setLoading(true)

        try {
            if (!clinicId) throw new Error('Clinic ID not found.')

            // Check Limit
            const canAdd = await checkLimit()
            if (!canAdd) {
                setShowUpgrade(true)
                setLoading(false)
                return
            }

            const cleanedData = {
                clinic_id: clinicId,
                full_name: data.full_name,
                phone: data.phone,
                national_id: data.national_id || null,
                date_of_birth: data.date_of_birth || null,
                gender: data.gender || null,
                address: data.address || null,
                blood_group: data.blood_group && data.blood_group !== 'Unknown' ? data.blood_group : null,
                medical_history: data.medical_history || null,
                allergies: data.allergies || null,
            }

            const { error } = await supabase
                .from('patients')
                .insert([cleanedData])
                .select()

            if (error) throw error

            toast.success(t('patients.successAdd'), {
                description: t('patients.successAddDesc', { name: data.full_name })
            })

            await revalidatePatientsPath()
            router.push('/patients')
            router.refresh()
        } catch (error: any) {
            console.error('Registration error:', error)
            toast.error(error.message || t('patients.errorAdd'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-1">
            <UpgradeDialog
                open={showUpgrade}
                onOpenChange={setShowUpgrade}
                limitType="patient"
            />

            {!clinicId && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    Loading clinic information...
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">New Patient</h2>
                <p className="text-muted-foreground mt-1">Register a new patient to the clinic registry.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Panel: Primary Info */}
                    <div className="lg:col-span-7 space-y-6">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-medium">
                                    <User className="h-4 w-4 text-emerald-600" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input
                                        id="full_name"
                                        placeholder="e.g. John Doe"
                                        {...register('full_name')}
                                        className={errors.full_name ? 'border-red-500' : ''}
                                    />
                                    {errors.full_name && <p className="text-xs text-red-500">{errors.full_name.message}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="phone"
                                                placeholder="+123..."
                                                {...register('phone')}
                                                className={`pl-9 ${errors.phone ? 'border-red-500' : ''}`}
                                            />
                                        </div>
                                        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="national_id">National ID</Label>
                                        <Input
                                            id="national_id"
                                            placeholder="Optional"
                                            {...register('national_id')}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="date_of_birth"
                                                type="date"
                                                {...register('date_of_birth')}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select
                                            onValueChange={(val: any) => setValue('gender', val)}
                                            defaultValue="Male"
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        placeholder="Home address..."
                                        {...register('address')}
                                        className="h-20 resize-none"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel: Medical Info */}
                    <div className="lg:col-span-5 space-y-6">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-medium">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    Medical Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <Label>Blood Group</Label>
                                    <Select
                                        onValueChange={(val) => setValue('blood_group', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select blood group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unknown">Unknown</SelectItem>
                                            <SelectItem value="A+">A+</SelectItem>
                                            <SelectItem value="A-">A-</SelectItem>
                                            <SelectItem value="B+">B+</SelectItem>
                                            <SelectItem value="B-">B-</SelectItem>
                                            <SelectItem value="AB+">AB+</SelectItem>
                                            <SelectItem value="AB-">AB-</SelectItem>
                                            <SelectItem value="O+">O+</SelectItem>
                                            <SelectItem value="O-">O-</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Textarea
                                        id="allergies"
                                        placeholder="Drug or food allergies..."
                                        {...register('allergies')}
                                        className="h-24"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="medical_history">Previous Conditions</Label>
                                    <Textarea
                                        id="medical_history"
                                        placeholder="Chronic conditions, surgeries..."
                                        {...register('medical_history')}
                                        className="h-32"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                disabled={loading || !clinicId}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                                size="lg"
                            >
                                {loading ? 'Registering...' : 'Register Patient'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
