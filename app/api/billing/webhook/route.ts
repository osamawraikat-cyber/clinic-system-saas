import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPlanFromVariantId, PlanType } from '@/lib/lemonsqueezy';
import crypto from 'crypto';

// Create admin client for server-side operations (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Verify webhook signature from LemonSqueezy
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get('x-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify signature
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    if (!verifyWebhookSignature(body, signature, webhookSecret)) {
        console.error('Webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        const event = JSON.parse(body);
        const eventName = event.meta?.event_name;
        const data = event.data;

        console.log(`LemonSqueezy webhook: ${eventName}`);

        switch (eventName) {
            case 'subscription_created':
            case 'subscription_updated': {
                await handleSubscriptionUpdate(data);
                break;
            }

            case 'subscription_cancelled': {
                await handleSubscriptionCancelled(data);
                break;
            }

            case 'subscription_resumed': {
                await handleSubscriptionResumed(data);
                break;
            }

            case 'subscription_payment_success': {
                await handlePaymentSuccess(data);
                break;
            }

            case 'subscription_payment_failed': {
                await handlePaymentFailed(data);
                break;
            }

            default:
                console.log(`Unhandled event: ${eventName}`);
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}

async function handleSubscriptionUpdate(data: any) {
    const attrs = data.attributes;
    const customData = attrs.first_subscription_item?.custom_data || attrs.custom_data || {};
    const clinicId = customData.clinic_id;
    const variantId = attrs.variant_id?.toString();

    if (!clinicId) {
        console.error('No clinic_id in subscription custom data');
        return;
    }

    const plan = getPlanFromVariantId(variantId);
    const status = mapLemonSqueezyStatus(attrs.status);

    await supabaseAdmin.from('subscriptions').upsert({
        clinic_id: clinicId,
        stripe_customer_id: attrs.customer_id?.toString(), // Reusing field for LS customer ID
        stripe_subscription_id: data.id?.toString(), // Reusing field for LS subscription ID
        plan,
        status,
        current_period_start: attrs.renews_at ? new Date(attrs.created_at).toISOString() : null,
        current_period_end: attrs.renews_at ? new Date(attrs.renews_at).toISOString() : null,
        cancel_at_period_end: attrs.cancelled || false,
        updated_at: new Date().toISOString(),
    }, {
        onConflict: 'clinic_id',
    });

    console.log(`Subscription updated for clinic ${clinicId}: ${plan} (${status})`);
}

async function handleSubscriptionCancelled(data: any) {
    const subscriptionId = data.id?.toString();

    await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'canceled',
            plan: 'starter',
            cancel_at_period_end: true,
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

    console.log(`Subscription cancelled: ${subscriptionId}`);
}

async function handleSubscriptionResumed(data: any) {
    const subscriptionId = data.id?.toString();
    const attrs = data.attributes;
    const variantId = attrs.variant_id?.toString();
    const plan = getPlanFromVariantId(variantId);

    await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'active',
            plan,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

    console.log(`Subscription resumed: ${subscriptionId}`);
}

async function handlePaymentSuccess(data: any) {
    const subscriptionId = data.relationships?.subscription?.data?.id?.toString();

    if (!subscriptionId) return;

    await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'active',
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

    console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

async function handlePaymentFailed(data: any) {
    const subscriptionId = data.relationships?.subscription?.data?.id?.toString();

    if (!subscriptionId) return;

    await supabaseAdmin
        .from('subscriptions')
        .update({
            status: 'past_due',
            updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);

    console.log(`Payment failed for subscription ${subscriptionId}`);
}

function mapLemonSqueezyStatus(lsStatus: string): string {
    switch (lsStatus) {
        case 'active':
        case 'on_trial':
            return 'active';
        case 'past_due':
        case 'unpaid':
            return 'past_due';
        case 'cancelled':
        case 'expired':
            return 'canceled';
        default:
            return 'active';
    }
}
