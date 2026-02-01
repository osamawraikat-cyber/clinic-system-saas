'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Activity } from 'lucide-react'

export default function RecordVisitPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [appointments, setAppointments] = useState<any[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [formData, setFormData] = useState({
        patient_id: '',
        appointment_id: '',
        visit_date: new Date().toISOString().slice(0, 16), // datetime-local format
        symptoms: '',
        diagnosis: '',
        doctor_notes: ''
    })

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))

        // If appointment is selected, auto-fill patient
        if (name === 'appointment_id' && value) {
            const appointment = appointments.find(a => a.id === value)
            if (appointment) {
                const patient = patients.find(p => p.full_name === appointment.patients?.full_name)
                if (patient) {
                    setFormData(prev => ({ ...prev, patient_id: patient.id }))
                }
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!formData.patient_id) {
                toast.error('Please select a patient')
                return
            }

            const visitData = {
                patient_id: formData.patient_id,
                appointment_id: formData.appointment_id || null,
                visit_date: new Date(formData.visit_date).toISOString(),
                symptoms: formData.symptoms || null,
                diagnosis: formData.diagnosis || null,
                doctor_notes: formData.doctor_notes || null
            }

            const { error } = await supabase
                .from('visits')
                .insert([visitData])
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message || 'Failed to record visit')
            }

            toast.success('Visit recorded successfully!', {
                description: 'Patient visit has been saved to the system.'
            })

            router.push('/visits')
            router.refresh()
        } catch (error: any) {
            console.error('Visit error:', error)
            toast.error('Failed to record visit', {
                description: error.message || 'An unexpected error occurred.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Record Visit
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Appointment Selection (Optional) */}
                        <div className="space-y-2">
                            <Label>Link to Appointment (Optional)</Label>
                            <Select
                                value={formData.appointment_id}
                                onValueChange={(val) => handleSelectChange('appointment_id', val)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select appointment or skip" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">None - Walk-in</SelectItem>
                                    {appointments.map((apt) => (
                                        <SelectItem key={apt.id} value={apt.id}>
                                            {apt.patients?.full_name} - {new Date(apt.appointment_date).toLocaleDateString()} {apt.appointment_time}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Patient Selection */}
                        <div className="space-y-2">
                            <Label>Patient *</Label>
                            <Select
                                value={formData.patient_id}
                                onValueChange={(val) => handleSelectChange('patient_id', val)}
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingData ? "Loading..." : "Select patient"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            {patient.full_name} - {patient.phone}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Visit Date/Time */}
                        <div className="space-y-2">
                            <Label htmlFor="visit_date">Visit Date & Time *</Label>
                            <Input
                                id="visit_date"
                                name="visit_date"
                                type="datetime-local"
                                required
                                value={formData.visit_date}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Symptoms */}
                        <div className="space-y-2">
                            <Label htmlFor="symptoms">Symptoms</Label>
                            <Textarea
                                id="symptoms"
                                name="symptoms"
                                value={formData.symptoms}
                                onChange={handleChange}
                                placeholder="Describe the patient's symptoms..."
                                className="h-24"
                            />
                        </div>

                        {/* Diagnosis */}
                        <div className="space-y-2">
                            <Label htmlFor="diagnosis">Diagnosis</Label>
                            <Textarea
                                id="diagnosis"
                                name="diagnosis"
                                value={formData.diagnosis}
                                onChange={handleChange}
                                placeholder="Enter diagnosis..."
                                className="h-24"
                            />
                        </div>

                        {/* Doctor Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="doctor_notes">Doctor's Notes</Label>
                            <Textarea
                                id="doctor_notes"
                                name="doctor_notes"
                                value={formData.doctor_notes}
                                onChange={handleChange}
                                placeholder="Treatment plan, prescriptions, follow-up instructions..."
                                className="h-32"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || loadingData}>
                                {loading ? 'Recording...' : 'Record Visit'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
