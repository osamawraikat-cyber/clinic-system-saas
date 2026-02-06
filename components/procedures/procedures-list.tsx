'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Stethoscope,
    MoreHorizontal,
    Edit,
    Trash2,
    Plus,
    Tag,
    LayoutGrid,
    List as ListIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/hooks/use-currency'
import Link from 'next/link'

interface Procedure {
    id: string
    name: string
    description: string | null
    default_cost: number
    duration_minutes?: number
}

interface ProceduresListProps {
    procedures: Procedure[]
    currency: string
}

export function ProceduresList({ procedures, currency }: ProceduresListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const filteredProcedures = procedures.filter(proc =>
        proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (proc.description && proc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search procedures..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 bg-white dark:bg-slate-950"
                    />
                </div>
                <div className="flex items-center gap-2 border bg-white dark:bg-slate-950 p-1 rounded-md shadow-sm">
                    <Button
                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className="h-8 px-2"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-8 px-2"
                    >
                        <ListIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    <AnimatePresence>
                        {filteredProcedures.map((procedure) => (
                            <motion.div key={procedure.id} variants={item} layout>
                                <Card className="h-full hover:shadow-lg transition-shadow border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                    <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                <Stethoscope className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-base font-semibold line-clamp-1" title={procedure.name}>
                                                    {procedure.name}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground font-medium flex items-center gap-1 mt-1">
                                                    <Tag className="h-3 w-3" />
                                                    Service
                                                </p>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/procedures/${procedure.id}/edit`}>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                            {procedure.description || 'No description provided.'}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 mt-4 pt-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-b-lg">
                                        <span className="text-xs font-medium text-muted-foreground">Standard Rate</span>
                                        <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(procedure.default_cost, currency)}
                                        </span>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                /* List View equivalent structure if needed, simply reusing the previous table style but cleaner */
                <div className="rounded-md border bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
                    {/* Simplified List View Implementation */}
                    <div className="divide-y">
                        {filteredProcedures.map((proc) => (
                            <div key={proc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <Stethoscope className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{proc.name}</p>
                                        <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">{proc.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="font-bold">{formatCurrency(proc.default_cost, currency)}</span>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {filteredProcedures.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No procedures found matching your search.</p>
                </div>
            )}
        </div>
    )
}
