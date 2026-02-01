'use client'

import Link from "next/link"
import { CheckCircle2, Circle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function OnboardingSteps() {
    return (
        <Card className="border-blue-100 bg-blue-50/50 dark:border-blue-900/50 dark:bg-blue-900/20 col-span-4 lg:col-span-2">
            <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">Welcome to your Clinic! 🏥</CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                    Follow these steps to get your clinic up and running.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium line-through text-muted-foreground">Create your account</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Circle className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Add your first patient</span>
                        <Link href="/patients/new" className="ml-auto">
                            <Button size="sm" variant="outline" className="h-7 text-xs bg-white dark:bg-slate-950">
                                Add Patient
                            </Button>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        <Circle className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-muted-foreground">Schedule an appointment</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Circle className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-muted-foreground">Create an invoice</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
