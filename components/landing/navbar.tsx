'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"

export function Navbar() {
    return (
        <header className="fixed top-0 w-full z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="container flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Activity className="h-6 w-6" />
                    <span>ClinicSaaS</span>
                </Link>
                <nav className="ml-auto flex items-center gap-4 sm:gap-6">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                        Pricing
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">Log In</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Get Started</Button>
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}
