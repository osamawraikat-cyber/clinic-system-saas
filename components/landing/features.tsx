'use client'

import { motion } from "framer-motion"
import { Users, Calendar, Activity, FileText, Smartphone, ShieldCheck, LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"

interface FeatureConfig {
    key: string
    icon: LucideIcon
    color: string
    bg: string
}

const featureConfigs: FeatureConfig[] = [
    {
        key: "records",
        icon: Users,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
        key: "scheduling",
        icon: Calendar,
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
        key: "billing",
        icon: FileText,
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
        key: "mobile",
        icon: Smartphone,
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
        key: "notes",
        icon: Activity,
        color: "text-teal-500",
        bg: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
        key: "security",
        icon: ShieldCheck,
        color: "text-rose-500",
        bg: "bg-rose-50 dark:bg-rose-900/20",
    },
]

export function Features() {
    const t = useTranslations('Features')

    return (
        <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950">
            <div className="container px-4 md:px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                        {t('title')}
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-lg">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featureConfigs.map((feature, index) => (
                        <motion.div
                            key={feature.key}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow"
                        >
                            <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center mb-6`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{t(`items.${feature.key}.title`)}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {t(`items.${feature.key}.desc`)}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
