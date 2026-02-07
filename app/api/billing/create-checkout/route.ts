import { NextRequest, NextResponse } from 'next/server';
import { PLANS, PlanType, createSubscriptionCheckout } from '@/lib/lemonsqueezy';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('Create checkout request body:', body);
        const { planId, clinicId, userId, userEmail, locale = 'en' } = body;

        if (!planId || !clinicId || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const plan = PLANS[planId as PlanType];
        if (!plan || !plan.variantId) {
            return NextResponse.json({ error: 'Invalid plan or free tier selected' }, { status: 400 });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        console.log('Using appUrl for redirects:', appUrl);
        console.log('Variant ID:', plan.variantId);

        const checkoutUrl = await createSubscriptionCheckout({
            variantId: plan.variantId,
            clinicId,
            userId,
            userEmail: userEmail || '',
            successUrl: `${appUrl}/${locale}/billing?success=true`,
            cancelUrl: `${appUrl}/${locale}/billing?canceled=true`,
        });

        console.log('LemonSqueezy response URL:', checkoutUrl);

        if (!checkoutUrl) {
            return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
        }

        return NextResponse.json({ url: checkoutUrl });
    } catch (error: any) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
