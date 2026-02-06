import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Activity, Plus, Calendar, Printer } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

export const revalidate = 0

export default async function VisitsPage() {
    const supabase = await createClient()
    const t = await getTranslations('Visits')

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
                    <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                    <p className="text-muted-foreground mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                <Link href="/visits/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('recordVisit')}
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
                            <h3 className="text-lg font-semibold mb-2">{t('noVisits')}</h3>
                            <p className="text-muted-foreground mb-4">
                                {t('startRecording')}
                            </p>
                            <Link href="/visits/new">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('recordVisit')}
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
                                            {visit.patients?.full_name || t('unknownPatient')}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(visit.visit_date).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {visit.appointments && (
                                            <Badge variant="secondary">
                                                {t('appointmentBased')}
                                            </Badge>
                                        )}
                                        <Link href={`/visits/${visit.id}`}>
                                            <Button variant="outline" size="sm" className="h-8">
                                                <Printer className="h-3 w-3 mr-2" />
                                                {t('viewPrint')}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {visit.symptoms && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('symptoms')}</p>
                                        <p className="text-sm line-clamp-2">{visit.symptoms}</p>
                                    </div>
                                )}
                                {visit.diagnosis && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('diagnosis')}</p>
                                        <p className="text-sm line-clamp-2">{visit.diagnosis}</p>
                                    </div>
                                )}
                                {visit.doctor_notes && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('notes')}</p>
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
