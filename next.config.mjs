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

export default withNextIntl(nextConfig);
