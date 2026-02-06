'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Check, CreditCard, Rocket } from "lucide-react"
import { useRouter } from "next/navigation"

interface UpgradeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    limitType: 'patient' | 'member'
}

export function UpgradeDialog({ open, onOpenChange, limitType }: UpgradeDialogProps) {
    const router = useRouter()

    const features = [
        "Unlimited Patients & Visits",
        "Add Unlimited Team Members",
        "SMS & WhatsApp Reminders",
        "Priority Support",
        "Advanced Analytics"
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Rocket className="h-5 w-5 text-emerald-600" />
                        Upgrade to Pro
                    </DialogTitle>
                    <DialogDescription>
                        You've reached your free {limitType} limit. Upgrade now to unlock unlimited access and grow your clinic without boundaries.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800 mb-4">
                        <h4 className="font-semibold mb-3 text-sm text-slate-900 dark:text-slate-100">Pro Plan Includes:</h4>
                        <ul className="space-y-2">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-center text-sm text-muted-foreground">
                                    <Check className="h-4 w-4 mr-2 text-emerald-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:justify-start gap-2">
                    <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0"
                        onClick={() => router.push('/billing')}
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Upgrade Now - $49/mo
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => onOpenChange(false)}
                    >
                        Maybe Later
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
