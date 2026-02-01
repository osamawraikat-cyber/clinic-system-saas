'use client'

import { Link } from "@/i18n/navigation"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export function Pricing() {
    const t = useTranslations('Pricing')

    return (
        <section id="pricing" className="py-24 bg-white dark:bg-slate-900">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        {t('title')}
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter Plan */}
                    <Card className="flex flex-col border-border/50">
                        <CardHeader>
                            <CardTitle className="text-2xl">{t('starter')}</CardTitle>
                            <CardDescription>{t('starterDesc')}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">{t('free')}</span>
                                <span className="text-muted-foreground ml-1">/ {t('forever')}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{t('features.user1')}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{t('features.patients20')}</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{t('features.user1')}</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/signup" className="w-full">
                                <Button variant="outline" className="w-full">{t('ctaFree')}</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan - Highlighted */}
                    <Card className="flex flex-col relative border-primary shadow-lg scale-105">
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                {t('mostPopular')}
                            </span>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl text-primary">{t('pro')}</CardTitle>
                            <CardDescription>{t('proDesc')}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">35 JOD</span>
                                <span className="text-muted-foreground ml-1">/ {t('month')}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2 font-medium">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>{t('features.user3')}</span>
                                </li>
                                <li className="flex items-center gap-2 font-medium">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>{t('features.patients500')}</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/signup?plan=pro" className="w-full">
                                <Button className="w-full">{t('ctaPro')}</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Enterprise */}
                    <Card className="flex flex-col border-border/50">
                        <CardHeader>
                            <CardTitle className="text-2xl">{t('enterprise')}</CardTitle>
                            <CardDescription>{t('enterpriseDesc')}</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">{t('custom')}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>{t('features.unlimited')}</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="mailto:sales@clinicsaas.com" className="w-full">
                                <Button variant="outline" className="w-full">{t('ctaSales')}</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    )
}
