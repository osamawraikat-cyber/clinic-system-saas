import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { LanguageSwitcher } from "@/components/language-switcher"
import DemoBanner from "@/components/demo-banner"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="p-4 flex items-center justify-between border-b">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <h1 className="font-semibold">Clinic Management</h1>
                    </div>
                    <LanguageSwitcher />
                </div>
                <div className="p-4">
                    <DemoBanner />
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
