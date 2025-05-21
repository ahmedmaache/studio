
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig
} from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface AnnouncementsByCategoryChartProps {
  data: Array<{ name: string; count: number }>;
}

const chartConfig = {
  count: {
    label: "Announcements",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;


export function AnnouncementsByCategoryChart({ data }: AnnouncementsByCategoryChartProps) {
  if (!data || data.length === 0) {
    return (
        <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No data to display chart.</p>
        </div>
    );
  }
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full h-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
            accessibilityLayer 
            data={data} 
            margin={{ top: 20, right: 20, bottom: 50, left: 5 }} // Increased bottom margin for labels
        >
            <CartesianGrid vertical={false} />
            <XAxis
            dataKey="name"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            interval={0} // Show all labels
            angle={-45} // Angle labels to prevent overlap
            textAnchor="end" // Anchor angled labels correctly
            height={70} // Allocate space for angled labels
            />
            <YAxis allowDecimals={false}/>
            <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
