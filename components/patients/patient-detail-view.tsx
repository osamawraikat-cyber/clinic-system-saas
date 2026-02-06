'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { format } from 'date-fns'
import Link from 'next/link'
import {
    Calendar,
    FileText,
    CreditCard,
    Activity,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    Printer,
    Edit
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface PatientDetailViewProps {
    patient: any
    visits: any[]
    appointments: any[]
    invoices: any[]
}

export function PatientDetailView({ patient, visits, appointments, invoices }: PatientDetailViewProps) {
    const t = useTranslations('Common')

    // Calculate Financials
    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.total_amount), 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.amount_paid), 0)
    const balance = totalInvoiced - totalPaid

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{visits.length}</div>
                        <p className="text-xs text-muted-foreground">Recorded visits</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{appointments.length}</div>
                        <p className="text-xs text-muted-foreground">Scheduled appointments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalInvoiced.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{invoices.length} invoices issued</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${balance.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">Outstanding amount</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="visits">Visits ({visits.length})</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments ({appointments.length})</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices ({invoices.length})</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Patient Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Phone</p>
                                        <p className="font-medium">{patient.phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">National ID</p>
                                        <p className="font-medium">{patient.national_id || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Date of Birth</p>
                                        <p className="font-medium">{patient.date_of_birth || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Gender</p>
                                        <p className="font-medium">{patient.gender || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Address</p>
                                        <p className="font-medium">{patient.address || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Medical History</p>
                                        <p className="font-medium mt-1">{patient.medical_history || 'No history recorded.'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Allergies</p>
                                        <p className="font-medium mt-1 text-red-600">{patient.allergies || 'No known allergies.'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>Last 5 visits</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {visits.slice(0, 5).map(visit => (
                                        <div key={visit.id} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {format(new Date(visit.visit_date), 'MMM dd, yyyy')}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {visit.symptoms?.substring(0, 40) || 'Routine Checkup'}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                <Link href={`/visits/${visit.id}`}>
                                                    <Button variant="ghost" size="sm">View</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    {visits.length === 0 && <p className="text-muted-foreground text-sm">No visits recorded.</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* VISITS TAB */}
                <TabsContent value="visits">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Visit History</CardTitle>
                                <Link href={`/visits/new?patient_id=${patient.id}`}>
                                    <Button size="sm">New Visit</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Symptoms/Diagnosis</TableHead>
                                        <TableHead>Doctor Notes</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visits.map(visit => (
                                        <TableRow key={visit.id}>
                                            <TableCell className="font-medium">
                                                {format(new Date(visit.visit_date), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {visit.symptoms}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {visit.diagnosis || visit.notes || '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/visits/${visit.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Printer className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {visits.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                                No visits found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* APPOINTMENTS TAB */}
                <TabsContent value="appointments">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Appointments</CardTitle>
                                <Link href="/appointments">
                                    <Button size="sm">Schedule New</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map(app => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{format(new Date(app.appointment_date), 'MMM dd, yyyy')}</span>
                                                    <span className="text-xs text-muted-foreground">{app.appointment_time}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        app.status === 'scheduled' ? 'default' :
                                                            app.status === 'completed' ? 'outline' :
                                                                app.status === 'cancelled' ? 'destructive' : 'secondary'
                                                    }
                                                    className={
                                                        app.status === 'completed' ? 'border-green-500 text-green-600 bg-green-50' : ''
                                                    }
                                                >
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{app.reason || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/appointments`}>
                                                    <Button variant="ghost" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {appointments.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                                No appointments found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* INVOICES TAB */}
                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Invoices</CardTitle>
                                <Link href="/invoices/new">
                                    <Button size="sm">Create Invoice</Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Invoice #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {invoices.map(inv => {
                                        const invBalance = Number(inv.total_amount) - Number(inv.amount_paid)
                                        return (
                                            <TableRow key={inv.id}>
                                                <TableCell className="font-mono">{inv.invoice_number}</TableCell>
                                                <TableCell>{format(new Date(inv.created_at), 'MMM dd, yyyy')}</TableCell>
                                                <TableCell>
                                                    <Badge variant={inv.status === 'paid' ? 'default' : inv.status === 'unpaid' ? 'destructive' : 'secondary'}>
                                                        {inv.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">${Number(inv.total_amount).toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {invBalance > 0 ? (
                                                        <span className="text-red-600">${invBalance.toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-green-600">$0.00</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/invoices/${inv.id}`}>
                                                        <Button variant="ghost" size="sm">
                                                            View
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                    {invoices.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                                No invoices found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
