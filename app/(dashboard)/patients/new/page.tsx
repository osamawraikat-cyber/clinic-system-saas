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

export default function AddPatientPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
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
            // Clean the data: convert empty strings to null for optional fields
            const cleanedData = {
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
        <div className="max-w-3xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Register New Patient</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        required
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="e.g. John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. +254 700 000000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="national_id">National ID / Passport</Label>
                                    <Input
                                        id="national_id"
                                        name="national_id"
                                        value={formData.national_id}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                                    <Input
                                        id="date_of_birth"
                                        name="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(val) => handleSelectChange('gender', val)}
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
                                <div className="space-y-2">
                                    <Label>Blood Group</Label>
                                    <Select
                                        value={formData.blood_group}
                                        onValueChange={(val) => handleSelectChange('blood_group', val)}
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
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Home address, street, city..."
                                className="h-20"
                            />
                        </div>

                        {/* Medical Bio */}
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-4 mt-6">Medical History</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="medical_history">Previous Conditions / History</Label>
                                    <Textarea
                                        id="medical_history"
                                        name="medical_history"
                                        value={formData.medical_history}
                                        onChange={handleChange}
                                        placeholder="e.g. Diabetes, Hypertension, surgery in 2020..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="allergies">Allergies</Label>
                                    <Textarea
                                        id="allergies"
                                        name="allergies"
                                        value={formData.allergies}
                                        onChange={handleChange}
                                        placeholder="e.g. Penicillin, Peanuts..."
                                        className="h-20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <Button type="button" variant="outline" onClick={() => router.back()} className="mr-2">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : 'Register Patient'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
