'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar as CalendarIcon,
    Clock,
    Search,
    Filter,
    MoreHorizontal,
    User,
    Phone,
    FileText,
    ChevronLeft,
    ChevronRight,
    MapPin,
    CheckCircle2,
    XCircle,
    AlertCircle
} from 'lucide-react'
import { format, isToday, addDays, subDays, parseISO, isSameDay } from 'date-fns'
import { enUS, ar } from 'date-fns/locale'
import { useLocale, useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Card,
    CardContent,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { updateAppointmentStatus } from '@/app/actions/appointments'
import { toast } from 'sonner'
import Link from 'next/link'

interface Appointment {
    id: string
    created_at: string
    appointment_date: string
    appointment_time: string
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
    reason: string | null
    notes: string | null
    patient: {
        id: string
        full_name: string
        phone: string | null
    } | null
}

interface AppointmentsListProps {
    initialAppointments: Appointment[]
}

export function AppointmentsList({ initialAppointments }: AppointmentsListProps) {
    const locale = useLocale()
    const t = useTranslations('Common')
    const [selectedDate, setSelectedDate] = useState(new Date())

    // ...


    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day')

    const handleStatusUpdate = async (id: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no_show') => {
        try {
            const result = await updateAppointmentStatus(id, status)
            if (result.success) {
                toast.success(t('statusUpdated'))
            } else {
                toast.error(result.error || t('errorUpdatingStatus'))
            }
        } catch (e) {
            toast.error(t('error'))
        }
    }

    // Filter appointments
    const filteredAppointments = initialAppointments.filter(app => {
        // Date Filter
        const appDate = parseISO(app.appointment_date)
        const dateMatch = isSameDay(appDate, selectedDate)

        if (viewMode === 'day' && !dateMatch) return false

        // Search Filter
        const searchLower = searchQuery.toLowerCase()
        const matchesSearch =
            (app.patient?.full_name?.toLowerCase() || '').includes(searchLower) ||
            (app.patient?.phone || '').includes(searchLower) ||
            (app.reason?.toLowerCase() || '').includes(searchLower)

        if (!matchesSearch) return false

        // Status Filter
        if (statusFilter !== 'all' && app.status !== statusFilter) return false

        return true
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-sm border-blue-200/50'
            case 'completed': return 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-sm border-emerald-200/50'
            case 'cancelled': return 'bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-sm border-red-200/50'
            case 'no_show': return 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-sm border-amber-200/50'
            default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled': return <Clock className="w-3 h-3 mr-1" />
            case 'completed': return <CheckCircle2 className="w-3 h-3 mr-1" />
            case 'cancelled': return <XCircle className="w-3 h-3 mr-1" />
            case 'no_show': return <AlertCircle className="w-3 h-3 mr-1" />
            default: return <Clock className="w-3 h-3 mr-1" />
        }
    }

    const formatTime = (timeStr: string) => {
        // timeStr is usually "HH:MM:SS" or "HH:MM"
        try {
            const [hours, minutes] = timeStr.split(':')
            const date = new Date()
            date.setHours(parseInt(hours), parseInt(minutes))
            return format(date, 'h:mm a', { locale: locale === 'ar' ? ar : enUS })
        } catch (e) {
            return timeStr
        }
    }

    const stats = {
        total: filteredAppointments.length,
        completed: filteredAppointments.filter(a => a.status === 'completed').length,
        scheduled: filteredAppointments.filter(a => a.status === 'scheduled').length
    }

    return (
        <div className="space-y-6">
            {/* Header / Controls */}
            <Card className="border-none shadow-sm bg-background/60 backdrop-blur-xl">
                <CardContent className="p-4 space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Date Navigation */}
                        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                                className="h-8 w-8"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center font-medium">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                <span>
                                    {format(selectedDate, 'EEE, dd MMM', { locale: locale === 'ar' ? ar : enUS })}
                                </span>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                                className="h-8 w-8"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedDate(new Date())}
                                className={cn(isToday(selectedDate) && "bg-primary/10 text-primary border-primary/20")}
                            >
                                Today
                            </Button>
                        </div>

                        {/* Search & Filter */}
                        <div className="flex flex-1 items-center gap-2 w-full md:w-auto md:ml-auto md:max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:right-2.5 rtl:left-auto" />
                                <Input
                                    placeholder="Search patients..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background rtl:pr-9 rtl:pl-3 border-transparent focus:border-primary/20 transition-all hover:bg-secondary/40 focus:bg-background"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[130px] border-transparent bg-secondary/50 hover:bg-secondary/80">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="no_show">No Show</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Overview for Day */}
            {initialAppointments.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-primary/5 border-primary/10 shadow-none">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-primary/70 uppercase">Appointments</p>
                                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                            </div>
                            <CalendarIcon className="h-8 w-8 text-primary/20" />
                        </CardContent>
                    </Card>
                    <Card className="bg-blue-500/5 border-blue-500/10 shadow-none">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-600/70 uppercase">Upcoming</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                            </div>
                            <Clock className="h-8 w-8 text-blue-600/20" />
                        </CardContent>
                    </Card>
                    {/* Add more stats if needed */}
                </div>
            )}

            {/* Timeline List */}
            <div className="relative space-y-4">
                {/* Timeline Line (Desktop) */}
                <div className="absolute left-24 top-4 bottom-4 w-px bg-border hidden md:block rtl:right-24 rtl:left-auto" />

                <AnimatePresence mode='popLayout'>
                    {filteredAppointments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center py-16 text-center"
                        >
                            <div className="bg-secondary/50 p-4 rounded-full mb-4">
                                <CalendarIcon className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">No appointments found</h3>
                            <p className="text-muted-foreground max-w-xs mt-2">
                                There are no appointments for this date matching your filters.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-6"
                                onClick={() => {
                                    setSearchQuery('')
                                    setStatusFilter('all')
                                }}
                            >
                                Clear Filters
                            </Button>
                        </motion.div>
                    ) : (
                        filteredAppointments.map((appointment, index) => (
                            <motion.div
                                key={appointment.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative flex flex-col md:flex-row gap-4 md:gap-0 group"
                            >
                                {/* Time Column (Desktop) */}
                                <div className="hidden md:flex w-24 flex-col items-end pr-8 pt-4 relative rtl:items-start rtl:pl-8 rtl:pr-0">
                                    <span className="font-semibold text-lg text-primary tabular-nums">
                                        {formatTime(appointment.appointment_time)}
                                    </span>
                                    {/* Timeline Dot */}
                                    <div className="absolute right-[-5px] top-6 w-2.5 h-2.5 rounded-full bg-background border-2 border-primary rtl:left-[-5px] rtl:right-auto z-10 group-hover:scale-125 transition-transform" />
                                </div>

                                {/* Card */}
                                <Card className="flex-1 overflow-hidden border-transparent bg-white/50 hover:bg-white hover:shadow-md transition-all duration-300 dark:bg-slate-900/50 dark:hover:bg-slate-900">
                                    <div className="p-0 flex flex-col sm:flex-row">
                                        {/* Status Strip */}
                                        <div className={cn("w-full sm:w-1.5 h-1 sm:h-auto",
                                            appointment.status === 'scheduled' ? "bg-blue-500" :
                                                appointment.status === 'completed' ? "bg-emerald-500" :
                                                    appointment.status === 'cancelled' ? "bg-red-500" :
                                                        "bg-slate-200"
                                        )} />

                                        <div className="flex-1 p-4 sm:p-5">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                            {appointment.patient?.full_name?.substring(0, 2).toUpperCase() || 'P'}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-semibold text-base leading-none">
                                                                {appointment.patient?.full_name || 'Unknown Patient'}
                                                            </h3>
                                                            {/* Mobile Time */}
                                                            <span className="md:hidden text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                                                {formatTime(appointment.appointment_time)}
                                                            </span>
                                                        </div>

                                                        {appointment.patient?.phone && (
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                                <Phone className="h-3 w-3" />
                                                                <span className="tabular-nums">{appointment.patient.phone}</span>
                                                            </div>
                                                        )}

                                                        {appointment.reason && (
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                                                                <FileText className="h-3 w-3 text-primary/50" />
                                                                <span>{appointment.reason}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <Badge variant="outline" className={cn("capitalize border-0", getStatusColor(appointment.status))}>
                                                    {getStatusIcon(appointment.status)}
                                                    {appointment.status}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center p-2 sm:p-4 border-t sm:border-t-0 sm:border-l sm:ml-auto">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-full">
                                                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                        <span className="sr-only">{t('actions')}</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />

                                                    {/* Reschedule could be a modal or link to edit page with focus */}
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(appointment.id, 'scheduled')}>
                                                        {t('reschedule')}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {appointment.status !== 'completed' && (
                                                        <DropdownMenuItem
                                                            className="text-emerald-600 focus:text-emerald-700"
                                                            onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                                                        >
                                                            {t('markCompleted')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    {appointment.status !== 'cancelled' && (
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-700"
                                                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                                                        >
                                                            {t('cancel')}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
