import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initLemonSqueezy } from '@/lib/lemonsqueezy';
import { getSubscription } from '@lemonsqueezy/lemonsqueezy.js';

// Create admin client for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const { clinicId } = await request.json();

        if (!clinicId) {
            return NextResponse.json({ error: 'Missing clinic ID' }, { status: 400 });
        }

        // Get subscription from database
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('stripe_subscription_id') // This field stores LemonSqueezy subscription ID
            .eq('clinic_id', clinicId)
            .single();

        if (!subscription?.stripe_subscription_id) {
            return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
        }

        // Initialize LemonSqueezy and get subscription details
        initLemonSqueezy();
        const lsSubscription = await getSubscription(subscription.stripe_subscription_id);

        // Get the customer portal URL from subscription
        const portalUrl = lsSubscription.data?.data?.attributes?.urls?.customer_portal;

        if (!portalUrl) {
            return NextResponse.json({ error: 'Portal URL not available' }, { status: 500 });
        }

        return NextResponse.json({ url: portalUrl });
    } catch (error) {
        console.error('Portal error:', error);
        return NextResponse.json(
            { error: 'Failed to get customer portal URL' },
            { status: 500 }
        );
    }
}
