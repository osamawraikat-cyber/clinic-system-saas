import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 0

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const { data: patient, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !patient) {
        return <div className="text-red-500">Patient not found</div>
    }

    return (
        <div className="space-y-4">
            <Link href="/patients">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
                </Button>
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle>{patient.full_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Phone</p>
                            <p>{patient.phone}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">National ID</p>
                            <p>{patient.national_id || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                            <p>{patient.date_of_birth || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Gender</p>
                            <p>{patient.gender || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Blood Group</p>
                            <p>{patient.blood_group || '-'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Address</p>
                            <p>{patient.address || '-'}</p>
                        </div>
                    </div>

                    {patient.medical_history && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Medical History</p>
                            <p className="mt-1">{patient.medical_history}</p>
                        </div>
                    )}

                    {patient.allergies && (
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Allergies</p>
                            <p className="mt-1">{patient.allergies}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
