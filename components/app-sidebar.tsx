'use client'

import { Calendar, Home, Settings, Users, FileText, Activity, Stethoscope, LogOut } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarHeader,
    SidebarFooter,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Menu items.
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Patients",
        url: "/patients",
        icon: Users,
    },
    {
        title: "Appointments",
        url: "/appointments",
        icon: Calendar,
    },
    {
        title: "Visits",
        url: "/visits",
        icon: Activity,
    },
    {
        title: "Procedures",
        url: "/procedures",
        icon: Stethoscope,
    },
    {
        title: "Invoices",
        url: "/invoices",
        icon: FileText,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            toast.success('Signed out successfully')
            router.push('/login')
            router.refresh()
        } catch (error: any) {
            console.error('Logout error:', error)
            toast.error('Failed to sign out', {
                description: error.message
            })
        }
    }

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <div className="flex items-center gap-2 px-2 py-3 text-sidebar-foreground">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <Activity className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">Emerald Clinic</span>
                        <span className="truncate text-xs text-sidebar-foreground/70">Management System</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={pathname?.startsWith(item.url) && item.url !== "/" || pathname === item.url}
                                        tooltip={item.title}
                                    >
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center text-sidebar-foreground border-t border-white/10">
                    <Avatar className="h-8 w-8 border border-sidebar-border">
                        <AvatarImage src="/avatars/01.png" alt="@osama" />
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">DR</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">Dr. Andrew</span>
                        <span className="truncate text-xs text-sidebar-foreground/70">Admin</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="group-data-[collapsible=icon]:hidden text-sidebar-foreground hover:text-red-400 hover:bg-red-950/20"
                        onClick={handleLogout}
                        title="Sign out"
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
