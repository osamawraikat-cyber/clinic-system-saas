import { supabase } from '@/lib/supabase'
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

// This is a server component so we can fetch data directly
// Use force-dynamic to ensure we alway get the latest list
export const dynamic = 'force-dynamic'

export default async function PatientsPage() {
    const { data: patients, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false })

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
                                <TableHead>Actions</TableHead>
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
                                        <TableCell>
                                            <Link href={`/patients/${patient.id}`}>
                                                <Button variant="outline" size="sm">View</Button>
                                            </Link>
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
