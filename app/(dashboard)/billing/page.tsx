'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CreditCard,
    Check,
    Zap,
    Building2,
    Users,
    Star,
    ExternalLink,
    Loader2,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

// Plan configuration (matching lib/stripe.ts)
const PLANS = {
    starter: {
        name: 'Starter',
        price: 0,
        patientLimit: 50,
        teamLimit: 1,
        features: ['Basic patient management', 'Appointment scheduling', 'Invoice generation'],
        icon: Zap,
        color: 'bg-slate-100 text-slate-800',
        popular: false,
    },
    professional: {
        name: 'Professional',
        price: 49,
        patientLimit: 500,
        teamLimit: 3,
        features: ['Everything in Starter', '500 patients', '3 team members', 'Priority email support'],
        icon: Star,
        color: 'bg-blue-100 text-blue-800',
        popular: true,
    },
    enterprise: {
        name: 'Enterprise',
        price: 149,
        patientLimit: -1,
        teamLimit: -1,
        features: ['Everything in Professional', 'Unlimited patients', 'Unlimited team', 'Phone support', 'Custom integrations'],
        icon: Building2,
        color: 'bg-purple-100 text-purple-800',
        popular: false,
    },
} as const;

type PlanType = keyof typeof PLANS;

interface Subscription {
    plan: PlanType;
    status: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
}

interface UsageStats {
    patientCount: number;
    teamCount: number;
}

export default function BillingPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<UsageStats>({ patientCount: 0, teamCount: 1 });
    const [clinicId, setClinicId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<PlanType | null>(null);
    const [portalLoading, setPortalLoading] = useState(false);

    // Check for success/cancel from Stripe redirect
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('success') === 'true') {
            toast.success('Subscription activated successfully!');
            window.history.replaceState({}, '', '/billing');
        }
        if (params.get('canceled') === 'true') {
            toast.info('Checkout was canceled');
            window.history.replaceState({}, '', '/billing');
        }
    }, []);

    useEffect(() => {
        async function loadData() {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                setUserId(user.id);
                setUserEmail(user.email || null);

                // Get clinic membership
                const { data: membership } = await supabase
                    .from('clinic_members')
                    .select('clinic_id')
                    .eq('user_id', user.id)
                    .single();

                if (!membership) return;
                setClinicId(membership.clinic_id);

                // Get subscription
                const { data: sub } = await supabase
                    .from('subscriptions')
                    .select('*')
                    .eq('clinic_id', membership.clinic_id)
                    .single();

                if (sub) {
                    setSubscription(sub);
                } else {
                    // Default to starter plan if no subscription exists
                    setSubscription({
                        plan: 'starter',
                        status: 'active',
                        current_period_end: '',
                        cancel_at_period_end: false,
                    });
                }

                // Get usage stats
                const { count: patientCount } = await supabase
                    .from('patients')
                    .select('*', { count: 'exact', head: true })
                    .eq('clinic_id', membership.clinic_id);

                const { count: teamCount } = await supabase
                    .from('clinic_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('clinic_id', membership.clinic_id);

                setUsage({
                    patientCount: patientCount || 0,
                    teamCount: teamCount || 1,
                });
            } catch (error) {
                console.error('Error loading billing data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [supabase]);

    const handleUpgrade = async (planId: PlanType) => {
        if (!clinicId || !userId) return;

        setUpgrading(planId);
        try {
            const response = await fetch('/api/billing/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId,
                    clinicId,
                    userId,
                    userEmail,
                }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Failed to start checkout');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setUpgrading(null);
        }
    };

    const handleManageBilling = async () => {
        if (!clinicId) return;

        setPortalLoading(true);
        try {
            const response = await fetch('/api/billing/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clinicId }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error(data.error || 'Failed to open billing portal');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setPortalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const currentPlan = subscription?.plan || 'starter';
    const currentPlanConfig = PLANS[currentPlan];
    const usagePercentage = currentPlanConfig.patientLimit > 0
        ? Math.round((usage.patientCount / currentPlanConfig.patientLimit) * 100)
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Billing & Subscription</h1>
                <p className="text-muted-foreground">Manage your subscription and billing details</p>
            </div>

            {/* Status Alerts */}
            {subscription?.status === 'past_due' && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Your payment is past due. Please update your payment method to avoid service interruption.
                    </AlertDescription>
                </Alert>
            )}

            {subscription?.cancel_at_period_end && (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Your subscription will be canceled at the end of the current billing period
                        ({new Date(subscription.current_period_end).toLocaleDateString()}).
                    </AlertDescription>
                </Alert>
            )}

            {/* Current Plan & Usage */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Current Plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge className={`${currentPlanConfig.color} text-lg px-4 py-1`}>
                                {currentPlanConfig.name}
                            </Badge>
                            {currentPlan !== 'starter' && (
                                <span className="text-2xl font-bold">${currentPlanConfig.price}/mo</span>
                            )}
                            {currentPlan === 'starter' && (
                                <span className="text-2xl font-bold text-green-600">Free</span>
                            )}
                        </div>

                        {currentPlan !== 'starter' && subscription?.current_period_end && (
                            <p className="text-sm text-muted-foreground">
                                Next billing date: {new Date(subscription.current_period_end).toLocaleDateString()}
                            </p>
                        )}

                        {currentPlan !== 'starter' && (
                            <Button
                                variant="outline"
                                onClick={handleManageBilling}
                                disabled={portalLoading}
                            >
                                {portalLoading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                )}
                                Manage Billing
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Patients</span>
                                <span>
                                    {usage.patientCount} / {currentPlanConfig.patientLimit === -1 ? '∞' : currentPlanConfig.patientLimit}
                                </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all ${usagePercentage >= 90 ? 'bg-red-500' :
                                        usagePercentage >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Team Members</span>
                            <span>
                                {usage.teamCount} / {currentPlanConfig.teamLimit === -1 ? '∞' : currentPlanConfig.teamLimit}
                            </span>
                        </div>

                        {usagePercentage >= 80 && currentPlan !== 'enterprise' && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    You&apos;re approaching your patient limit. Consider upgrading for more capacity.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Plan Selection */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([planId, plan]) => {
                        const Icon = plan.icon;
                        const isCurrentPlan = planId === currentPlan;
                        const isUpgrade = PLANS[planId].price > currentPlanConfig.price;
                        const isDowngrade = PLANS[planId].price < currentPlanConfig.price && planId !== 'starter';

                        return (
                            <Card
                                key={planId}
                                className={`relative ${plan.popular ? 'border-blue-500 border-2' : ''} ${isCurrentPlan ? 'ring-2 ring-emerald-500' : ''}`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                                    </div>
                                )}

                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Icon className="h-5 w-5" />
                                        {plan.name}
                                    </CardTitle>
                                    <CardDescription>
                                        <span className="text-3xl font-bold text-foreground">
                                            ${plan.price}
                                        </span>
                                        {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter>
                                    {isCurrentPlan ? (
                                        <Button className="w-full" variant="outline" disabled>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Current Plan
                                        </Button>
                                    ) : planId === 'starter' ? (
                                        <Button className="w-full" variant="outline" disabled>
                                            Free Tier
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            variant={isUpgrade ? 'default' : 'outline'}
                                            onClick={() => handleUpgrade(planId)}
                                            disabled={upgrading !== null}
                                        >
                                            {upgrading === planId ? (
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            ) : isUpgrade ? (
                                                <Zap className="h-4 w-4 mr-2" />
                                            ) : null}
                                            {isUpgrade ? 'Upgrade' : isDowngrade ? 'Downgrade' : 'Select'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* FAQ */}
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium">Can I cancel anytime?</h4>
                        <p className="text-sm text-muted-foreground">
                            Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium">What happens if I exceed my patient limit?</h4>
                        <p className="text-sm text-muted-foreground">
                            You won&apos;t be able to add new patients until you upgrade or remove existing ones. Your existing data remains safe.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-medium">Do you offer refunds?</h4>
                        <p className="text-sm text-muted-foreground">
                            We offer a 14-day money-back guarantee for new subscriptions. Contact support for assistance.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
