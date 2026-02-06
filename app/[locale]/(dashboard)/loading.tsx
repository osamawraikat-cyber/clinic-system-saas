export default function Loading() {
    return (
        <div className="space-y-4 p-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
                <div className="lg:col-span-2 h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="lg:col-span-1 h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
        </div>
    )
}
