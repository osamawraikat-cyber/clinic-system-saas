import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, Plus, Phone } from 'lucide-react'

export const revalidate = 0

export default async function AppointmentsPage() {
    const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
      *,
      patients (
        full_name,
        phone
      )
    `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
            scheduled: 'default',
            completed: 'secondary',
            cancelled: 'destructive'
        }
        return variants[status] || 'default'
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
                    <p className="text-muted-foreground mt-1">
                        Manage patient appointments and schedules
                    </p>
                </div>
                <Link href="/appointments/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule Appointment
                    </Button>
                </Link>
            </div>

            {error && (
                <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg">
                    Error loading appointments: {error.message}
                </div>
            )}

            {!appointments || appointments.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12">
                        <div className="text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No appointments scheduled</h3>
                            <p className="text-muted-foreground mb-4">
                                Schedule your first appointment to get started.
                            </p>
                            <Link href="/appointments/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Schedule Appointment
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appointment: any) => (
                        <Card key={appointment.id} className="transition-all hover:shadow-md">
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">
                                            {appointment.patients?.full_name || 'Unknown Patient'}
                                        </CardTitle>
                                        {appointment.patients?.phone && (
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                <Phone className="h-3 w-3" />
                                                {appointment.patients.phone}
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant={getStatusBadge(appointment.status)}>
                                        {appointment.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Date</p>
                                        <p className="font-medium">{new Date(appointment.appointment_date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Time</p>
                                        <p className="font-medium">{appointment.appointment_time}</p>
                                    </div>
                                    <div className="col-span-2 md:col-span-1">
                                        <p className="text-sm font-medium text-muted-foreground">Reason</p>
                                        <p className="line-clamp-1">{appointment.reason || '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
