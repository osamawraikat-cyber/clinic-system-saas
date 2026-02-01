'use client'

import { motion } from "framer-motion"
import { Users, Calendar, Activity, FileText, Smartphone, ShieldCheck } from "lucide-react"

const features = [
    {
        name: "Patient Records",
        description: "Store secure, searchable medical history, visits, and documents in one place.",
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
        name: "Smart Scheduling",
        description: "Drag-and-drop calendar with automated SMS reminders to reduce no-shows.",
        icon: Calendar,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
        name: "Billing & Invoicing",
        description: "Generate professional invoices, track payments, and manage insurance claims.",
        icon: FileText,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
        name: "Mobile Friendly",
        description: "Access your clinic from any device. Perfect for doctors on the move.",
        icon: Smartphone,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
        name: "Clinical Notes",
        description: "Specialized templates for diagnosis, prescriptions, and procedure notes.",
        icon: Activity,
        color: "text-teal-500",
        bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
        name: "Bank-Grade Security",
        description: "Your data is encrypted at rest and in transit. HIPAA compliant architecture.",
        icon: ShieldCheck,
        color: "text-rose-500",
        bg: "bg-rose-50 dark:bg-rose-900/20",
    },
]

export function Features() {
    return (
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        Everything you need to run your clinic
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                        Powerful features designed to replace paperwork and scattered tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow"
                        >
                            <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-6`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.name}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
