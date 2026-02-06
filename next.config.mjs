import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig = {
    typedRoutes: false,
    typescript: {
        ignoreBuildErrors: true,
    }
};

const withNextIntl = createNextIntlPlugin(
    './i18n/request.ts'
);

const withPWA = (await import("@ducanh2912/next-pwa")).default({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: true,
    disable: false, // Enable PWA in development mode for verification
    workboxOptions: {
        disableDevLogs: true,
    },
});

export default withNextIntl(withPWA(nextConfig));
