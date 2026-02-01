'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <html lang="en">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <h1 className="text-4xl font-bold">404 - Not Found</h1>
                    <p className="mt-4">The page you are looking for does not exist.</p>
                    <Link href="/en" className="mt-4 text-blue-600 hover:underline">
                        Go Home
                    </Link>
                </div>
            </body>
        </html>
    );
}
