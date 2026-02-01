import { getTranslations } from "next-intl/server"

export default async function PrivacyPage() {
    const t = await getTranslations('Footer')

    return (
        <div className="container py-20 px-4 md:px-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">{t('privacy')}</h1>
            <div className="prose dark:prose-invert">
                <p className="text-muted-foreground">
                    This is a placeholder for the Privacy Policy. In a production environment,
                    this page would contain the legal stipulations regarding data handling,
                    processing, and user rights.
                </p>
                <h3 className="text-xl font-semibold mt-8 mb-4">1. Data Collection</h3>
                <p className="text-muted-foreground">
                    We collect information necessary to provide our services, including clinic details
                    and patient data, which is secured according to industry standards.
                </p>
            </div>
        </div>
    )
}
