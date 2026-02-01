import { getTranslations } from "next-intl/server"

export default async function TermsPage() {
    const t = await getTranslations('Footer')

    return (
        <div className="container py-20 px-4 md:px-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('terms')}</h1>
            <div className="prose dark:prose-invert">
                <p className="text-muted-foreground">
                    This is a placeholder for the Terms of Service. In a production environment,
                    this page would outline the rules and regulations for using the SehaTech platform.
                </p>
                <h3 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                    By accessing and using this service, you accept and agree to be bound by the terms
                    and provision of this agreement.
                </p>
            </div>
        </div>
    )
}
