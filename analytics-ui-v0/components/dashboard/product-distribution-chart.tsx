"use client"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

// Sample data for Product Distribution donut chart
const distributionData = [
  { name: "Category A", value: 500, color: "#3b82f6" }, // Blue
  { name: "Category B", value: 400, color: "#f59e0b" }, // Orange
  { name: "Category C", value: 700, color: "#ef4444" }, // Red
  { name: "Category D", value: 300, color: "#84cc16" }, // Green
  { name: "Category E", value: 100, color: "#9ca3af" }, // Gray
]

const totalData = distributionData.reduce((sum, item) => sum + item.value, 0)

export function ProductDistributionChart() {
  return (
    <ChartContainer
      config={{
        value: {
          label: "Value",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={distributionData}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
          >
            {distributionData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          {/* Center Label */}
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan x="50%" dy="-0.5em" className="text-sm font-normal fill-gray-600">
              Total Data
            </tspan>
            <tspan x="50%" dy="1.5em" className="text-2xl font-bold fill-black">
              {totalData.toLocaleString()}
            </tspan>
          </text>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
