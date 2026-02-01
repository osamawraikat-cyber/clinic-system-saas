'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/50 via-teal-50/50 to-transparent dark:from-blue-900/20 dark:via-teal-900/10" />

            <div className="container px-4 md:px-6">
                <div className="flex flex-col items-center text-center space-y-8">

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20"
                    >
                        🚀 The #1 Clinic Management Software in MENA
                    </motion.div>

                    {/* Headline */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="space-y-4 max-w-4xl"
                    >
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                            The Operating System for <br className="hidden sm:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                                Modern Clinics
                            </span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                            Streamline appointments, manage patient records, and automate billing.
                            Built for doctors who care about efficiency.
                        </p>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        <Link href="/signup">
                            <Button size="lg" className="h-12 px-8 text-base">
                                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#demo">
                            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                                View Demo
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Trust Signals */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>No Credit Card Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Set up in 2 minutes</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
