import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { Plus, Stethoscope } from 'lucide-react'

export const revalidate = 0

export default async function ProceduresPage() {
    const { data: procedures, error } = await supabase
        .from('procedures')
        .select('*')
        .order('name')

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Procedures Catalog</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage medical procedures and their default pricing
                    </p>
                </div>
                <Link href="/procedures/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Procedure
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                    Error loading procedures: {error.message}
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        All Procedures
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {!procedures || procedures.length === 0 ? (
                        <div className="text-center py-12">
                            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No procedures found</h3>
                            <p className="text-muted-foreground mb-4">
                                Add your first procedure to build your catalog.
                            </p>
                            <Link href="/procedures/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Procedure
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Procedure Name</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Default Cost</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {procedures.map((procedure: any) => (
                                        <TableRow key={procedure.id}>
                                            <TableCell className="font-medium">{procedure.name}</TableCell>
                                            <TableCell className="max-w-md truncate text-muted-foreground">
                                                {procedure.description || '-'}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                ${Number(procedure.default_cost).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">
                                                    Edit
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
