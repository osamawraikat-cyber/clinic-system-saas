import { lemonSqueezySetup, createCheckout, getSubscription, cancelSubscription, listProducts, listVariants } from '@lemonsqueezy/lemonsqueezy.js';

// Initialize LemonSqueezy SDK
let isInitialized = false;

export function initLemonSqueezy() {
    if (!isInitialized && process.env.LEMONSQUEEZY_API_KEY) {
        lemonSqueezySetup({
            apiKey: process.env.LEMONSQUEEZY_API_KEY,
            onError: (error) => console.error('LemonSqueezy error:', error),
        });
        isInitialized = true;
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

// Create checkout URL for a subscription
export async function createSubscriptionCheckout(options: {
    variantId: string;
    clinicId: string;
    userId: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
}) {
    initLemonSqueezy();

    const storeId = process.env.LEMONSQUEEZY_STORE_ID!;

    const checkout = await createCheckout(storeId, options.variantId, {
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

    return checkout.data?.data?.attributes?.url || null;
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
