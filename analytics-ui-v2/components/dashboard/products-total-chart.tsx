"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

// Sample data for Products Total 2025 bar chart
const monthlyData = [
  { month: "Jan", value: 5 },
  { month: "Feb", value: 8 },
  { month: "Mar", value: 12 },
  { month: "Apr", value: 18 },
  { month: "May", value: 25 },
  { month: "Jun", value: 35 },
  { month: "Jul", value: 48 },
  { month: "Aug", value: 52 },
  { month: "Sep", value: 58 },
  { month: "Oct", value: 68 },
  { month: "Nov", value: 85 },
  { month: "Dec", value: 100 },
]

export function ProductsTotalChart() {
  return (
    <ChartContainer
      config={{
        value: {
          label: "Products",
          color: "#3b82f6",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6b7280", fontSize: 12 }}
            ticks={[0, 10, 50, 90, 100]}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
