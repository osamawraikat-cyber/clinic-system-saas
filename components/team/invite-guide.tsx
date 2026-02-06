import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export function InviteGuide() {
    const t = useTranslations('InviteGuide')

    return (
        <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-sm">{t('title')}</h3>
            </div>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm py-2">{t('inviteTitle')}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                        {t('inviteDesc')}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-sm py-2">{t('rolesTitle')}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                        <ul className="list-disc pl-4 space-y-1">
                            <li><strong>{t('roles.owner')}:</strong></li>
                            <li><strong>{t('roles.doctor')}</strong></li>
                            <li><strong>{t('roles.nurse')}</strong></li>
                            <li><strong>{t('roles.receptionist')}</strong></li>
                        </ul>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-sm py-2">{t('troubleTitle')}</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                        {t('troubleDesc')}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
