'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface RevenueChartProps {
    data: {
        date: string
        amount: number
    }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                        No revenue data available yet.
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: "8px" }}
                                formatter={(value: number | string | Array<number | string> | undefined) => [`$${value || 0}`, "Revenue"]}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#10b981"
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
