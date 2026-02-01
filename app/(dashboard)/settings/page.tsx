'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Building2, Info } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground mt-1">
                    Manage your clinic information and preferences
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Clinic Information
                    </CardTitle>
                    <CardDescription>
                        Basic information about your medical practice
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clinic-name">Clinic Name</Label>
                            <Input
                                id="clinic-name"
                                placeholder="Emerald Clinic"
                                defaultValue="Emerald Clinic"
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Contact Phone</Label>
                            <Input
                                id="phone"
                                placeholder="+1 (234) 567-8900"
                                disabled
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            placeholder="123 Healthcare Avenue, Medical City"
                            disabled
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="info@emeraldclinic.com"
                                disabled
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                                id="website"
                                placeholder="www.emeraldclinic.com"
                                disabled
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button disabled variant="outline">
                            Save Changes (Coming Soon)
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                        <Info className="h-5 w-5" />
                        Development Note
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800">
                    <p>
                        This is a basic placeholder Settings page. Full settings functionality
                        including editable fields, user management, and system preferences will
                        be implemented in a future update.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
