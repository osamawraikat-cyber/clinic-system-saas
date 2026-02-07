import { lemonSqueezySetup, createCheckout, getSubscription, cancelSubscription, listProducts, listVariants } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize LemonSqueezy SDK
let currentApiKey = '';

export function initLemonSqueezy() {
    const apiKey = process.env.LEMONSQUEEZY_API_KEY;
    if (apiKey && apiKey !== currentApiKey) {
        lemonSqueezySetup({
            apiKey: apiKey,
            onError: (error) => console.error('LemonSqueezy error:', error),
        });
        currentApiKey = apiKey;
    }
}

// Plan configuration
export const PLANS = {
    starter: {
        name: 'Starter',
        price: 0,
        variantId: null, // Free tier - no LemonSqueezy variant
        patientLimit: 20,
        teamLimit: 1,
        features: ['Basic patient management', 'Appointment scheduling', 'Invoice generation'],
    },
    professional: {
        name: 'Professional',
        price: 49,
        variantId: process.env.LEMONSQUEEZY_VARIANT_PROFESSIONAL,
        patientLimit: 500,
        teamLimit: 3,
        features: ['Everything in Starter', '500 patients', '3 team members', 'Priority email support'],
    },
    enterprise: {
        name: 'Enterprise',
        price: 149,
        variantId: process.env.LEMONSQUEEZY_VARIANT_ENTERPRISE,
        patientLimit: -1, // Unlimited
        teamLimit: -1, // Unlimited
        features: ['Everything in Professional', 'Unlimited patients', 'Unlimited team', 'Phone support', 'Custom integrations'],
    },
} as const;

export type PlanType = keyof typeof PLANS;

// Helper to get plan limits
export function getPlanLimits(plan: PlanType) {
    return PLANS[plan] || PLANS.starter;
}

export async function createSubscriptionCheckout(options: {
    variantId: string;
    clinicId: string;
    userId: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
}): Promise<{ url: string | null; error: string | null }> {
    initLemonSqueezy();

    const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
    if (!storeId) {
        console.error('LEMONSQUEEZY_STORE_ID is not defined in environment variables');
        return { url: null, error: 'Store ID not configured' };
    }

    try {
        console.log(`Creating LS checkout for store ${storeId}, variant ${options.variantId}`)
        const { data, error } = await createCheckout(storeId, options.variantId, {
            checkoutData: {
                email: options.userEmail,
                custom: {
                    clinic_id: options.clinicId,
                    user_id: options.userId,
                },
            },
            productOptions: {
                redirectUrl: options.successUrl,
            },
        });

        if (error) {
            console.error('LemonSqueezy createCheckout error object:', JSON.stringify(error, null, 2));
            // Return specific error message if possible
            const message = error.message || (error as any).errors?.[0]?.detail || 'Unknown LemonSqueezy error';
            return { url: null, error: message };
        }

        const url = data?.data?.attributes?.url;
        console.log('LemonSqueezy checkout URL generated:', url);
        return { url: url || null, error: url ? null : 'Failed to retrieve checkout URL' };
    } catch (err: any) {
        console.error('Unexpected error in createSubscriptionCheckout:', err);
        return { url: null, error: err.message || 'Internal error' };
    }
}

// Get subscription details
export async function getSubscriptionDetails(subscriptionId: string) {
    initLemonSqueezy();
    const subscription = await getSubscription(subscriptionId);
    return subscription.data?.data;
}

// Cancel subscription
export async function cancelSubscriptionById(subscriptionId: string) {
    initLemonSqueezy();
    return await cancelSubscription(subscriptionId);
}

// Get all products and variants (useful for setup)
export async function getProductsAndVariants() {
    initLemonSqueezy();

    const products = await listProducts();
    const variants = await listVariants();

    return {
        products: products.data?.data || [],
        variants: variants.data?.data || [],
    };
}

// Determine plan type from variant ID
export function getPlanFromVariantId(variantId: string): PlanType {
    if (variantId === process.env.LEMONSQUEEZY_VARIANT_PROFESSIONAL) {
        return 'professional';
    } else if (variantId === process.env.LEMONSQUEEZY_VARIANT_ENTERPRISE) {
        return 'enterprise';
    }
    return 'starter';
}
