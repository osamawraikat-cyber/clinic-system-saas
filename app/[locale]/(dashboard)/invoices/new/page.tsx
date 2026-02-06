'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
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
import { Receipt, Plus, X } from 'lucide-react'

type LineItem = {
    description: string
    quantity: number
    unit_price: number
}

export default function CreateInvoicePage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [patients, setPatients] = useState<any[]>([])
    const [visits, setVisits] = useState<any[]>([])
    const [procedures, setProcedures] = useState<any[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [formData, setFormData] = useState({
        patient_id: '',
        visit_id: '',
        notes: ''
    })
    const [lineItems, setLineItems] = useState<LineItem[]>([
        { description: '', quantity: 1, unit_price: 0 }
    ])

    useEffect(() => {
        const loadData = async () => {
            const { data: patientsData } = await supabase
                .from('patients')
                .select('id, full_name')
                .order('full_name')

            if (patientsData) setPatients(patientsData)

            const { data: proceduresData } = await supabase
                .from('procedures')
                .select('id, name, default_cost')
                .order('name')

            if (proceduresData) setProcedures(proceduresData)

            setLoadingData(false)
        }
        loadData()
    }, [])

    useEffect(() => {
        if (formData.patient_id) {
            const loadVisits = async () => {
                const { data } = await supabase
                    .from('visits')
                    .select('id, visit_date, symptoms')
                    .eq('patient_id', formData.patient_id)
                    .order('visit_date', { ascending: false })

                if (data) setVisits(data)
            }
            loadVisits()
        }
    }, [formData.patient_id])

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const addLineItem = () => {
        setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
    }

    const removeLineItem = (index: number) => {
        if (lineItems.length > 1) {
            setLineItems(lineItems.filter((_, i) => i !== index))
        }
    }

    const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
        const updated = [...lineItems]
        updated[index] = { ...updated[index], [field]: value }
        setLineItems(updated)
    }

    const handleProcedureSelect = (index: number, procedureId: string) => {
        const procedure = procedures.find(p => p.id === procedureId)
        if (procedure) {
            updateLineItem(index, 'description', procedure.name)
            updateLineItem(index, 'unit_price', procedure.default_cost)
        }
    }



    const calculateTotal = () => {
        return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
    }

    const generateInvoiceNumber = () => {
        const date = new Date()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
        return `INV-${year}${month}-${random}`
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!formData.patient_id) {
                toast.error('Please select a patient')
                return
            }

            const total_amount = calculateTotal()
            if (total_amount <= 0) {
                toast.error('Please add at least one line item with a price')
                return
            }

            const invoiceData = {
                patient_id: formData.patient_id,
                visit_id: formData.visit_id || null,
                invoice_number: generateInvoiceNumber(),
                total_amount,
                amount_paid: 0,
                status: 'unpaid',
                notes: formData.notes || null,
                line_items: lineItems
            }

            const { data, error } = await supabase
                .from('invoices')
                .insert([invoiceData])
                .select()

            if (error) {
                console.error('Supabase error:', error)
                throw new Error(error.message || 'Failed to create invoice')
            }

            toast.success('Invoice created successfully!', {
                description: `Invoice ${invoiceData.invoice_number} has been created.`
            })

            router.push('/invoices')
            router.refresh()
        } catch (error: any) {
            console.error('Invoice error:', error)
            toast.error('Failed to create invoice', {
                description: error.message || 'An unexpected error occurred.'
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5" />
                        Create Invoice
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
                                disabled={loadingData}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem key={patient.id} value={patient.id}>
                                            {patient.full_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Visit Selection (Optional) */}
                        {visits.length > 0 && (
                            <div className="space-y-2">
                                <Label>Link to Visit (Optional)</Label>
                                <Select
                                    value={formData.visit_id || '_none'}
                                    onValueChange={(val) => handleSelectChange('visit_id', val === '_none' ? '' : val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select visit or skip" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="_none">None</SelectItem>
                                        {visits.map((visit) => (
                                            <SelectItem key={visit.id} value={visit.id}>
                                                {new Date(visit.visit_date).toLocaleDateString()} - {visit.symptoms?.substring(0, 30) || 'No symptoms'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Line Items */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label>Line Items</Label>
                                <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Item
                                </Button>
                            </div>

                            {lineItems.map((item, index) => (
                                <Card key={index} className="p-4">
                                    <div className="grid grid-cols-12 gap-3">
                                        <div className="col-span-12 md:col-span-4">
                                            {/* Procedure Select - Helper */}
                                            <Select onValueChange={(val) => {
                                                const procedure = procedures.find(p => p.id === val)
                                                if (procedure) {
                                                    updateLineItem(index, 'description', procedure.name)
                                                    updateLineItem(index, 'unit_price', procedure.default_cost)
                                                }
                                            }}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Procedure..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {procedures.map((proc) => (
                                                        <SelectItem key={proc.id} value={proc.id}>
                                                            {proc.name} - ${proc.default_cost}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="col-span-12 md:col-span-3">
                                            <Input
                                                placeholder="Description"
                                                value={item.description}
                                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="Qty"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-6 md:col-span-2">
                                            <Input
                                                type="number"
                                                placeholder="Price"
                                                step="0.01"
                                                min="0"
                                                value={item.unit_price}
                                                onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                                required
                                            />
                                        </div>
                                        <div className="col-span-12 md:col-span-1 flex items-center justify-end">
                                            {lineItems.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeLineItem(index)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 text-right text-sm text-muted-foreground">
                                        Subtotal: ${(item.quantity * item.unit_price).toFixed(2)}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-end">
                            <div className="text-right space-y-1">
                                <div className="text-2xl font-bold">
                                    Total: ${calculateTotal().toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Payment terms, additional information..."
                                className="h-20"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || loadingData}>
                                {loading ? 'Creating...' : 'Create Invoice'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
