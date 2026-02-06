'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface PrintButtonProps {
    label?: string
}

export function PrintButton({ label = "Print Prescription" }: PrintButtonProps) {
    return (
        <Button onClick={() => window.print()} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="h-4 w-4" />
            {label}
        </Button>
    )
}
