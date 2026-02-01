export const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
    { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
    { code: 'JOD', symbol: 'JOD', name: 'Jordanian Dinar' },
    { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar' },
    { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar' },
    { code: 'OMR', symbol: 'OMR', name: 'Omani Rial' },
    { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal' },
    { code: 'EGP', symbol: 'EGP', name: 'Egyptian Pound' },
    { code: 'LBP', symbol: 'LBP', name: 'Lebanese Pound' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
] as const

export type CurrencyCode = typeof currencies[number]['code']

export function formatCurrency(amount: number, currencyCode: string = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
    }).format(amount)
}
