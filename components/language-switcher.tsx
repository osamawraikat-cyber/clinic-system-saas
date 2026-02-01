'use client'

import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations('Navbar') // or a generic 'Common'

    const handleLocaleChange = (newLocale: string) => {
        router.replace(pathname, { locale: newLocale })
    }

    const localeNames = {
        en: "English",
        ar: "العربية",
        tr: "Türkçe"
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Globe className="h-4 w-4" />
                    <span className="sr-only">Switch language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleLocaleChange('en')} className={locale === 'en' ? 'bg-accent' : ''}>
                    🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocaleChange('ar')} className={locale === 'ar' ? 'bg-accent' : ''}>
                    🇯🇴 العربية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLocaleChange('tr')} className={locale === 'tr' ? 'bg-accent' : ''}>
                    🇹🇷 Türkçe
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
