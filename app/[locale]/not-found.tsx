import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4 space-y-6">
            <div className="rounded-full bg-slate-100 p-6 shadow-sm">
                <FileQuestion className="h-12 w-12 text-slate-400" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Page Not Found</h2>
                <p className="text-muted-foreground max-w-xs mx-auto">
                    Sorry, we could not find the page you are looking for. It might have been moved or doesn't exist.
                </p>
            </div>
            <Link href="/">
                <Button size="lg" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Home className="h-4 w-4" />
                    Return Home
                </Button>
            </Link>
        </div>
    )
}
