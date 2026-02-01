import { NextRequest, NextResponse } from 'next/server';
import { PLANS, PlanType, createSubscriptionCheckout } from '@/lib/lemonsqueezy';

export async function POST(request: NextRequest) {
    try {
        const { planId, clinicId, userId, userEmail } = await request.json();

        if (!planId || !clinicId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const plan = PLANS[planId as PlanType];
        if (!plan || !plan.variantId) {
            return NextResponse.json({ error: 'Invalid plan or free tier selected' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const checkoutUrl = await createSubscriptionCheckout({
            variantId: plan.variantId,
            clinicId,
            userId,
            userEmail: userEmail || '',
            successUrl: `${appUrl}/billing?success=true`,
            cancelUrl: `${appUrl}/billing?canceled=true`,
        });

        if (!checkoutUrl) {
            return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
        }

        return NextResponse.json({ url: checkoutUrl });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
