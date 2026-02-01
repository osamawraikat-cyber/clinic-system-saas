'use client'

import { Link } from "@/i18n/navigation"
import { Activity } from "lucide-react"
import { useTranslations } from "next-intl"

export function Footer() {
    const t = useTranslations('Footer')
    const navT = useTranslations('Navbar') // Reuse some nav translations if convenient

    return (
        <footer className="border-t bg-white dark:bg-slate-900">
            <div className="container px-4 md:px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                            <Activity className="h-6 w-6" />
                            <span>SehaTech</span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            {t('tagline')}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">{t('product')}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#features" className="hover:text-primary">{navT('features')}</Link></li>
                            <li><Link href="#pricing" className="hover:text-primary">{navT('pricing')}</Link></li>
                            <li><Link href="#demo" className="hover:text-primary">{t('demo')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">{t('company')}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-primary">{t('about')}</Link></li>
                            <li><Link href="/blog" className="hover:text-primary">{t('blog')}</Link></li>
                            <li><Link href="/careers" className="hover:text-primary">{t('careers')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-4">{t('legal')}</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-primary">{t('privacy')}</Link></li>
                            <li><Link href="/terms" className="hover:text-primary">{t('terms')}</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} {t('rights')}</p>
                </div>
            </div>
        </footer>
    )
}
