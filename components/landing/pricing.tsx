'use client'

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function Pricing() {
    return (
        <section id="pricing" className="py-24 bg-white dark:bg-slate-900">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Simple, transparent pricing
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                        Choose the plan that fits your clinic size. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Starter Plan */}
                    <Card className="flex flex-col border-border/50">
                        <CardHeader>
                            <CardTitle className="text-2xl">Starter</CardTitle>
                            <CardDescription>Perfect for new solo private clinics.</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">Free</span>
                                <span className="text-muted-foreground ml-1">/ forever</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>1 User Account</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Up to 20 Patients</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Basic Scheduling</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Patient Records</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/signup" className="w-full">
                                <Button variant="outline" className="w-full">Start for Free</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Pro Plan - Highlighted */}
                    <Card className="flex flex-col relative border-primary shadow-lg scale-105">
                        <div className="absolute -top-4 left-0 right-0 flex justify-center">
                            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                Most Popular
                            </span>
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl text-primary">Professional</CardTitle>
                            <CardDescription>For growing clinics with staff.</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">35 JOD</span>
                                <span className="text-muted-foreground ml-1">/ month</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2 font-medium">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>3 User Accounts (Dr + Staff)</span>
                                </li>
                                <li className="flex items-center gap-2 font-medium">
                                    <Check className="h-4 w-4 text-primary" />
                                    <span>Up to 500 Patients</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Advanced Scheduling + SMS</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Billing & Invoicing</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Priority Support</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="/signup?plan=pro" className="w-full">
                                <Button className="w-full">Get Started</Button>
                            </Link>
                        </CardFooter>
                    </Card>

                    {/* Enterprise */}
                    <Card className="flex flex-col border-border/50">
                        <CardHeader>
                            <CardTitle className="text-2xl">Enterprise</CardTitle>
                            <CardDescription>For large centers & hospitals.</CardDescription>
                            <div className="mt-4">
                                <span className="text-4xl font-bold">Custom</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Unlimited Users</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Unlimited Patients</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Dedicated Account Manager</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>Custom Integrations</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    <span>SLA & Uptime Guarantee</span>
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Link href="mailto:sales@clinicsaas.com" className="w-full">
                                <Button variant="outline" className="w-full">Contact Sales</Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </section>
    )
}
