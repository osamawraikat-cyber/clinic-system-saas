import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Activity, Plus, Calendar } from 'lucide-react'

export const revalidate = 0

export default async function VisitsPage() {
    const { data: visits, error } = await supabase
        .from('visits')
        .select(`
            *,
            patients (
                full_name,
                phone
            ),
            appointments (
                appointment_date,
                appointment_time
            )
        `)
        .order('visit_date', { ascending: false })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Visits</h2>
                    <p className="text-muted-foreground mt-1">
                        Record and manage patient consultations
                    </p>
                </div>
                <Link href="/visits/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Record Visit
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                    Error loading visits: {error.message}
                </div>
            )}

            {!visits || visits.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12">
                        <div className="text-center">
                            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No visits recorded</h3>
                            <p className="text-muted-foreground mb-4">
                                Start recording patient visits to track consultations.
                            </p>
                            <Link href="/visits/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Record Visit
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {visits.map((visit: any) => (
                        <Card key={visit.id} className="transition-all hover:shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">
                                            {visit.patients?.full_name || 'Unknown Patient'}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(visit.visit_date).toLocaleString()}
                                        </div>
                                    </div>
                                    {visit.appointments && (
                                        <Badge variant="secondary">
                                            Appointment-based
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {visit.symptoms && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Symptoms</p>
                                        <p className="text-sm line-clamp-2">{visit.symptoms}</p>
                                    </div>
                                )}
                                {visit.diagnosis && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Diagnosis</p>
                                        <p className="text-sm line-clamp-2">{visit.diagnosis}</p>
                                    </div>
                                )}
                                {visit.doctor_notes && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Doctor's Notes</p>
                                        <p className="text-sm line-clamp-1 text-muted-foreground">
                                            {visit.doctor_notes}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
