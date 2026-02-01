'use client'

import Link from "next/link"
import { Activity } from "lucide-react"

export function Footer() {
    return (
        <footer className="border-t bg-white dark:bg-slate-900">
            <div className="container px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                            <Activity className="h-6 w-6" />
                            <span>ClinicSaaS</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            The modern operating system for forward-thinking clinics.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                            <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
                            <li><Link href="#demo" className="hover:text-primary">Demo</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">About</Link></li>
                            <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                            <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} ClinicSaaS Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
