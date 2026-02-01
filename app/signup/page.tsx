"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Start with simple form state
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        clinicName: ""
    })

    // Initialize Supabase client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            // Sign up the user with clinic name in metadata
            // A database trigger (handle_new_user) will create the clinic 
            // when the user confirms their email
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        clinic_name: formData.clinicName  // Stored in raw_user_meta_data
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("No user created")

            console.log("Signup success, User:", authData.user.id)
            console.log("Session:", authData.session)

            // Check if email confirmation is required
            if (!authData.session) {
                // No session = email confirmation required
                // The database trigger will create the clinic when they confirm
                setSuccessMessage(
                    `Account created! Please check your email (${formData.email}) to confirm your account. ` +
                    `Your clinic "${formData.clinicName}" will be set up automatically after confirmation.`
                )
                return // Don't redirect, show success message
            }

            // If we have a session (auto-confirm enabled), the trigger already ran
            // Just redirect to dashboard
            router.push("/dashboard")

        } catch (err: any) {
            console.error(err)
            setError(err.message || "An error occurred during sign up")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Create your Clinic Account</CardTitle>
                    <CardDescription>
                        Enter your details below to get started with ClinicSaaS
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignUp} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {successMessage && (
                            <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800">
                                <AlertDescription>{successMessage}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="clinicName">Clinic Name</Label>
                            <Input
                                id="clinicName"
                                placeholder="Acme Medical Center"
                                required
                                value={formData.clinicName}
                                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="doctor@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <p className="text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-primary hover:underline">Log in</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}
