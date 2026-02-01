'use client'

import { Calendar, Home, Settings, Users, FileText, Activity, Stethoscope, LogOut, CreditCard } from "lucide-react"
import { usePathname, useRouter } from "@/i18n/navigation" // Updated import
import { Link } from "@/i18n/navigation" // Added Link
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@supabase/ssr"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useEffect, useState } from 'react'

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

export function AppSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const t = useTranslations('Sidebar')
    const [userName, setUserName] = useState('Doctor')
    const [userRole, setUserRole] = useState('Admin')

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Fetch User Profile
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                if (user.user_metadata?.full_name) {
                    setUserName(user.user_metadata.full_name)
                } else {
                    setUserName(user.email?.split('@')[0] || 'Doctor')
                }
                // Set role if available, or default
                if (user.user_metadata?.role) {
                    setUserRole(user.user_metadata.role)
                }
            }
        }
        fetchUser()
    }, [])

    // Menu items defined inside component to use translations
    const items = [
        {
            title: t('dashboard'),
            url: "/dashboard",
            icon: Home,
        },
        {
            title: t('patients'),
            url: "/patients",
            icon: Users,
        },
        {
            title: t('appointments'),
            url: "/appointments",
            icon: Calendar,
        },
        {
            title: t('visits'),
            url: "/visits",
            icon: Activity,
        },
        {
            title: t('procedures'),
            url: "/procedures",
            icon: Stethoscope,
        },
        {
            title: t('invoices'),
            url: "/invoices",
            icon: FileText,
        },
        // {
        //     title: t('billing'), // Assuming billing key exists or fallback
        //     url: "/billing",
        //     icon: CreditCard,
        // },
        {
            title: t('settings'),
            url: "/settings",
            icon: Settings,
        },
    ]

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
                        <span className="truncate font-semibold">SehaTech</span>
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
                                        isActive={pathname === item.url || pathname?.startsWith(item.url + '/')}
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-2 group-data-[collapsible=icon]:hidden">
                    <Button
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md border-0"
                        onClick={() => router.push('/settings')}
                    >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                    </Button>
                </div>
                <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:justify-center text-sidebar-foreground border-t border-white/10">
                    <Avatar className="h-8 w-8 border border-sidebar-border">
                        <AvatarImage src="/avatars/01.png" alt="@osama" />
                        <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">DR</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                        <span className="truncate font-semibold">{userName}</span>
                        <span className="truncate text-xs text-sidebar-foreground/70">{userRole}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="group-data-[collapsible=icon]:hidden text-sidebar-foreground hover:text-red-400 hover:bg-red-950/20"
                        onClick={handleLogout}
                        title={t('logout')}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
