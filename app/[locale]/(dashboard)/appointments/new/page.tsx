'use client'

import { useState } from 'react'
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
import { CalendarIcon } from 'lucide-react'

export default function ScheduleAppointmentPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [loadingPatients, setLoadingPatients] = useState(true)
    const [formData, setFormData] = useState({
        patient_id: '',
        appointment_date: '',
        appointment_time: '',
        reason: '',
        status: 'scheduled'
    })

    // Load patients on component mount
    useState(() => {
        const loadPatients = async () => {
            const { data, error } = await supabase
                .from('patients')
                .select('id, full_name, phone')
                .order('full_name')

            if (!error && data) {
                setPatients(data)
            }
            setLoadingPatients(false)
        }
        loadPatients()
    })

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
            // Validate required fields
            if (!formData.patient_id || !formData.appointment_date || !formData.appointment_time) {
                toast.error('Missing required fields', {
                    description: 'Please fill in patient, date, and time.'
                })
                return
            }

            const appointmentData = {
                patient_id: formData.patient_id,
                appointment_date: formData.appointment_date,
                appointment_time: formData.appointment_time,
                reason: formData.reason || null,
                status: formData.status
            }

            const { data, error } = await supabase
                .from('appointments')
                .insert([appointmentData])
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message || 'Failed to schedule appointment')
            }

            toast.success('Appointment scheduled successfully!', {
                description: `Appointment on ${formData.appointment_date} at ${formData.appointment_time}`
            })

            router.push('/appointments')
            router.refresh()
        } catch (error: any) {
            console.error('Scheduling error:', error)
            toast.error('Failed to schedule appointment', {
                description: error.message || 'An unexpected error occurred. Please try again.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Schedule Appointment
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Patient Selection */}
                        <div className="space-y-2">
                            <Label>Patient *</Label>
                            <Select
                                value={formData.patient_id}
                                onValueChange={(val) => handleSelectChange('patient_id', val)}
                                disabled={loadingPatients}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select patient"} />
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

                        {/* Date and Time */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="appointment_date">Date *</Label>
                                <Input
                                    id="appointment_date"
                                    name="appointment_date"
                                    type="date"
                                    required
                                    value={formData.appointment_date}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="appointment_time">Time *</Label>
                                <Input
                                    id="appointment_time"
                                    name="appointment_time"
                                    type="time"
                                    required
                                    value={formData.appointment_time}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(val) => handleSelectChange('status', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Reason */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Visit</Label>
                            <Textarea
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="e.g., Regular checkup, follow-up, symptoms..."
                                className="h-24"
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
                            <Button type="submit" disabled={loading || loadingPatients}>
                                {loading ? 'Scheduling...' : 'Schedule Appointment'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
