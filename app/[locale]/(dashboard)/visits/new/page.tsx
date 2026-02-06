'use client'

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
import {
    User,
    Calendar,
    Stethoscope,
    ClipboardList,
    Save,
    Clock
} from 'lucide-react'
import { motion } from 'framer-motion'

import { useTranslations } from 'next-intl'

// Zod Schema
const visitSchema = z.object({
    patient_id: z.string().min(1, 'Please select a patient'),
    appointment_id: z.string().optional(),
    visit_date: z.string().min(1, 'Visit date is required'),
    symptoms: z.string().optional(),
    diagnosis: z.string().optional(),
    doctor_notes: z.string().optional()
})

type VisitFormValues = z.infer<typeof visitSchema>

export default function RecordVisitPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const t = useTranslations('Toasts')
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    const [loadingData, setLoadingData] = useState(true)

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<VisitFormValues>({
        resolver: zodResolver(visitSchema),
        defaultValues: {
            patient_id: '',
            appointment_id: '_none',
            visit_date: new Date().toISOString().slice(0, 16),
            symptoms: '',
            diagnosis: '',
            doctor_notes: ''
        }
    })

    const selectedAppointmentId = watch('appointment_id')

    useEffect(() => {
        const loadData = async () => {
            // Load patients
            const { data: patientsData } = await supabase
                .from('patients')
                .select('id, full_name, phone')
                .order('full_name')

            if (patientsData) setPatients(patientsData)

            // Load upcoming appointments
            const { data: appointmentsData } = await supabase
                .from('appointments')
                .select(`
                    id,
                    appointment_date,
                    appointment_time,
                    patients (full_name)
                `)
                .eq('status', 'scheduled')
                .order('appointment_date')

            if (appointmentsData) setAppointments(appointmentsData)
            setLoadingData(false)
        }
        loadData()
    }, [])

    // Side effect: Auto-select patient when appointment changes
    useEffect(() => {
        if (selectedAppointmentId && selectedAppointmentId !== '_none') {
            const appointment = appointments.find(a => a.id === selectedAppointmentId)
            if (appointment) {
                const patient = patients.find(p => p.full_name === appointment.patients?.full_name)
                if (patient) {
                    setValue('patient_id', patient.id)
                }
            }
        }
    }, [selectedAppointmentId, appointments, patients, setValue])

    const onSubmit = async (data: VisitFormValues) => {
        setLoading(true)

        try {
            const visitData = {
                patient_id: data.patient_id,
                appointment_id: (data.appointment_id && data.appointment_id !== '_none') ? data.appointment_id : null,
                visit_date: new Date(data.visit_date).toISOString(),
                symptoms: data.symptoms || null,
                diagnosis: data.diagnosis || null,
                doctor_notes: data.doctor_notes || null
            }

            const { error } = await supabase
                .from('visits')
                .insert([visitData])
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message || t('visits.errorRecord'))
            }

            toast.success(t('visits.successRecord'), {
                description: t('visits.successRecordDesc')
            })

            router.push('/visits')
            router.refresh()
        } catch (error: any) {
            console.error('Visit error:', error)
            toast.error(error.message || t('visits.errorRecord'))
        } finally {
            setLoading(false)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" as const }
        }
    }

    return (
        <motion.div
            className="max-w-6xl mx-auto space-y-8 p-1"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Record Visit</h2>
                    <p className="text-muted-foreground mt-1">Document clinical findings and treatment plans.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Context (Patient & Time) */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-800 dark:text-slate-200">
                                    <User className="h-4 w-4 text-emerald-500" />
                                    Visit Context
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                {/* Appointment Selection */}
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-slate-400">Link to Appointment</Label>
                                    <Select
                                        onValueChange={(val) => setValue('appointment_id', val)}
                                        disabled={loadingData}
                                    >
                                        <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 focus:ring-emerald-500/20">
                                            <SelectValue placeholder="Select appointment..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="_none">No Appointment (Walk-in)</SelectItem>
                                            {appointments.map((apt) => (
                                                <SelectItem key={apt.id} value={apt.id}>
                                                    <span className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-emerald-500" />
                                                        {apt.patients?.full_name}
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Patient Selection */}
                                <div className="space-y-2">
                                    <Label className="text-slate-600 dark:text-slate-400">Patient *</Label>
                                    <Select
                                        onValueChange={(val) => setValue('patient_id', val)}
                                        disabled={loadingData}
                                        value={watch('patient_id')}
                                    >
                                        <SelectTrigger className={`bg-white dark:bg-slate-950 border-slate-200 focus:ring-emerald-500/20 ${errors.patient_id ? 'border-red-500' : ''}`}>
                                            <SelectValue placeholder={loadingData ? "Loading..." : "Select patient"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.id} value={patient.id}>
                                                    {patient.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.patient_id && <p className="text-xs text-red-500">{errors.patient_id.message}</p>}
                                </div>

                                {/* Visit Date/Time */}
                                <div className="space-y-2">
                                    <Label htmlFor="visit_date" className="text-slate-600 dark:text-slate-400">Date & Time *</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="visit_date"
                                            type="datetime-local"
                                            {...register('visit_date')}
                                            className="pl-9 bg-white dark:bg-slate-950 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                    {errors.visit_date && <p className="text-xs text-red-500">{errors.visit_date.message}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions Panel (Mobile: Bottom, Desktop: Sticky Side) */}
                        <div className="hidden lg:block sticky top-6">
                            <Card className="border-emerald-100 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20">
                                <CardContent className="pt-6 space-y-4">
                                    <Button
                                        type="submit"
                                        disabled={loading || loadingData}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20"
                                        size="lg"
                                    >
                                        {loading ? (
                                            <>Recording...</>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" /> Save Record
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => router.back()}
                                        className="w-full text-slate-600 hover:text-slate-900 hover:bg-white/50"
                                    >
                                        Cancel
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Clinical Data */}
                    <div className="lg:col-span-8 space-y-6">
                        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
                            <CardHeader className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
                                    <Stethoscope className="h-5 w-5 text-emerald-600" />
                                    Clinical Assessment
                                </CardTitle>
                                <CardDescription>Enter the patient's symptoms and your diagnosis.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Symptoms */}
                                <div className="space-y-2">
                                    <Label htmlFor="symptoms" className="text-base font-medium text-slate-700 dark:text-slate-300">
                                        Symptoms & Complaints
                                    </Label>
                                    <Textarea
                                        id="symptoms"
                                        placeholder="Patient reports headache, fever..."
                                        {...register('symptoms')}
                                        className="min-h-[120px] bg-slate-50 dark:bg-slate-900 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 resize-y"
                                    />
                                </div>

                                {/* Diagnosis */}
                                <div className="space-y-2">
                                    <Label htmlFor="diagnosis" className="text-base font-medium text-slate-700 dark:text-slate-300">
                                        Diagnosis
                                    </Label>
                                    <Textarea
                                        id="diagnosis"
                                        placeholder="Acute Viral Infection..."
                                        {...register('diagnosis')}
                                        className="min-h-[100px] bg-slate-50 dark:bg-slate-900 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 resize-y"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 dark:border-slate-800 shadow-md">
                            <CardHeader className="bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 pb-4">
                                <CardTitle className="flex items-center gap-2 text-lg text-slate-900 dark:text-white">
                                    <ClipboardList className="h-5 w-5 text-blue-600" />
                                    Treatment Plan & Notes
                                </CardTitle>
                                <CardDescription>Include prescriptions, instructions, and follow-up.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <Textarea
                                    id="doctor_notes"
                                    placeholder="Rx: Paracetamol 500mg..."
                                    {...register('doctor_notes')}
                                    className="min-h-[200px] font-mono text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                                />
                                <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/10 p-3 rounded-md border border-blue-100 dark:border-blue-900/20">
                                    <strong>Tip:</strong> You can write prescriptions directly here. They will be saved as part of the visit record.
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mobile Actions (Visible only on small screens) */}
                        <div className="flex flex-col gap-3 lg:hidden pt-4">
                            <Button
                                type="submit"
                                disabled={loading || loadingData}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                                size="lg"
                            >
                                {loading ? 'Recording...' : 'Save Record'}
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
        </motion.div>
    )
}
