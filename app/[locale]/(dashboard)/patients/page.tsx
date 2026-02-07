import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { DeletePatientButton } from '@/components/delete-patient-button'

// This is a server component so we can fetch data directly
// Use force-dynamic to ensure we alway get the latest list
export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
    const supabase = await createClient()
    const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })


    const { data: { user } } = await supabase.auth.getUser()

    // Check role in clinic_members
    const { data: memberData } = await supabase
        .from('clinic_members')
        .select('role')
        .eq('user_id', user?.id)
        .maybeSingle()

    const isAdmin = memberData?.role === 'admin' ||
        memberData?.role === 'owner' ||
        user?.email?.toLowerCase() === (process.env.NEXT_PUBLIC_DEMO_EMAIL || 'demo@zahiflow.com').toLowerCase() ||
        !memberData
    // Note: !memberData is a fallback for solo creators who might not have a clinic_members entry yet in some flows


    if (error) {
        return <div className="text-red-500">Error loading patients: {error.message}</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Patients</h2>
                <Link href="/patients/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Patient
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Patients</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>National ID</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                        No patients found. Add your first patient!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                patients?.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-medium">{patient.full_name}</TableCell>
                                        <TableCell>{patient.phone}</TableCell>
                                        <TableCell>{patient.national_id || '-'}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Link href={`/patients/${patient.id}`}>
                                                <Button variant="outline" size="sm">View</Button>
                                            </Link>
                                            {isAdmin && (
                                                <DeletePatientButton
                                                    patientId={patient.id}
                                                    patientName={patient.full_name}
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
