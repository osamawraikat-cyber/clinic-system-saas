'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Stethoscope } from 'lucide-react'

export default function AddProcedurePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        default_cost: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!formData.name || !formData.default_cost) {
                toast.error('Missing required fields', {
                    description: 'Please fill in procedure name and cost'
                })
                return
            }

            const cost = parseFloat(formData.default_cost)
            if (isNaN(cost) || cost <= 0) {
                toast.error('Invalid cost', {
                    description: 'Please enter a valid cost amount'
                })
                return
            }

            const procedureData = {
                name: formData.name,
                description: formData.description || null,
                default_cost: cost
            }

            const { error } = await supabase
                .from('procedures')
                .insert([procedureData])
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message || 'Failed to add procedure')
            }

            toast.success('Procedure added successfully!', {
                description: `${formData.name} has been added to the catalog`
            })

            router.push('/procedures')
            router.refresh()
        } catch (error: any) {
            console.error('Procedure error:', error)
            toast.error('Failed to add procedure', {
                description: error.message || 'An unexpected error occurred'
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
                        <Stethoscope className="h-5 w-5" />
                        Add New Procedure
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Procedure Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., General Consultation, X-Ray, Blood Test"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="default_cost">Default Cost *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                                <Input
                                    id="default_cost"
                                    name="default_cost"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    required
                                    value={formData.default_cost}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    className="pl-7"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">
                                This is the default price, but can be adjusted per visit
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Additional details about this procedure..."
                                className="h-24"
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Procedure'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
