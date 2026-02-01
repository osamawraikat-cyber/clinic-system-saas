'use client'

import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Activity } from "lucide-react"
import { useTranslations } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Navbar() {
    const t = useTranslations('Navbar')

    return (
        <header className="fixed top-0 w-full z-50 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="container flex h-16 items-center px-4 md:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <Activity className="h-6 w-6" />
                    <span>SehaTech</span>
                </Link>
                <nav className="ms-auto flex items-center gap-4 sm:gap-6">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                        {t('features')}
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">
                        {t('pricing')}
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">{t('login')}</Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">{t('getStarted')}</Button>
                        </Link>
                        <LanguageSwitcher />
                    </div>
                </nav>
            </div>
        </header>
    )
}
