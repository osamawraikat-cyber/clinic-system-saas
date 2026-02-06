import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { ArrowLeft, Printer, Download } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 0

// This component handles the actual printing logic
import { PrintButton } from '@/components/print-button'

export default async function VisitDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()
    const { data: visit, error } = await supabase
        .from('visits')
        .select(`
            *,
            patient:patients(*),
            appointment:appointments(*)
        `)
        .eq('id', id)
        .single()

    if (error || !visit) {
        notFound()
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Action Bar - Hidden during print */}
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-2">
                    <Link href="/visits">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Visits
                        </Button>
                    </Link>
                </div>
                <PrintButton />
            </div>

            {/* Printable Prescription / Visit Record */}
            <Card className="print:shadow-none print:border-0 print:p-0">
                <CardContent className="p-8 space-y-8 print:p-0">

                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-6">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-bold text-emerald-700">ZahiFlow Clinic</h1>
                            <p className="text-sm text-muted-foreground">Excellence in Healthcare Management</p>
                            <p className="text-sm text-muted-foreground">123 Medical Center Dr.</p>
                            <p className="text-sm text-muted-foreground">Tel: +123 456 7890</p>
                        </div>
                        <div className="text-right space-y-1">
                            <h2 className="text-xl font-semibold">Medical Prescription</h2>
                            <p className="text-sm text-muted-foreground">
                                Date: <span className="text-foreground font-medium">{format(new Date(visit.visit_date), 'MMMM dd, yyyy')}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">ID: {visit.id.slice(0, 8)}</p>
                        </div>
                    </div>

                    {/* Patient Information */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Patient Details</h3>
                            <div className="space-y-1">
                                <p><span className="font-medium">Name:</span> {visit.patient?.full_name}</p>
                                <p><span className="font-medium">Phone:</span> {visit.patient?.phone || 'N/A'}</p>
                                <p><span className="font-medium">Gender:</span> {visit.patient?.gender ? visit.patient.gender.charAt(0).toUpperCase() + visit.patient.gender.slice(1) : 'N/A'}</p>
                            </div>
                        </div>
                        {visit.patient?.date_of_birth && (
                            <div>
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Date of Birth</h3>
                                <p>{format(new Date(visit.patient.date_of_birth), 'MMMM dd, yyyy')}</p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Clinical Info */}
                    <div className="grid gap-6">
                        {visit.appointment && (
                            <div className="bg-slate-50 p-4 rounded-md print:bg-transparent print:p-0">
                                <p className="text-sm font-medium">Appointment Visit</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(visit.appointment.appointment_date), 'MMM dd, yyyy')} at {visit.appointment.appointment_time}
                                </p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6 print:grid-cols-1">
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs print:hidden">History</span>
                                    Symptoms
                                </h3>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {visit.symptoms || 'No symptoms recorded.'}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-2 flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs print:hidden">Assessment</span>
                                    Diagnosis
                                </h3>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                    {visit.diagnosis || 'No diagnosis recorded.'}
                                </p>
                            </div>
                        </div>

                        {/* Rx / Notes Section */}
                        <div className="mt-4">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="text-2xl font-serif italic text-emerald-700">Rx</span>
                                <span className="text-base font-semibold text-foreground">Treatment Plan / Notes</span>
                            </h3>
                            <div className="min-h-[200px] border rounded-md p-4 print:border-2 print:border-slate-800 print:min-h-[300px] print:rounded-none">
                                <p className="whitespace-pre-wrap leading-relaxed">
                                    {visit.doctor_notes || 'No notes available.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Signature - Visible mostly in print */}
                    <div className="mt-12 pt-12 flex justify-between items-end print:mt-24">
                        <div className="text-xs text-muted-foreground">
                            <p>Generated by SehaTech</p>
                            <p>{new Date().toLocaleString()}</p>
                        </div>
                        <div className="text-center w-48">
                            <Separator className="mb-2 bg-slate-400" />
                            <p className="font-medium text-sm">Doctor's Signature</p>
                        </div>
                    </div>

                </CardContent>
            </Card>
        </div>
    )
}
