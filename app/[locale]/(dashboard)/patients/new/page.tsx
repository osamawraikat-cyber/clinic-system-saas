'use client'
// Force-refresh: 1
import { revalidatePatientsPath } from '@/actions/revalidate'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { createBrowserClient } from '@supabase/ssr'
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

export default function AddPatientPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [clinicId, setClinicId] = useState<string | null>(null)

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [formData, setFormData] = useState({
        full_name: '',
        national_id: '',
        phone: '',
        date_of_birth: '',
        gender: 'Male',
        address: '',
        blood_group: '',
        medical_history: '',
        allergies: ''
    })

    useEffect(() => {
        const getClinicId = async () => {
            try {
                const { data: { session }, error: authError } = await supabase.auth.getSession()
                const user = session?.user

                if (authError || !user) {
                    console.log('Session check failed:', authError)
                    router.push('/login')
                    return
                }

                const { data: memberData, error: memberError } = await supabase
                    .from('clinic_members')
                    .select('clinic_id')
                    .eq('user_id', user.id)
                    .maybeSingle()

                if (memberError) {
                    console.error('Error fetching clinic member:', memberError)
                } else if (memberData) {
                    setClinicId(memberData.clinic_id)
                } else {
                    console.error('No clinic membership found')
                }
            } catch (err: any) {
                // Suppress "Auth session missing" error as it just means we need to redirect
                if (err?.message?.includes('Auth session missing') || err?.name === 'AuthSessionMissingError') {
                    console.log('Session missing, redirecting to login...')
                } else {
                    console.error('Exception fetching clinic:', err)
                }
                router.push('/login')
            }
        }
        getClinicId()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!clinicId) {
                throw new Error('Clinic ID not found. Please try refreshing the page.')
            }

            // Clean the data: convert empty strings to null for optional fields
            const cleanedData = {
                clinic_id: clinicId, // Explicitly include clinic_id
                full_name: formData.full_name,
                phone: formData.phone,
                national_id: formData.national_id || null,
                date_of_birth: formData.date_of_birth || null,
                gender: formData.gender || null,
                address: formData.address || null,
                blood_group: formData.blood_group || null,
                medical_history: formData.medical_history || null,
                allergies: formData.allergies || null,
            }

            const { data, error } = await supabase
                .from('patients')
                .insert([cleanedData])
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message || 'Failed to register patient')
            }

            // Success!
            toast.success('Patient registered successfully!', {
                description: `${formData.full_name} has been added to the system.`
            })

            await revalidatePatientsPath() // Clear cache
            router.push('/patients')
            router.refresh()
        } catch (error: any) {
            console.error('Registration error:', error)
            toast.error('Failed to register patient', {
                description: error.message || 'An unexpected error occurred. Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-1">
            {/* Loading State */}
            {!clinicId && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
                    Loading clinic information...
                </div>
            )}

            <div className="mb-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">New Patient</h2>
                <p className="text-muted-foreground mt-1">Register a new patient to the clinic registry.</p>
            </div>

            <form onSubmit={handleSubmit}>
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
                                        name="full_name"
                                        required
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="e.g. John Doe"
                                        className="bg-white dark:bg-slate-950"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <Input
                                                id="phone"
                                                name="phone"
                                                required
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+123..."
                                                className="pl-9 bg-white dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="national_id">National ID</Label>
                                        <Input
                                            id="national_id"
                                            name="national_id"
                                            value={formData.national_id}
                                            onChange={handleChange}
                                            placeholder="Optional"
                                            className="bg-white dark:bg-slate-950"
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
                                                name="date_of_birth"
                                                type="date"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                                className="pl-9 bg-white dark:bg-slate-950"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(val) => handleSelectChange('gender', val)}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-slate-950">
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
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Home address..."
                                        className="h-20 bg-white dark:bg-slate-950 resize-none"
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
                                        value={formData.blood_group}
                                        onValueChange={(val) => handleSelectChange('blood_group', val)}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-slate-950">
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
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleChange}
                                        placeholder="Drug or food allergies..."
                                        className="h-24 bg-white dark:bg-slate-950"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="medical_history">Previous Conditions</Label>
                                    <Textarea
                                        id="medical_history"
                                        name="medical_history"
                                        value={formData.medical_history}
                                        onChange={handleChange}
                                        placeholder="Chronic conditions, surgeries..."
                                        className="h-32 bg-white dark:bg-slate-950"
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
                            {!clinicId && (
                                <div className="mt-2 p-3 bg-amber-50 text-amber-800 text-sm rounded-md border border-amber-200">
                                    Loading clinic information...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    )
}
